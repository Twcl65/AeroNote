import React, { useState } from 'react';
import { Save, Tag, Lock, Unlock, X } from 'lucide-react';
import RichTextEditor from '../Editor/RichTextEditor';
import { Note } from '../../store/noteStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CreateNoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'>) => void;
}

const CreateNoteDialog: React.FC<CreateNoteDialogProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState('Untitled Note');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isProtected, setIsProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [selectedColor, setSelectedColor] = useState({
        name: 'Default',
        bg: 'bg-white dark:bg-gray-800',
        text: 'text-gray-900 dark:text-gray-100'
    });

    const handleSave = () => {
        const noteData = {
            title: title.trim() || 'Untitled Note',
            content,
            tags,
            isPinned: false,
            isProtected,
            password: isProtected ? password : undefined,
            color: selectedColor,
        };

        onSave(noteData);
        onClose();

        setTitle('Untitled Note');
        setContent('');
        setTags([]);
        setIsProtected(false);
        setPassword('');
        setSelectedColor({
            name: 'Default',
            bg: 'bg-white dark:bg-gray-800',
            text: 'text-gray-900 dark:text-gray-100'
        });
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden border border-gray-300 dark:border-gray-600 shadow-xl rounded-lg">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note title..."
                            className="text-lg sm:text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-w-0 flex-1"
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            onClick={handleSave}
                            className="flex items-center gap-2 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
                            style={{ backgroundColor: 'rgb(2 132 199)' }}
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Note</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="icon"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col h-[calc(85vh-8rem)] sm:h-[calc(90vh-600)]">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* Tags */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 min-w-0">
                                        <Input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag..."
                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        />
                                        <Button
                                            onClick={handleAddTag}
                                            size="sm"
                                            className="px-2 py-1 text-sm text-white flex-shrink-0"
                                            style={{ backgroundColor: 'rgb(2 132 199)' }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Protection Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setIsProtected(!isProtected)}
                                    variant="outline"
                                    size="sm"
                                    className={`flex items-center gap-2 text-sm ${isProtected
                                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    {isProtected ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{isProtected ? 'Protected' : 'Public'}</span>
                                    <span className="sm:hidden">{isProtected ? 'Locked' : 'Open'}</span>
                                </Button>
                            </div>

                            {/* Color Picker */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {[
                                        { name: 'Default', bg: 'bg-white dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100' },
                                        { name: 'Red', bg: 'bg-red-200 dark:bg-red-600', text: 'text-red-900 dark:text-red-100' },
                                        { name: 'Blue', bg: 'bg-blue-200 dark:bg-blue-600', text: 'text-blue-900 dark:text-blue-100' },
                                        { name: 'Green', bg: 'bg-green-200 dark:bg-green-600', text: 'text-green-900 dark:text-green-100' },
                                        { name: 'Yellow', bg: 'bg-yellow-200 dark:bg-yellow-600', text: 'text-yellow-900 dark:text-yellow-100' },
                                        { name: 'Purple', bg: 'bg-purple-200 dark:bg-purple-600', text: 'text-purple-900 dark:text-purple-100' },
                                        { name: 'Pink', bg: 'bg-pink-200 dark:bg-pink-600', text: 'text-pink-900 dark:text-pink-100' },
                                        { name: 'Orange', bg: 'bg-orange-200 dark:bg-orange-600', text: 'text-orange-900 dark:text-orange-100' },
                                        { name: 'Teal', bg: 'bg-teal-200 dark:bg-teal-600', text: 'text-teal-900 dark:text-teal-100' },
                                        { name: 'Indigo', bg: 'bg-indigo-200 dark:bg-indigo-600', text: 'text-indigo-900 dark:text-indigo-100' }
                                    ].map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${selectedColor.name === color.name
                                                ? 'border-gray-800 dark:border-gray-200 scale-110'
                                                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                                } ${color.bg}`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Keyboard Shortcut */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
                            <span className="hidden sm:inline">Ctrl + Enter to create</span>
                            <span className="sm:hidden">Ctrl+Enter</span>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 overflow-hidden">
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your note..."
                        />
                    </div>

                    {/* Password Input (if protected) */}
                    {isProtected && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password to protect this note..."
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateNoteDialog;
