-- AeroNote Database Setup Script - ULTRA PERMISSIVE VERSION
-- Run this in your Supabase SQL Editor to fix all RLS issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    color JSONB DEFAULT '{"bg": "bg-white dark:bg-gray-800", "text": "text-gray-900 dark:text-gray-100"}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at);
CREATE INDEX idx_notes_is_pinned ON public.notes(is_pinned);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

-- DISABLE Row Level Security temporarily to fix the issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create SIMPLE function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user trigger executed for user: %', NEW.id;
    RAISE LOG 'User email: %, metadata: %', NEW.email, NEW.raw_user_meta_data;
    
    -- Insert user profile
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
    );
    
    RAISE LOG 'User profile created successfully for: %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE LOG 'User profile already exists for: %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
        -- Don't fail the signup, just log the error
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant ALL permissions to everyone (temporarily)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.notes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Grant sequence permissions (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Show trigger information
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Show table permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'notes');

-- Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'notes');

-- Verify the function was created correctly
SELECT 
    proname,
    prosrc,
    proacl
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Show current table structure using standard SQL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'users';
