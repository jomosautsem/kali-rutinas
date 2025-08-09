
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
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'>): Promise<User> {
    const existingUser = await prisma.profiles.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    // In a real scenario, you would not handle the password here.
    // Supabase Auth would handle it. This is a placeholder for the logic.
    // Let's assume the password is for a different system or just remove it.
    // For this example, we will proceed without storing the password directly.

    const newUserProfile = await prisma.profiles.create({
        data: {
            // This 'id' should come from Supabase Auth after a user signs up.
            // Since we don't have the auth flow fully integrated, we'll use a placeholder
            // which will cause issues. This part needs to be connected to the auth provider.
            // For now, let's create a placeholder to avoid breaking the code, but this is NOT a real solution.
            id: `temp-${Date.now()}`, // THIS IS NOT A VALID UUID AND WILL FAIL IF you have a foreign key constraint
            first_name: userData.firstName,
            paternal_last_name: userData.paternalLastName,
            maternal_last_name: userData.maternalLastName,
            email: userData.email,
            role: 'client',
            status: 'pendiente',
            plan_status: 'sin-plan',
        }
    });

    // This casting is not safe, but for the sake of making it "work" with the current structure.
    return {
        ...newUserProfile,
        name: `${newUserProfile.first_name} ${newUserProfile.paternal_last_name} ${newUserProfile.maternal_last_name || ''}`.trim(),
        firstName: newUserProfile.first_name,
        paternalLastName: newUserProfile.paternal_last_name,
        maternalLastName: newUserProfile.maternal_last_name || '',
        registeredAt: newUserProfile.registered_at?.toISOString() || new Date().toISOString()
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
        await prisma.profiles.delete({
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
