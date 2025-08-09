
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// --- USER SERVICE FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
    // This function needs to be adapted to not expose sensitive data like passwords
    // For now, it fetches all profiles. In a real app, you'd be more selective.
    const profiles = await prisma.profiles.findMany();
    return profiles as User[];
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { email },
    });
    return profile as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { id },
    });
    return profile as User | null;
}

// NOTE: This now only creates the profile. Authentication is separate.
// We assume Supabase Auth handles the actual user creation in auth.users.
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest' | 'password'> & { password?: string }): Promise<User> {
    const existingUser = await prisma.profiles.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    if (!userData.password) {
        throw new Error("La contraseña es requerida.");
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // This part of the code assumes you have a `users` table that is NOT `auth.users`
    // If you are using Supabase Auth, you should handle user creation via the Supabase client.
    // This implementation creates a user and a profile in a single transaction in your public schema.
    const newUser = await prisma.users.create({
        data: {
            email: userData.email,
            encrypted_password: hashedPassword,
            // Create the profile in the same transaction
            profile: {
                create: {
                    first_name: userData.firstName,
                    paternal_last_name: userData.paternalLastName,
                    maternal_last_name: userData.maternalLastName,
                    email: userData.email,
                    role: 'client',
                    status: 'pendiente',
                    plan_status: 'sin-plan'
                }
            }
        },
        include: {
            profile: true // Include the created profile in the return value
        }
    });

    if (!newUser || !newUser.profile) {
        throw new Error("No se pudo crear el perfil del usuario.");
    }

    // This casting is not safe, but for the sake of making it "work" with the current structure.
    const profile = newUser.profile;
    return {
        id: profile.id,
        ...profile,
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        registeredAt: profile.registered_at?.toISOString() || new Date().toISOString()
    } as User;
}


export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    try {
        const dataToUpdate: any = { ...updatedData };
        
        // Prisma uses snake_case for fields
        if(dataToUpdate.firstName) { dataToUpdate.first_name = dataToUpdate.firstName; delete dataToUpdate.firstName; }
        if(dataToUpdate.paternalLastName) { dataToUpdate.paternal_last_name = dataToUpdate.paternalLastName; delete dataToUpdate.paternalLastName; }
        if(dataToUpdate.maternalLastName) { dataToUpdate.maternal_last_name = dataToUpdate.maternalLastName; delete dataToUpdate.maternalLastName; }
        if(dataToUpdate.inviteCode) { dataToUpdate.invite_code = dataToUpdate.inviteCode; delete dataToUpdate.inviteCode; }
        if(dataToUpdate.avatarUrl) { dataToUpdate.avatar_url = dataToUpdate.avatarUrl; delete dataToUpdate.avatarUrl; }
        if(dataToUpdate.planStatus) { dataToUpdate.plan_status = dataToUpdate.planStatus; delete dataToUpdate.planStatus; }
        if(dataToUpdate.customPlanRequest) { dataToUpdate.custom_plan_request = dataToUpdate.customPlanRequest; delete dataToUpdate.customPlanRequest; }
        if(dataToUpdate.planStartDate) { dataToUpdate.plan_start_date = dataToUpdate.planStartDate; delete dataToUpdate.planStartDate; }
        if(dataToUpdate.planEndDate) { dataToUpdate.plan_end_date = dataToUpdate.planEndDate; delete dataToUpdate.planEndDate; }
        if(dataToUpdate.currentWeek) { dataToUpdate.current_week = dataToUpdate.currentWeek; delete dataToUpdate.currentWeek; }
        if(dataToUpdate.planDurationInWeeks) { dataToUpdate.plan_duration_in_weeks = dataToUpdate.planDurationInWeeks; delete dataToUpdate.planDurationInWeeks; }


        const updatedProfile = await prisma.profiles.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        return updatedProfile as User;

    } catch (error) {
        console.error("Error updating user in DB:", error);
        return null;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        // This will cascade and delete the profile due to the relation
        await prisma.users.delete({
            where: { id: userId }
        });
        return true;
    } catch (error) {
        console.error("Error deleting user from DB:", error);
        return false;
    }
}

export async function saveOnboardingData(userId: string, data: Omit<GeneratePersonalizedTrainingPlanInput, 'history'>): Promise<void> {
    await prisma.onboarding_data.upsert({
        where: { id: userId },
        update: { ...data, updated_at: new Date() },
        create: {
            id: userId,
            ...data
        }
    });
}
