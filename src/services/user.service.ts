
'use server';

import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// --- USER SERVICE FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
    const profiles = await prisma.profiles.findMany({
        orderBy: {
            registered_at: 'desc'
        }
    });
    
    // Map Prisma model to our User type
    return profiles.map(profile => ({
        id: profile.id,
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        email: profile.email,
        role: profile.role as User['role'],
        status: profile.status as User['status'],
        planStatus: profile.plan_status as User['planStatus'],
        inviteCode: profile.invite_code || undefined,
        avatarUrl: profile.avatar_url || undefined,
        customPlanRequest: profile.custom_plan_request as User['customPlanRequest'] || 'none',
        planStartDate: profile.plan_start_date?.toISOString(),
        planEndDate: profile.plan_end_date?.toISOString(),
        currentWeek: profile.current_week || undefined,
        planDurationInWeeks: profile.plan_duration_in_weeks || undefined,
        registeredAt: profile.registered_at.toISOString(),
    }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { email },
    });
    if (!profile) return null;
    return {
        id: profile.id,
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        email: profile.email,
        role: profile.role as User['role'],
        status: profile.status as User['status'],
        planStatus: profile.plan_status as User['planStatus'],
        inviteCode: profile.invite_code || undefined,
        avatarUrl: profile.avatar_url || undefined,
        customPlanRequest: profile.custom_plan_request as User['customPlanRequest'] || 'none',
        planStartDate: profile.plan_start_date?.toISOString(),
        planEndDate: profile.plan_end_date?.toISOString(),
        currentWeek: profile.current_week || undefined,
        planDurationInWeeks: profile.plan_duration_in_weeks || undefined,
        registeredAt: profile.registered_at.toISOString(),
    };
}

export async function getUserById(id: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { id },
    });
    if (!profile) return null;
    return {
        id: profile.id,
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        email: profile.email,
        role: profile.role as User['role'],
        status: profile.status as User['status'],
        planStatus: profile.plan_status as User['planStatus'],
        inviteCode: profile.invite_code || undefined,
        avatarUrl: profile.avatar_url || undefined,
        customPlanRequest: profile.custom_plan_request as User['customPlanRequest'] || 'none',
        planStartDate: profile.plan_start_date?.toISOString(),
        planEndDate: profile.plan_end_date?.toISOString(),
        currentWeek: profile.current_week || undefined,
        planDurationInWeeks: profile.plan_duration_in_weeks || undefined,
        registeredAt: profile.registered_at.toISOString(),
    };
}


export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    const existingUser = await prisma.profiles.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }

    if (!userData.password) {
        throw new Error("La contraseña es requerida.");
    }
    
    // In a real Supabase environment, you would call Supabase Auth signUp here.
    // Since we don't have direct access to Supabase Auth, we'll simulate the creation
    // and rely on Prisma to create the user profile, which is linked to auth.users via a trigger.
    
    // IMPORTANT: This simplified flow assumes a trigger on the Supabase `profiles` table
    // that creates an `auth.users` record. We are not handling the password directly.
    // The password would be sent to the Supabase client-side library `signUp` method.
    // For this server action, we proceed with profile creation.

    const newProfile = await prisma.profiles.create({
        data: {
            // A real user ID would come from Supabase Auth. We let the DB generate one.
            first_name: userData.firstName,
            paternal_last_name: userData.paternalLastName,
            maternal_last_name: userData.maternalLastName,
            email: userData.email,
            role: 'client',
            status: 'pendiente',
            plan_status: 'sin-plan',
            avatar_url: '/images/avatars/avatar-01.png',
        }
    });

    // We can't return the full User object with password, as it's handled by Auth
    return await getUserById(newProfile.id) as User;
}


export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    try {
        const dataToUpdate: any = {};
        
        // Map camelCase to snake_case for Prisma
        if(updatedData.firstName) dataToUpdate.first_name = updatedData.firstName;
        if(updatedData.paternalLastName) dataToUpdate.paternal_last_name = updatedData.paternalLastName;
        if(updatedData.maternalLastName) dataToUpdate.maternal_last_name = updatedData.maternalLastName;
        if(updatedData.inviteCode) dataToUpdate.invite_code = updatedData.inviteCode;
        if(updatedData.avatarUrl) dataToUpdate.avatar_url = updatedData.avatarUrl;
        if(updatedData.planStatus) dataToUpdate.plan_status = updatedData.planStatus;
        if(updatedData.customPlanRequest) dataToUpdate.custom_plan_request = updatedData.customPlanRequest;
        if(updatedData.planStartDate) dataToUpdate.plan_start_date = new Date(updatedData.planStartDate);
        if(updatedData.planEndDate) dataToUpdate.plan_end_date = new Date(updatedData.planEndDate);
        if(updatedData.currentWeek) dataToUpdate.current_week = updatedData.currentWeek;
        if(updatedData.planDurationInWeeks) dataToUpdate.plan_duration_in_weeks = updatedData.planDurationInWeeks;
        if(updatedData.status) dataToUpdate.status = updatedData.status;

        const updatedProfile = await prisma.profiles.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        return await getUserById(updatedProfile.id);

    } catch (error) {
        console.error("Error updating user in DB:", error);
        return null;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        // In a real Supabase setup, deleting the user from auth.users would cascade
        // and delete the profile. Here, we delete the profile directly.
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
    // This is not a standard Prisma schema field, so we use localStorage for this demo
    if (typeof window !== 'undefined') {
        const user = await getUserById(userId);
        if (user) {
            localStorage.setItem(`onboardingData_${user.email}`, JSON.stringify(data));
        }
    }
}
