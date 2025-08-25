import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Code2,
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Start writing your note...',
    readOnly = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Highlight,
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'rounded-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono text-sm',
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'list-none p-0',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="w-full">
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                    {/* Text Formatting */}
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            title="Bold"
                        >
                            <Bold size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            title="Italic"
                        >
                            <Italic size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive('underline')}
                            title="Underline"
                        >
                            <UnderlineIcon size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            isActive={editor.isActive('strike')}
                            title="Strikethrough"
                        >
                            <Strikethrough size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHighlight().run()}
                            isActive={editor.isActive('highlight')}
                            title="Highlight"
                        >
                            <Highlighter size={16} />
                        </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Headings */}
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            isActive={editor.isActive('heading', { level: 1 })}
                            title="Heading 1"
                        >
                            <Heading1 size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive('heading', { level: 2 })}
                            title="Heading 2"
                        >
                            <Heading2 size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            isActive={editor.isActive('heading', { level: 3 })}
                            title="Heading 3"
                        >
                            <Heading3 size={16} />
                        </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Lists */}
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            title="Bullet List"
                        >
                            <List size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            title="Numbered List"
                        >
                            <ListOrdered size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleTaskList().run()}
                            isActive={editor.isActive('taskList')}
                            title="Task List"
                        >
                            <CheckSquare size={16} />
                        </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Code */}
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            isActive={editor.isActive('code')}
                            title="Inline Code"
                        >
                            <Code size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            isActive={editor.isActive('codeBlock')}
                            title="Code Block"
                        >
                            <Code2 size={16} />
                        </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    {/* Text Alignment */}
                    <div className="flex items-center gap-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            isActive={editor.isActive({ textAlign: 'left' })}
                            title="Align Left"
                        >
                            <AlignLeft size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            isActive={editor.isActive({ textAlign: 'center' })}
                            title="Align Center"
                        >
                            <AlignCenter size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            isActive={editor.isActive({ textAlign: 'right' })}
                            title="Align Right"
                        >
                            <AlignRight size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                            isActive={editor.isActive({ textAlign: 'justify' })}
                            title="Justify"
                        >
                            <AlignJustify size={16} />
                        </ToolbarButton>
                    </div>
                </div>
            )}

            <div className={`${readOnly
                    ? 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700'
                } ${isFocused ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}>
                <EditorContent
                    editor={editor}
                    className="prose prose-gray dark:prose-invert max-w-none"
                />
            </div>
        </div>
    );
};

export default RichTextEditor;
