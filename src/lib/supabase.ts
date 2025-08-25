import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                    avatar_url?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                    avatar_url?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    first_name?: string;
                    last_name?: string;
                    avatar_url?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            notes: {
                Row: {
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
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    content: string;
                    tags?: string[];
                    is_protected?: boolean;
                    password_hash?: string;
                    is_pinned?: boolean;
                    color?: {
                        bg: string;
                        text: string;
                    };
                    version?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    content?: string;
                    tags?: string[];
                    is_protected?: boolean;
                    password_hash?: string;
                    is_pinned?: boolean;
                    color?: {
                        bg: string;
                        text: string;
                    };
                    version?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
