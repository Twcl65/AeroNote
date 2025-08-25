import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isProtected: boolean;
    password?: string;
    color: {
        name: string;
        bg: string;
        text: string;
    };
    createdAt: Date;
    updatedAt: Date;
    version: number;
    history: NoteVersion[];
}

export interface NoteVersion {
    id: string;
    content: string;
    timestamp: Date;
    version: number;
}

export interface NoteStore {
    notes: Note[];
    selectedNoteId: string | null;
    searchQuery: string;
    selectedTags: string[];
    viewMode: 'grid' | 'list';
    isDarkMode: boolean;
    sidebarCollapsed: boolean;

    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'>) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    duplicateNote: (id: string) => void;
    pinNote: (id: string) => void;
    unpinNote: (id: string) => void;
    protectNote: (id: string, password: string) => void;
    unprotectNote: (id: string) => void;
    selectNote: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedTags: (tags: string[]) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    getFilteredNotes: () => Note[];
    getAllTags: () => string[];
    exportNotes: () => string;
    importNotes: (jsonData: string) => void;
    migrateNotes: () => void;
    setNotes: (notes: Note[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialNote = (): Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'> => ({
    title: 'Untitled Note',
    content: '',
    tags: [],
    isPinned: false,
    isProtected: false,
    color: {
        name: 'Default',
        bg: 'bg-white dark:bg-gray-800',
        text: 'text-gray-900 dark:text-gray-100'
    },
});

export const useNoteStore = create<NoteStore>()(
    persist(
        (set, get) => ({
            notes: [],
            selectedNoteId: null,
            searchQuery: '',
            selectedTags: [],
            viewMode: 'grid',
            isDarkMode: false,
            sidebarCollapsed: false,

            addNote: (noteData) => {
                const now = new Date();
                const newNote: Note = {
                    ...noteData,
                    id: generateId(),
                    createdAt: now,
                    updatedAt: now,
                    version: 1,
                    history: [{
                        id: generateId(),
                        content: noteData.content,
                        timestamp: now,
                        version: 1,
                    }],
                };

                set((state) => ({
                    notes: [newNote, ...state.notes],
                    selectedNoteId: newNote.id,
                }));
            },

            migrateNotes: () => {
                set((state) => ({
                    notes: state.notes.map(note => ({
                        ...note,
                        color: note.color || {
                            name: 'Default',
                            bg: 'bg-white dark:bg-gray-800',
                            text: 'text-gray-900 dark:text-gray-100'
                        }
                    }))
                }));
            },

            updateNote: (id, updates) => {
                set((state) => ({
                    notes: state.notes.map((note) => {
                        if (note.id === id) {
                            const updatedNote = {
                                ...note,
                                ...updates,
                                updatedAt: new Date(),
                                version: note.version + 1,
                            };

                                            if (updates.content && updates.content !== note.content) {
                                updatedNote.history = [
                                    {
                                        id: generateId(),
                                        content: updates.content,
                                        timestamp: new Date(),
                                        version: updatedNote.version,
                                    },
                                    ...note.history.slice(0, 9),
                                ];
                            }

                            return updatedNote;
                        }
                        return note;
                    }),
                }));
            },

            deleteNote: (id) => {
                set((state) => ({
                    notes: state.notes.filter((note) => note.id !== id),
                    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
                }));
            },

            duplicateNote: (id) => {
                const note = get().notes.find((n) => n.id === id);
                if (note) {
                    const duplicatedNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'> = {
                        title: `${note.title} (Copy)`,
                        content: note.content,
                        tags: [...note.tags],
                        isPinned: false,
                        isProtected: false,
                        color: note.color,
                    };
                    get().addNote(duplicatedNote);
                }
            },

            pinNote: (id) => {
                get().updateNote(id, { isPinned: true });
            },

            unpinNote: (id) => {
                get().updateNote(id, { isPinned: false });
            },

            protectNote: (id, password) => {
                get().updateNote(id, { isProtected: true, password });
            },

            unprotectNote: (id) => {
                get().updateNote(id, { isProtected: false, password: undefined });
            },

            selectNote: (id) => {
                set({ selectedNoteId: id });
            },

            setSearchQuery: (query) => {
                set({ searchQuery: query });
            },

            setSelectedTags: (tags) => {
                set({ selectedTags: tags });
            },

            setViewMode: (mode) => {
                set({ viewMode: mode });
            },

            toggleDarkMode: () => {
                set((state) => ({ isDarkMode: !state.isDarkMode }));
            },

            toggleSidebar: () => {
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
            },

            addTag: (tag) => {
                set((state) => ({
                    notes: state.notes.map((note) => {
                        if (note.id === state.selectedNoteId && !note.tags.includes(tag)) {
                            return { ...note, tags: [...note.tags, tag] };
                        }
                        return note;
                    }),
                }));
            },

            removeTag: (tag) => {
                set((state) => ({
                    notes: state.notes.map((note) => ({
                        ...note,
                        tags: note.tags.filter((t) => t !== tag),
                    })),
                }));
            },

            getFilteredNotes: () => {
                const { notes, searchQuery, selectedTags } = get();

                return notes.filter((note) => {
                    const matchesSearch = !searchQuery ||
                        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

                    const matchesTags = selectedTags.length === 0 ||
                        selectedTags.some(tag => note.tags.includes(tag));

                    return matchesSearch && matchesTags;
                }).sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                });
            },

            getAllTags: () => {
                const tags = new Set<string>();
                get().notes.forEach((note) => {
                    note.tags.forEach((tag) => tags.add(tag));
                });
                return Array.from(tags).sort();
            },

            exportNotes: () => {
                const { notes } = get();
                const exportData = {
                    notes: notes.map(note => ({
                        ...note,
                        createdAt: note.createdAt.toISOString(),
                        updatedAt: note.updatedAt.toISOString(),
                        history: note.history.map(h => ({
                            ...h,
                            timestamp: h.timestamp.toISOString(),
                        })),
                    })),
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                };
                return JSON.stringify(exportData, null, 2);
            },

            importNotes: (jsonData) => {
                try {
                    const importData = JSON.parse(jsonData);
                    if (importData.notes && Array.isArray(importData.notes)) {
                        const importedNotes = importData.notes.map((note: any) => ({
                            ...note,
                            id: generateId(),
                            createdAt: new Date(note.createdAt),
                            updatedAt: new Date(note.updatedAt),
                            color: note.color || {
                                name: 'Default',
                                bg: 'bg-white dark:bg-gray-800',
                                text: 'text-gray-900 dark:text-gray-100'
                            },
                            history: note.history?.map((h: any) => ({
                                ...h,
                                id: generateId(),
                                timestamp: new Date(h.timestamp),
                            })) || [],
                        }));

                        set((state) => ({
                            notes: [...state.notes, ...importedNotes],
                        }));
                    }
                } catch (error) {
                }
            },

            setNotes: (notes) => {
                set({ notes });
            },
        }),
        {
            name: 'aeronote-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                notes: state.notes,
                isDarkMode: state.isDarkMode,
                viewMode: state.viewMode,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);
