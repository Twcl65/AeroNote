import React, { useState } from 'react';
import { useDrag } from '@use-gesture/react';
import {
    Pin,
    Lock,
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Calendar,
    Tag
} from 'lucide-react';
import { Note } from '../../store/noteStore';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
    note: Note;
    isSelected: boolean;
    onSelect?: (id: string) => void;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onPin: (id: string) => void;
    onUnpin: (id: string) => void;
    viewMode: 'grid' | 'list';
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    isSelected,
    onSelect,
    onEdit,
    onDuplicate,
    onDelete,
    onPin,
    onUnpin,
    viewMode,
}) => {
    const [showActions, setShowActions] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);

    const bind = useDrag(
        ({ movement: [x], direction: [dx], velocity: [vx], cancel, canceled }) => {
            if (canceled) return;

            if (dx < 0 && Math.abs(x) > 100 && vx > 0.5) {
                onDelete(note.id);
                return;
            }

            const clampedX = Math.max(-80, Math.min(0, x));
            setSwipeOffset(clampedX);
        },
        {
            axis: 'x',
            threshold: 10,
        }
    );

    const handleContentClick = () => {
        onEdit(note.id);
    };

    const handlePinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (note.isPinned) {
            onUnpin(note.id);
        } else {
            onPin(note.id);
        }
    };

    const toggleActions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(!showActions);
    };

    const truncateContent = (content: string, maxLength: number) => {
        const textContent = content.replace(/<[^>]*>/g, '');
        if (textContent.length <= maxLength) return textContent;
        return textContent.substring(0, maxLength) + '...';
    };

    const cardClasses = `
        relative border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer group
        ${isSelected ? 'ring-2 ring-primary-500 shadow-lg border-primary-400 dark:border-primary-500' : 'hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-500'}
        ${note.color?.bg || 'bg-white dark:bg-gray-800'}
        ${note.isPinned ? 'border-primary-400 dark:border-gray-500 shadow-md' : ''}
    `;

    const contentClasses = viewMode === 'grid'
        ? 'p-4 h-16 sm:h-18 lg:h-20 overflow-hidden'
        : 'p-4 flex-1';

    return (
        <div
            className={cardClasses}
            style={{ transform: `translateX(${swipeOffset}px)` }}
            {...bind()}
            onClick={handleContentClick}
        >
            {/* Swipe Delete Indicator */}
            {swipeOffset < -20 && (
                <div className="absolute right-0 top-0 bottom-0 w-14 sm:w-16 bg-red-500 flex items-center justify-center text-white">
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </div>
            )}

            {/* Header Section - Compact Design */}
            <div className="px-4 pt-4 pb-4">
                <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold truncate text-sm sm:text-base mb-1 leading-tight ${note.color?.text || 'text-gray-900 dark:text-gray-100'}`}>
                            {note.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={10} className="text-gray-400" />
                            <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
                            {note.version > 1 && (
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs">
                                    v{note.version}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                        {note.isPinned && (
                            <button
                                onClick={handlePinClick}
                                className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-800 rounded transition-colors"
                                title="Unpin note"
                            >
                                <Pin size={12} className="fill-current" />
                            </button>
                        )}

                        {note.isProtected && (
                            <div className="p-1 text-amber-600" title="Password protected">
                                <Lock size={12} />
                            </div>
                        )}

                        <button
                            onClick={toggleActions}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="More actions"
                        >
                            <MoreVertical size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section - Compact */}
            <div className={contentClasses}>
                <div
                    className={`text-xs leading-relaxed line-clamp-2 ${note.color?.text || 'text-gray-600 dark:text-gray-300'}`}
                    title={note.isProtected ? "Content is password protected" : ""}
                    dangerouslySetInnerHTML={{
                        __html: note.isProtected ? '••••••••••••••••' : truncateContent(note.content, viewMode === 'grid' ? (window.innerWidth < 640 ? 60 : 80) : 150)
                    }}
                />
            </div>

            {/* Tags Section - Compact */}
            {note.tags.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag size={10} className="text-gray-400" />
                        {note.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                        {note.tags.length > 2 && (
                            <span className="text-gray-400 text-xs">
                                +{note.tags.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions Menu */}
            {showActions && (
                <div className="absolute top-12 right-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg z-10 min-w-[140px] sm:min-w-[160px]">
                    <div className="py-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(note.id);
                                setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(note.id);
                                setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Copy size={14} className="sm:w-4 sm:h-4" />
                            Duplicate
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPin(note.id);
                                setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Pin size={14} className="sm:w-4 sm:h-4" />
                            {note.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                    <div className="py-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note.id);
                                setShowActions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteCard;
