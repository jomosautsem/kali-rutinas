
'use server';

import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// --- USER SERVICE - FAST REGISTRATION IMPLEMENTATION ---

// Note: All other functions (getAllUsers, getUserByEmail, etc.) are removed for clarity
// during this critical fix. They can be added back later if needed.

/**
 * Creates a user profile and its associated auth record in a single transaction.
 * This function is designed to be FAST and ONLY handle user creation.
 * It does NOT trigger any AI plan generation.
 */
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    console.log("Executing FAST createUser for email:", userData.email);
    
    const existingUser = await prisma.profiles.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        console.error("Attempted to create a user that already exists:", userData.email);
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    try {
        const newProfile = await prisma.profiles.create({
            data: {
                first_name: userData.firstName,
                paternal_last_name: userData.paternalLastName,
                maternal_last_name: userData.maternalLastName,
                email: userData.email,
                role: 'client',
                status: 'pendiente', // The user is created as 'pending' for admin approval
                plan_status: 'sin-plan', // The user starts without a plan
                avatar_url: '/images/avatars/avatar-01.png',
                // This nested write creates the auth_users record simultaneously, as required by the schema
                auth_users: {
                    create: {
                        raw_user_meta_data: {
                            name: `${userData.firstName} ${userData.paternalLastName}`.trim()
                        }
                    }
                }
            },
            // We include the user_id to ensure the relation was successful
            select: { id: true, user_id: true, email: true } 
        });

        console.log(`Successfully created profile ${newProfile.id} and auth user ${newProfile.user_id} for email: ${newProfile.email}`);

        // Instead of calling another DB query, we construct the final user object here
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
            registeredAt: new Date().toISOString(),
        };

        return finalUser;

    } catch (error) {
        console.error("CRITICAL: Failed to create user in database.", error);
        // This will provide a more detailed error in the server logs
        throw new Error("Ocurrió un error de base de datos al crear el usuario.");
    }
}

/**
 * Saves the user's onboarding form data.
 * This function is designed to be FAST and ONLY handle saving data.
 * It does NOT trigger any AI plan generation.
 */
export async function saveOnboardingData(profileId: string, data: Omit<GeneratePersonalizedTrainingPlanInput, 'history'>): Promise<void> {
    console.log("Executing FAST saveOnboardingData for profileId:", profileId);

    try {
        // First, we need the user_id from the profiles table to relate it to the onboarding_data
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
            update: {
                ...restOfData,
                goals,
                muscleFocus: muscleFocus || [],
            },
            create: {
                user_id: userProfile.user_id, // This is the foreign key from the auth.users table
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
