
'use server';

import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// Initialize Supabase client with the credentials provided by the user
const supabaseUrl = 'https://adoqdbdswuarsifbeszs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkb3FkYmRzd3VhcnNpZmJlc3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDEyOTgsImV4cCI6MjA4MDMxNzI5OH0._Pae8XsyClpHdpZUDGWzU2ZV5XNQLq2sB6wVG_0qVQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a user using the correct Supabase Auth flow, then creates a corresponding profile in Prisma.
 * This is the architecturally correct and secure way to handle registration.
 */
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    console.log("Executing FINAL createUser for email:", userData.email);

    if (!userData.password) {
        throw new Error("La contraseña es requerida para el registro.");
    }

    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                first_name: userData.firstName,
                last_name: `${userData.paternalLastName} ${userData.maternalLastName || ''}`.trim(),
            }
        }
    });

    if (authError) {
        console.error("CRITICAL: Supabase auth signUp failed.", authError);
        // We provide a more specific error message for common issues
        if (authError.message.includes("User already registered")) {
            throw new Error("Este correo electrónico ya ha sido registrado.");
        }
        throw new Error(authError.message || "Error al crear el usuario de autenticación.");
    }

    if (!authData.user) {
        throw new Error("El registro en Supabase no devolvió un usuario.");
    }
    
    const supbaseUrl = 'https://adoqdbdswuarsifbeszs.supabase.co/storage/v1/object/public/avatars/avatar-01.png';

    console.log(`Supabase user created successfully. ID: ${authData.user.id}`);

    // Step 2: Create the corresponding profile in the public `profiles` table using Prisma
    try {
        const newProfile = await prisma.profiles.create({
            data: {
                user_id: authData.user.id, // This links the profile to the auth user
                first_name: userData.firstName,
                paternal_last_name: userData.paternalLastName,
                maternal_last_name: userData.maternalLastName,
                email: userData.email,
                role: 'client',
                status: 'pendiente', // User is pending approval from admin
                plan_status: 'sin-plan',
                avatar_url: supbaseUrl, // Default avatar
            },
            select: { id: true } // Select only the ID we need
        });

        console.log(`Prisma profile created successfully. Profile ID: ${newProfile.id}`);

        // Construct the final user object to return to the client
        const finalUser: User = {
            id: newProfile.id, // This is the UUID from our public.profiles table
            firstName: userData.firstName,
            paternalLastName: userData.paternalLastName,
            maternalLastName: userData.maternalLastName || '',
            name: `${userData.firstName} ${userData.paternalLastName} ${userData.maternalLastName || ''}`.trim(),
            email: userData.email,
            role: 'client',
            status: 'pendiente',
            planStatus: 'sin-plan',
            registeredAt: authData.user.created_at,
        };

        return finalUser;

    } catch (prismaError) {
        console.error("CRITICAL: Prisma profile creation failed after Supabase user creation.", prismaError);
        // Cleanup logic: If profile creation fails, we should delete the auth user to avoid orphaned accounts
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
        if(deleteError) console.error("CRITICAL: Failed to clean up orphaned Supabase user", deleteError);

        throw new Error("Ocurrió un error de base de datos al crear el perfil del usuario.");
    }
}


/**
 * Saves the user's onboarding form data.
 */
export async function saveOnboardingData(profileId: string, data: Omit<GeneratePersonalizedTrainingPlanInput, 'history'>): Promise<void> {
    console.log("Executing FINAL saveOnboardingData for profileId:", profileId);

    try {
        const userProfile = await prisma.profiles.findUnique({
            where: { id: profileId },
            select: { user_id: true }
        });

        if (!userProfile) {
            throw new Error(`Profile with ID ${profileId} not found.`);
        }

        const { goals, muscleFocus, ...restOfData } = data;

        await prisma.onboarding_data.upsert({
            where: { user_id: userProfile.user_id },
            update: { ...restOfData, goals, muscleFocus: muscleFocus || [] },
            create: {
                user_id: userProfile.user_id,
                ...restOfData,
                goals,
                muscleFocus: muscleFocus || [],
            },
        });
        console.log("Successfully saved onboarding data for profileId:", profileId);
    } catch (error) {
        console.error("CRITICAL: Failed to save onboarding data.", error);
        throw new Error("Ocurrió un error de base de datos al guardar los datos del formulario.");
    }
}
