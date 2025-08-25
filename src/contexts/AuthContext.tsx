import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    confirmEmailManually: (email: string, password: string) => Promise<{ error: any }>;
    bypassEmailConfirmation: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {


        if (!supabase || !supabase.auth) {

            setError('Supabase is not properly configured. Please check your environment variables.');
            setLoading(false);
            return;
        }



        const getInitialSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    setError('Failed to initialize authentication');
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                setError('Failed to initialize authentication');
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {


        try {
            if (!supabase || !supabase.auth) {
                return { error: { message: 'Supabase is not properly configured' } };
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                return { error };
            }

            if (data.user) {
                await ensureUserProfile(data.user);
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {


        try {
            if (!supabase || !supabase.auth) {
                return { error: { message: 'Supabase is not properly configured' } };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {

                if (error.message.includes('Email not confirmed')) {
                    return {
                        error: {
                            message: 'Please check your email and click the confirmation link before signing in. If you didn\'t receive the email, check your spam folder.',
                            code: 'EMAIL_NOT_CONFIRMED'
                        }
                    };
                }

                return { error };
            }



            if (data.user) {
                await ensureUserProfile(data.user);
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const ensureUserProfile = async (user: User) => {
        try {


            const { data: existingProfile, error: selectError } = await supabase
                .from('users')
                .select('id, email, first_name, last_name')
                .eq('id', user.id)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                return;
            }

            if (!existingProfile) {

                const firstName = user.user_metadata?.first_name || 'User';
                const lastName = user.user_metadata?.last_name || 'User';

                const { error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: user.id,
                            email: user.email!,
                            first_name: firstName,
                            last_name: lastName,
                        },
                    ]);

                if (insertError) {
                    if (insertError.code === '23505') {
                    } else if (insertError.code === '42501') {
                    } else {
                    }
                } else {
                }
            } else {
            }
        } catch (error) {
        }
    };

    const signOut = async () => {


        try {
            if (supabase && supabase.auth) {
                await supabase.auth.signOut();

            }
        } catch (error) {
        }
    };

    const resetPassword = async (email: string) => {


        try {
            if (!supabase || !supabase.auth) {
                return { error: { message: 'Supabase is not properly configured' } };
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                return { error };
            }
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const confirmEmailManually = async (email: string, password: string) => {


        try {
            if (!supabase || !supabase.auth) {
                return { error: { message: 'Supabase is not properly configured' } };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const bypassEmailConfirmation = async (email: string, password: string) => {


        try {
            if (!supabase || !supabase.auth) {
                return { error: { message: 'Supabase is not properly configured' } };
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                return { error: null };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {

                if (error.message.includes('Email not confirmed')) {
                    return {
                        error: {
                            message: 'Email confirmation required. Please update the user account in Supabase or create a new account.',
                            code: 'EMAIL_CONFIRMATION_REQUIRED',
                            requiresDatabaseUpdate: true
                        }
                    };
                }

                return { error };
            }


            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const value = {
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        confirmEmailManually,
        bypassEmailConfirmation,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
