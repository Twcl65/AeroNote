import React, { useState, useEffect } from 'react';
import { Save, Tag, Lock, Unlock, X } from 'lucide-react';
import RichTextEditor from '../Editor/RichTextEditor';
import { Note } from '../../store/noteStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NoteDialogProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Note>) => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
    note,
    isOpen,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState('');
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

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags([...note.tags]);
            setIsProtected(note.isProtected);
            setPassword(note.password || '');
            setSelectedColor(note.color);
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
            color: selectedColor,
        };

        onSave(updates);
        onClose();
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

    if (!isOpen || !note) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-300 dark:border-gray-600 shadow-xl rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center gap-3">
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note title..."
                            className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSave}
                            className="flex items-center gap-2 text-white"
                            style={{ backgroundColor: 'rgb(2 132 199)' }}
                        >
                            <Save className="w-4 h-4" />
                            Save
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
                <div className="flex flex-col h-[calc(90vh-8rem)]">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center gap-4">
                            {/* Tags */}
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <div className="flex items-center gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 text-sm border border-gray-300 dark:border-gray-500"
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
                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag..."
                                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        />
                                        <Button
                                            onClick={handleAddTag}
                                            size="sm"
                                            className="px-2 py-1 text-sm text-white"
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
                                    className={`flex items-center gap-2 ${isProtected
                                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    {isProtected ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {isProtected ? 'Protected' : 'Public'}
                                </Button>
                            </div>

                            {/* Color Picker */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                                <div className="flex items-center gap-1">
                                    {[
                                        { name: 'Default', bg: 'bg-white dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100' },
                                        { name: 'Red', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-900 dark:text-red-100' },
                                        { name: 'Blue', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-100' },
                                        { name: 'Green', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-900 dark:text-green-100' },
                                        { name: 'Yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-900 dark:text-yellow-100' },
                                        { name: 'Purple', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-900 dark:text-purple-100' },
                                        { name: 'Pink', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-900 dark:text-pink-100' },
                                        { name: 'Orange', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-900 dark:text-orange-100' },
                                        { name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-900 dark:text-teal-100' },
                                        { name: 'Indigo', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-900 dark:text-indigo-100' }
                                    ].map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor.name === color.name
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Ctrl + Enter to save
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
                                <Lock className="w-4 h-4 text-amber-600" />
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

export default NoteDialog;
