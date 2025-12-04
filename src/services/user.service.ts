
'use server';

import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

const supabaseUrl = 'https://adoqdbdswuarsifbeszs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkb3FkYmRzd3VhcnNpZmJlc3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDEyOTgsImV4cCI6MjA4MDMxNzI5OH0._Pae8XsyClpHdpZUDGWzU2ZV5XNQLq2sB6wVG_0qVQw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Fetches all user profiles from the public.profiles table for the admin panel.
 */
export async function getAllUsers(): Promise<User[]> {
    console.log("Executing getAllUsers with correct field name...");
    try {
        const profiles = await prisma.profiles.findMany({
            orderBy: {
                registered_at: 'desc',
            },
        });

        const users: User[] = profiles.map(p => ({
            id: p.id,
            firstName: p.first_name,
            paternalLastName: p.paternal_last_name,
            maternalLastName: p.maternal_last_name || '',
            name: `${p.first_name} ${p.paternal_last_name} ${p.maternal_last_name || ''}`.trim(),
            email: p.email,
            role: p.role as 'admin' | 'client',
            status: p.status as 'activo' | 'pendiente' | 'inactivo',
            planStatus: p.plan_status as 'aprobado' | 'pendiente' | 'sin-plan' | 'n/a',
            registeredAt: p.registered_at.toISOString(),
            avatarUrl: p.avatar_url || undefined,
        }));

        console.log(`Successfully fetched ${users.length} users.`);
        return users;
    } catch (error: any) {
        console.error("CRITICAL: Failed to fetch users from profiles table.", error);
        throw new Error("No se pudieron cargar los usuarios desde la base de datos.");
    }
}


/**
 * Creates a user via Supabase Auth, then creates a corresponding profile in Prisma.
 */
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    console.log("Executing FINAL createUser for email:", userData.email);

    if (!userData.password) {
        throw new Error("La contraseña es requerida para el registro.");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
    });

    if (authError) {
        console.error("CRITICAL: Supabase auth signUp failed.", authError);
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

    try {
        const newProfile = await prisma.profiles.create({
            data: {
                user_id: authData.user.id,
                first_name: userData.firstName,
                paternal_last_name: userData.paternalLastName,
                maternal_last_name: userData.maternalLastName,
                email: userData.email,
                role: 'client',
                status: 'pendiente',
                plan_status: 'sin-plan',
                avatar_url: supbaseUrl,
            },
            select: { 
                id: true, 
                registered_at: true
            }
        });

        console.log(`Prisma profile created successfully. Profile ID: ${newProfile.id}`);

        const finalUser: User = {
            id: newProfile.id,
            firstName: userData.firstName,
            paternalLastName: userData.paternalLastName,
            maternalLastName: userData.maternalLastName || '',
            name: `${userData.firstName} ${userData.paternalLastName} ${userData.maternalLastName || ''}`.trim(),
            email: userData.email,
            role: 'client',
            status: 'pendiente',
            planStatus: 'sin-plan',
            registeredAt: newProfile.registered_at.toISOString(),
        };

        return finalUser;

    } catch (prismaError: any) {
        console.error("CRITICAL: Prisma profile creation failed after Supabase user creation.", prismaError);
        throw new Error(`Error de base de datos al crear el perfil: ${prismaError.message}`);
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

        // ** THE FIX IS HERE **
        // Ensure numeric fields have a default value to prevent DB errors for NOT NULL constraints.
        const sanitizedData = {
            ...data,
            age: data.age ?? 0,
            weight: data.weight ?? 0,
            height: data.height ?? 0,
        };
        // ** END OF FIX **

        const { goals, muscleFocus, ...restOfData } = sanitizedData;

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
