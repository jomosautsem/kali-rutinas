'use server';

import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// Configuration is now centralized and read from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined in .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);


export async function getAllUsers(): Promise<User[]> {
    try {
        const profiles = await prisma.profiles.findMany({
            orderBy: {
                registered_at: 'desc',
            },
        });

        return profiles.map(p => ({
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
    } catch (error: any) {
        console.error("[Service-Error:getAllUsers] Failed to fetch users:", error);
        throw new Error("No se pudieron cargar los usuarios desde la base de datos.");
    }
}

export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    if (!userData.password) {
        throw new Error("La contraseña es requerida para el registro.");
    }

    console.log("Attempting to sign up user with Supabase...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
    });

    if (authError) {
        console.error("[Service-Error:createUser] Supabase auth signUp failed:", authError);
        if (authError.message.includes("User already registered")) {
            throw new Error("Este correo electrónico ya ha sido registrado.");
        }
        // More generic error for timeout or other network issues
        if (authError.message.includes("fetch failed") || authError.message.includes("timed out")) {
            throw new Error("No se pudo conectar con el servicio de autenticación. Revisa tu conexión o intenta más tarde.");
        }
        throw new Error(authError.message || "Error al crear el usuario de autenticación.");
    }

    if (!authData.user) {
        throw new Error("El registro en Supabase no devolvió un usuario.");
    }
    
    console.log("Supabase user created successfully. User ID:", authData.user.id);
    const supbaseUrl = 'https://adoqdbdswuarsifbeszs.supabase.co/storage/v1/object/public/avatars/avatar-01.png';

    try {
        console.log("Attempting to create profile in Prisma...");
        const newProfile = await prisma.profiles.create({
            data: {
                user_id: authData.user.id, // This is the ID from Supabase Auth
                first_name: userData.firstName,
                paternal_last_name: userData.paternalLastName,
                maternal_last_name: userData.maternalLastName,
                email: userData.email,
                role: 'client',
                status: 'pendiente',
                plan_status: 'sin-plan',
                avatar_url: supbaseUrl,
            },
            select: { id: true, registered_at: true } // Select the auto-generated profile ID
        });
        console.log("Prisma profile created successfully. Profile ID:", newProfile.id);

        return {
            id: newProfile.id, // This is the ID from our profiles table
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

    } catch (prismaError: any) {
        console.error("[Service-Error:createUser] Prisma profile creation failed:", prismaError);
        // Important: If profile creation fails, we should ideally delete the Supabase user to prevent orphans.
        // This is an advanced topic (transactional rollback), so we'll just throw an error for now.
        throw new Error(`Error de base de datos al crear el perfil: ${prismaError.message}`);
    }
}

export async function saveOnboardingData(profileId: string, data: any): Promise<void> {
    try {
        const userProfile = await prisma.profiles.findUnique({
            where: { id: profileId },
            select: { user_id: true }
        });

        if (!userProfile) {
            throw new Error(`Profile with ID ${profileId} not found.`);
        }
        
        const cleanData = {
            goals: data.goals,
            currentFitnessLevel: data.currentFitnessLevel,
            trainingDays: data.trainingDays,
            trainingTimePerDay: data.trainingTimePerDay,
            preferredWorkoutStyle: data.preferredWorkoutStyle,
            muscleFocus: data.muscleFocus || [],
            age: data.age ?? 0,
            weight: data.weight ?? 0,
            height: data.height ?? 0,
            goalTerm: data.goalTerm,
            planDuration: data.planDuration ?? 4,
            injuriesOrConditions: data.injuriesOrConditions,
            exercisesPerDay: data.exercisesPerDay ?? 5
        };

        await prisma.onboarding_data.upsert({
            where: { user_id: userProfile.user_id },
            update: cleanData,
            create: {
                user_id: userProfile.user_id,
                ...cleanData,
            },
        });

    } catch (error: any) {
        console.error("[Service-Error:saveOnboardingData] Failed to save onboarding data:", error);
        throw new Error(`Ocurrió un error de base de datos al guardar los datos del formulario: ${error.message}`);
    }
}
