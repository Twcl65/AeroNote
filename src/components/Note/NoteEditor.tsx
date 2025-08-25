import React, { useState, useEffect } from 'react';
import {
    Save,
    Lock,
    Unlock,
    Tag,
    X,
    History,
    Download,
    Upload
} from 'lucide-react';
import RichTextEditor from '../Editor/RichTextEditor';
import { Note, NoteVersion } from '../../store/noteStore';
import { formatDistanceToNow } from 'date-fns';

interface NoteEditorProps {
    note: Note | null;
    onSave: (updates: Partial<Note>) => void;
    onClose: () => void;
    onExport: () => void;
    onImport: (jsonData: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
    note,
    onSave,
    onClose,
    onExport,
    onImport,
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isProtected, setIsProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState('');

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags([...note.tags]);
            setIsProtected(note.isProtected);
            setPassword(note.password || '');
        }
    }, [note]);

    const handleSave = () => {
        if (!note) return;

        const updates: Partial<Note> = {
            title,
            content,
            tags,
            isProtected,
            password: isProtected ? password : undefined,
        };

        onSave(updates);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    const handleImport = () => {
        if (importData.trim()) {
            onImport(importData);
            setShowImportModal(false);
            setImportData('');
        }
    };

    if (!note) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Edit Note
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="btn-ghost p-2"
                        title="Version History"
                    >
                        <History size={18} />
                    </button>

                    <button
                        onClick={onExport}
                        className="btn-ghost p-2"
                        title="Export Note"
                    >
                        <Download size={18} />
                    </button>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className="btn-ghost p-2"
                        title="Import Note"
                    >
                        <Upload size={18} />
                    </button>

                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        title="Save (Ctrl+Enter)"
                    >
                        <Save size={18} />
                        Save
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input text-lg font-semibold"
                            placeholder="Note title..."
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="input flex-1"
                                placeholder="Add a tag..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <button
                                onClick={handleAddTag}
                                className="btn-secondary px-3 py-2"
                            >
                                <Tag size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-200"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Protection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={isProtected}
                                onChange={(e) => setIsProtected(e.target.checked)}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            Password Protect
                        </label>
                        {isProtected && (
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input mt-2"
                                placeholder="Enter password..."
                            />
                        )}
                    </div>

                    {/* Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                        </label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your note..."
                        />
                    </div>
                </div>
            </div>

            {/* Version History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Version History
                            </h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-3">
                                {note.history.map((version) => (
                                    <div
                                        key={version.id}
                                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Version {version.version}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div
                                            className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: version.content }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Import Note
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
        </div>
    );
};

export default NoteEditor;
