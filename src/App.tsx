import React, { useState, useEffect } from 'react';
import { Search, LogOut, Plus, Grid, List, Sun, Moon, Menu, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import NoteCard from './components/Note/NoteCard';
import CreateNoteDialog from './components/Note/CreateNoteDialog';
import NoteDialog from './components/Note/NoteDialog';
import PasswordDialog from './components/Note/PasswordDialog';
import StatsCards from './components/Stats/StatsCards';
import LandingPage from './components/Landing/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNoteStore } from './store/noteStore';
import { Note } from './store/noteStore';
import { Button } from './components/ui/button';
import { notesService } from './services/notesService';
import { Routes, Route, Navigate } from 'react-router-dom';
import NoteEditor from './components/Note/NoteEditor';

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
            })
            .catch((registrationError) => {
            });
    });
}

const AuthTest: React.FC = () => {
    const { user, session, loading, error } = useAuth();

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">Auth State</h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                            <div><strong>Error:</strong> {error || 'None'}</div>
                            <div><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</div>
                            <div><strong>Session:</strong> {session ? 'Active' : 'None'}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">User Details</h2>
                        {user ? (
                            <div className="space-y-2 text-sm">
                                <div><strong>ID:</strong> {user.id}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                                <div><strong>Metadata:</strong> {JSON.stringify(user.user_metadata)}</div>
                            </div>
                        ) : (
                            <div className="text-gray-500">No user logged in</div>
                        )}
                    </div>
                </div>

                <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Console Logs</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check the browser console for detailed authentication logs and any errors.
                    </p>
                </div>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { user, signOut, loading, error } = useAuth();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [noteFilter, setNoteFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string>('');
    const [pendingProtectedNote, setPendingProtectedNote] = useState<Note | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'shared' | 'settings'>('dashboard');
    const { notes, addNote, updateNote, deleteNote, pinNote, unpinNote, duplicateNote, setNotes } = useNoteStore();

    useEffect(() => {
        if (user) {
            loadNotesFromSupabase();
        }
    }, [user]);

    useEffect(() => {
        const { migrateNotes } = useNoteStore.getState();
        migrateNotes();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    const loadNotesFromSupabase = async () => {
        if (!user) return;

        try {
            const supabaseNotes = await notesService.getNotes(user.id);
            setNotes(supabaseNotes);
        } catch (error) {
            toast.error('Failed to load notes');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Configuration Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">To fix this:</p>
                        <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                            <li>Create a <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.env</code> file in your project root</li>
                            <li>Add your Supabase credentials</li>
                            <li>Restart the development server</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <LandingPage
                onLoginSuccess={() => { }}
            />
        );
    }

    const filteredNotes = notes
        .filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            let matchesStatus = true;
            switch (noteFilter) {
                case 'not-protected':
                    matchesStatus = !note.isProtected;
                    break;
                case 'protected':
                    matchesStatus = note.isProtected;
                    break;
                case 'pinned':
                    matchesStatus = note.isPinned;
                    break;
                default:
                    matchesStatus = true;
            }

            if (tagFilter && !note.tags.includes(tagFilter)) {
                return false;
            }

            return matchesStatus;
        })
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    const sortedNotes = notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const handleCreateNote = () => {
        setIsCreateDialogOpen(true);
    };

    const handleEditNote = (note: Note) => {
        if (note.isProtected) {
            setPendingProtectedNote(note);
            setIsPasswordDialogOpen(true);
        } else {
            setSelectedNote(note);
            setIsEditDialogOpen(true);
        }
    };

    const handleSaveNewNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'>) => {
        if (!user) return;

        try {
            const newNote = await notesService.createNote(user.id, noteData);
            if (newNote) {
                addNote(newNote);
                setIsCreateDialogOpen(false);
                toast.success('Note created successfully!');
            } else {
                toast.error('Failed to create note');
            }
        } catch (error) {
            toast.error('Failed to create note');
        }
    };

    const handleSaveEditNote = async (noteData: Partial<Note>) => {
        if (!selectedNote || !user) return;

        try {
            const updatedNote = await notesService.updateNote(selectedNote.id, noteData);
            if (updatedNote) {
                updateNote(selectedNote.id, updatedNote);
                setIsEditDialogOpen(false);
                setSelectedNote(null);
                toast.success('Note updated successfully!');
            } else {
                toast.error('Failed to update note');
            }
        } catch (error) {
            toast.error('Failed to update note');
        }
    };

    const handlePasswordSubmit = (password: string): boolean => {
        if (pendingProtectedNote) {
            setSelectedNote(pendingProtectedNote);
            setIsPasswordDialogOpen(false);
            setIsEditDialogOpen(true);
            setPendingProtectedNote(null);
            toast.success('Password accepted! Opening note...');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        signOut();
        toast.success('Logged out successfully!');
    };

    const handleFilterChange = (filter: string) => {
        setNoteFilter(filter);
        setTagFilter('');
        if (filter !== 'all') {
            toast.success(`Filtered to show ${filter.replace('-', ' ')} notes`);
        } else {
            toast.success('Showing all notes');
        }
    };

    const handleTagFilterChange = (tag: string) => {
        setTagFilter(tag);
        if (tag) {
            toast.success(`Filtered to show notes with tag: ${tag}`);
        } else {
            toast.success('Showing all tags');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const success = await notesService.deleteNote(noteId);
            if (success) {
                deleteNote(noteId);
                toast.success('Note deleted successfully!');
            } else {
                toast.error('Failed to delete note');
            }
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    const handleDuplicateNote = async (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (!note || !user) return;

        try {
            const duplicatedNote = await notesService.duplicateNote(user.id, note);
            if (duplicatedNote) {
                addNote(duplicatedNote);
                toast.success('Note duplicated successfully!');
            } else {
                toast.error('Failed to duplicate note');
            }
        } catch (error) {
            toast.error('Failed to duplicate note');
        }
    };

    const handleTogglePin = async (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (!note || !user) return;

        try {
            const updatedNote = await notesService.updateNote(noteId, { isPinned: !note.isPinned });
            if (updatedNote) {
                if (note.isPinned) {
                    unpinNote(noteId);
                } else {
                    pinNote(noteId);
                }
                toast.success(note.isPinned ? 'Note unpinned!' : 'Note pinned!');
            } else {
                toast.error('Failed to update note');
            }
        } catch (error) {
            toast.error('Failed to update note');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                AeroNote
                            </h1>
                        </div>

                        <div className="hidden lg:block">
                            <div className="ml-6 xl:ml-10 flex items-center space-x-4 xl:space-x-8">
                                <div className="flex items-center space-x-1">
                                    {[
                                        { id: 'dashboard', label: 'Dashboard' },
                                        { id: 'notes', label: 'Notes' },
                                        { id: 'shared', label: 'Shared N' },
                                        { id: 'settings', label: 'Settings' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-600'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => document.documentElement.classList.toggle('dark')}
                                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
                                    title="Toggle theme"
                                >
                                    <Sun className="w-4 h-4 text-yellow-500 dark:hidden" />
                                    <Moon className="w-4 h-4 text-blue-500 hidden dark:block" />
                                </button>

                                <Button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-white"
                                    style={{ backgroundColor: 'rgb(255 0 0)' }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>

                        <div className="hidden md:block lg:hidden">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
                                    />
                                </div>

                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => document.documentElement.classList.toggle('dark')}
                                    className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
                                    title="Toggle theme"
                                >
                                    <Sun className="w-4 h-4 text-yellow-500 dark:hidden" />
                                    <Moon className="w-4 h-4 text-blue-500 hidden dark:block" />
                                </button>

                                <Button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm text-white"
                                    style={{ backgroundColor: 'rgb(255 0 0)' }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                        <div className="px-3 py-3 space-y-3">
                            <div className="space-y-2">
                                {[
                                    { id: 'dashboard', label: 'Dashboard' },
                                    { id: 'notes', label: 'Notes' },
                                    { id: 'shared', label: 'Shared Notes' },
                                    { id: 'settings', label: 'Settings' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id as any);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => document.documentElement.classList.toggle('dark')}
                                className="w-full px-3 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
                                title="Toggle theme"
                            >
                                <Sun className="w-4 h-4 text-yellow-500 dark:hidden" />
                                <Moon className="w-4 h-4 text-blue-500 hidden dark:block" />
                                <span>Toggle Theme</span>
                            </button>

                            <Button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 text-sm text-white"
                                style={{ backgroundColor: 'rgb(255 0 0)' }}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
                <Routes>
                    <Route path="/" element={
                        <div>
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Welcome back, {user?.user_metadata?.first_name || 'User'}!
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You have {notes.length} notes. Start organizing your thoughts!
                                        </p>
                                    </div>

                                    <StatsCards notes={notes} />


                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="relative w-full sm:flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search notes..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 sm:py-3 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleCreateNote}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white text-sm sm:text-base py-2 px-4 flex-shrink-0"
                                            style={{ backgroundColor: 'rgb(37 99 235)' }}
                                        >
                                            <Plus className="w-4 h-5 sm:w-5 sm:h-5" />
                                            New Note
                                        </Button>
                                    </div>

                                    <div className="space-y-4">

                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter:</span>
                                                    <select
                                                        value={noteFilter}
                                                        onChange={(e) => handleFilterChange(e.target.value)}
                                                        className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    >
                                                        <option value="all">All Notes</option>
                                                        <option value="pinned">Pinned</option>
                                                        <option value="recent">Recent</option>
                                                        <option value="protected">Protected</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Tag:</span>
                                                    <select
                                                        value={tagFilter}
                                                        onChange={(e) => handleTagFilterChange(e.target.value)}
                                                        className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    >
                                                        <option value="">All Tags</option>
                                                        {Array.from(new Set(notes.flatMap(note => note.tags || []))).map(tag => (
                                                            <option key={tag} value={tag}>{tag}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                                                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    <span>Pinned notes first</span>
                                                </div>

                                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                                    <button
                                                        onClick={() => setViewMode('grid')}
                                                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                                        title="Grid View"
                                                    >
                                                        <Grid className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode('list')}
                                                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                                                        title="List View"
                                                    >
                                                        <List className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {filteredNotes.length > 0 ? (
                                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4' : 'space-y-3'}>
                                            {filteredNotes.map((note) => (
                                                <NoteCard
                                                    key={note.id}
                                                    note={note}
                                                    isSelected={false}
                                                    onEdit={() => handleEditNote(note)}
                                                    onDelete={() => handleDeleteNote(note.id)}
                                                    onDuplicate={() => handleDuplicateNote(note.id)}
                                                    onPin={() => handleTogglePin(note.id)}
                                                    onUnpin={() => handleTogglePin(note.id)}
                                                    viewMode={viewMode}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 sm:py-12">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                {searchQuery || noteFilter !== 'all' || tagFilter ? 'No notes found' : 'No notes yet'}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 px-4">
                                                {searchQuery || noteFilter !== 'all' || tagFilter
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Create your first note to get started!'}
                                            </p>

                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'shared' && (
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Shared Notes
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Share and collaborate on notes with others. Coming soon!
                                    </p>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Settings
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Manage your account preferences
                                        </p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Account Information
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</span>
                                                <span className="text-sm text-gray-900 dark:text-white">{user?.email}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</span>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Created</span>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    } />
                    <Route path="/notes/:id" element={<NoteEditor note={null} onSave={() => { }} onClose={() => { }} onExport={() => { }} onImport={() => { }} />} />
                    <Route path="/stats" element={<StatsCards notes={notes} />} />
                    <Route path="/test" element={<AuthTest />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {activeTab === 'notes' && (
                <button
                    onClick={handleCreateNote}
                    className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 lg:hidden w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
                    style={{ backgroundColor: 'rgb(2 132 199)' }}
                >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            )}

            <CreateNoteDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={handleSaveNewNote}
            />

            <NoteDialog
                note={selectedNote}
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false);
                    setSelectedNote(null);
                }}
                onSave={handleSaveEditNote}
            />

            <PasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={() => {
                    setIsPasswordDialogOpen(false);
                    setPendingProtectedNote(null);
                }}
                onPasswordSubmit={handlePasswordSubmit}
                noteTitle={pendingProtectedNote?.title || ''}
            />

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App