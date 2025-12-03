-- SQL script to set up the database schema and create an admin user.
-- NOTE: The 'auth' schema and 'auth.users' table are managed by your
-- authentication provider (e.g., Supabase) and cannot be created manually with this script.
-- This script will only set up the 'public' schema.

-- Enable pgcrypto extension to use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create public schema
CREATE SCHEMA IF NOT EXISTS "public";

-- Create public.profiles table
-- This table depends on auth.users, which must already exist.
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    paternal_last_name TEXT NOT NULL,
    maternal_last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    status TEXT NOT NULL DEFAULT 'pendiente',
    plan_status TEXT NOT NULL DEFAULT 'sin-plan',
    invite_code TEXT UNIQUE,
    avatar_url TEXT,
    custom_plan_request TEXT DEFAULT 'none',
    plan_start_date TIMESTAMPTZ,
    plan_end_date TIMESTAMPTZ,
    current_week INTEGER,
    plan_duration_in_weeks INTEGER,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- The FOREIGN KEY constraint assumes auth.users table exists with an id column.
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create public.onboarding_data table
CREATE TABLE IF NOT EXISTS public.onboarding_data (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    goals TEXT[] NOT NULL,
    "currentFitnessLevel" TEXT NOT NULL,
    "trainingDays" TEXT[] NOT NULL,
    "trainingTimePerDay" TEXT NOT NULL,
    "preferredWorkoutStyle" TEXT NOT NULL,
    "muscleFocus" TEXT[] NOT NULL,
    age INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    height INTEGER NOT NULL,
    "goalTerm" TEXT NOT NULL,
    "planDuration" INTEGER NOT NULL,
    "injuriesOrConditions" TEXT,
    "exercisesPerDay" INTEGER NOT NULL,
    -- NOTE: This relies on a profile already existing for the user_id
    CONSTRAINT fk_profile FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create public.training_plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_data JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create public.workout_progress table
CREATE TABLE IF NOT EXISTS public.workout_progress (
    user_id UUID NOT NULL,
    week INTEGER NOT NULL,
    progress_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, week),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create public.plan_history table
CREATE TABLE IF NOT EXISTS public.plan_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Grant privileges on the public schema.
-- You might need to adjust the role name 'postgres' to your database user.
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;


-- |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- ||                   CREATE ADMIN USER                     ||
-- |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
--
-- IMPORTANT:
-- 1. Create a user first in your authentication provider's dashboard (e.g., Supabase Studio).
-- 2. Get the `id` of the newly created user.
-- 3. Replace the `admin_user_id` placeholder below with that `id`.
-- 4. Run this block of code.

DO $$
DECLARE
    -- IMPORTANT: Replace this with the actual user ID from your auth provider (e.g., Supabase Auth)
    admin_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- <-- REPLACE THIS ID
BEGIN
    -- This script creates a profile for an EXISTING user and gives them the 'admin' role.
    -- It assumes the user has already been created in the `auth.users` table.
    INSERT INTO public.profiles (user_id, first_name, paternal_last_name, email, role, status)
    VALUES (
        admin_user_id,
        'Admin',                          -- <-- REPLACE First Name
        'User',                           -- <-- REPLACE Last Name
        'admin@example.com',              -- <-- REPLACE Email
        'admin',                          -- Role is set to 'admin'
        'activo'                          -- Status is set to 'active'
    )
    ON CONFLICT (user_id) DO UPDATE       -- If profile exists, update the role
    SET role = 'admin',
        status = 'activo';
END $$;
