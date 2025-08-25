import { supabase } from '../lib/supabase';
import { Note } from '../store/noteStore';

export interface DatabaseNote {
    id: string;
    user_id: string;
    title: string;
    content: string;
    tags: string[];
    is_protected: boolean;
    password_hash?: string;
    is_pinned: boolean;
    color?: {
        bg: string;
        text: string;
    };
    version: number;
    created_at: string;
    updated_at: string;
}

const convertDbNoteToNote = (dbNote: DatabaseNote): Note => ({
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    tags: dbNote.tags || [],
    isProtected: dbNote.is_protected,
    password: dbNote.password_hash || '',
    isPinned: dbNote.is_pinned,
    color: {
        name: 'Custom',
        bg: dbNote.color?.bg || 'bg-white dark:bg-gray-800',
        text: dbNote.color?.text || 'text-gray-900 dark:text-gray-100'
    },
    version: dbNote.version || 1,
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    history: [{
        id: `history-${dbNote.id}`,
        content: dbNote.content,
        timestamp: new Date(dbNote.updated_at),
        version: dbNote.version || 1
    }]
});

export const notesService = {
    async getNotes(userId: string): Promise<Note[]> {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', userId)
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) {
                return [];
            }

            return (data || []).map(convertDbNoteToNote);
        } catch (error) {
            return [];
        }
    },

    async createNote(userId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'history'>): Promise<Note | null> {
        try {
            const { data, error } = await supabase
                .from('notes')
                .insert([
                    {
                        user_id: userId,
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        is_protected: note.isProtected,
                        password_hash: note.password || null,
                        is_pinned: note.isPinned,
                        color: note.color,
                        version: 1,
                    },
                ])
                .select()
                .single();

            if (error) {
                return null;
            }

            return convertDbNoteToNote(data);
        } catch (error) {
            return null;
        }
    },

    async updateNote(noteId: string, updates: Partial<Note>): Promise<Note | null> {
        try {
            const updateData: any = {};

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.content !== undefined) updateData.content = updates.content;
            if (updates.tags !== undefined) updateData.tags = updates.tags;
            if (updates.isProtected !== undefined) updateData.is_protected = updates.isProtected;
            if (updates.password !== undefined) updateData.password_hash = updates.password || null;
            if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.version !== undefined) updateData.version = updates.version;

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('notes')
                .update(updateData)
                .eq('id', noteId)
                .select()
                .single();

            if (error) {
                return null;
            }

            return convertDbNoteToNote(data);
        } catch (error) {
            return null;
        }
    },

    async deleteNote(noteId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

            if (error) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    },

    async duplicateNote(userId: string, note: Note): Promise<Note | null> {
        try {
            const duplicatedNote = {
                ...note,
                title: `${note.title} (Copy)`,
                isPinned: false,
                version: 1,
            };

            return await this.createNote(userId, duplicatedNote);
        } catch (error) {
            return null;
        }
    },

    async searchNotes(userId: string, query: string): Promise<Note[]> {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', userId)
                .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) {
                return [];
            }

            return (data || []).map(convertDbNoteToNote);
        } catch (error) {
            return [];
        }
    },

    subscribeToNotes(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel('notes_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes',
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    },
};
