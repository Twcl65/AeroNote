import React, { useState } from 'react';
import {
    Search,
    Grid,
    List,
    Sun,
    Moon,
    Menu,
    X,
    Home,
    Star,
    Tag,
    Archive,
    Trash2,
    Settings,
    Download,
    Upload
} from 'lucide-react';
import { useNoteStore } from '../../store/noteStore';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const {
        searchQuery,
        setSearchQuery,
        selectedTags,
        setSelectedTags,
        viewMode,
        setViewMode,
        isDarkMode,
        toggleDarkMode,
        getAllTags,
        exportNotes,
        importNotes,
    } = useNoteStore();

    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState('');
    const [activeSection, setActiveSection] = useState('all');

    const allTags = getAllTags();

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleImport = () => {
        if (importData.trim()) {
            importNotes(importData);
            setShowImportModal(false);
            setImportData('');
        }
    };

    const handleExport = () => {
        const data = exportNotes();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aeronote-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const sidebarClasses = `
    fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
    transition-all duration-300 ease-in-out z-40
    ${isCollapsed ? 'w-16' : 'w-64'}
  `;

    const contentClasses = `
    flex flex-col h-full
    ${isCollapsed ? 'items-center' : ''}
  `;

    return (
        <>
            <div className={sidebarClasses}>
                <div className={contentClasses}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'flex-col gap-2' : ''
                        }`}>
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                AeroNote
                            </h1>
                        )}
                        <button
                            onClick={onToggle}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                        </button>
                    </div>

                    {/* Search */}
                    {!isCollapsed && (
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notes..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {/* Quick Actions */}
                            <div className={`space-y-1 ${isCollapsed ? 'text-center' : ''}`}>
                                <button
                                    onClick={() => setActiveSection('all')}
                                    className={`sidebar-item w-full ${activeSection === 'all' ? 'active' : ''}`}
                                >
                                    <Home size={20} />
                                    {!isCollapsed && <span>All Notes</span>}
                                </button>

                                <button
                                    onClick={() => setActiveSection('pinned')}
                                    className={`sidebar-item w-full ${activeSection === 'pinned' ? 'active' : ''}`}
                                >
                                    <Star size={20} />
                                    {!isCollapsed && <span>Pinned</span>}
                                </button>

                                <button
                                    onClick={() => setActiveSection('tags')}
                                    className={`sidebar-item w-full ${activeSection === 'tags' ? 'active' : ''}`}
                                >
                                    <Tag size={20} />
                                    {!isCollapsed && <span>Tags</span>}
                                </button>
                            </div>

                            {/* View Mode Toggle */}
                            {!isCollapsed && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            View Mode
                                        </span>
                                    </div>
                                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <Grid size={16} />
                                            Grid
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${viewMode === 'list'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <List size={16} />
                                            List
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {!isCollapsed && allTags.length > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tags
                                        </span>
                                        <button
                                            onClick={() => setSelectedTags([])}
                                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {allTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`sidebar-item w-full justify-between ${selectedTags.includes(tag) ? 'active' : ''
                                                    }`}
                                            >
                                                <span className="truncate">{tag}</span>
                                                {selectedTags.includes(tag) && (
                                                    <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full flex-shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className={`space-y-2 ${isCollapsed ? 'text-center' : ''}`}>
                            <button
                                onClick={toggleDarkMode}
                                className="sidebar-item w-full"
                                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                {!isCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                            </button>

                            {!isCollapsed && (
                                <>
                                    <button
                                        onClick={handleExport}
                                        className="sidebar-item w-full"
                                        title="Export all notes"
                                    >
                                        <Download size={20} />
                                        <span>Export</span>
                                    </button>

                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="sidebar-item w-full"
                                        title="Import notes"
                                    >
                                        <Upload size={20} />
                                        <span>Import</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Import Notes
                            </h3>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                                className="input h-32 resize-none font-mono text-sm"
                                placeholder="Paste JSON data here..."
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="btn-primary"
                                >
                                    Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
