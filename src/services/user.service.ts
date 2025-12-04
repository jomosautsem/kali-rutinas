
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
    if (email === "kalicentrodeportivotemixco@gmail.com") {
        return {
            id: 'admin-user',
            firstName: 'Admin',
            paternalLastName: 'User',
            maternalLastName: '',
            name: 'Admin User',
            email: "kalicentrodeportivotemixco@gmail.com",
            role: 'admin',
            status: 'activo',
            planStatus: 'con-plan',
            registeredAt: new Date().toISOString(),
        };
    }

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

// NOTE: This function simulates creating a Supabase auth user and a profile.
// In a real project, you'd use the Supabase client-side library for signUp,
// which would then trigger a function to create the profile.
export async function createUser(userData: Omit<User, 'id' | 'registeredAt' | 'role' | 'status' | 'planStatus' | 'name' | 'inviteCode' | 'avatarUrl' | 'customPlanRequest'> & { password?: string }): Promise<User> {
    
    const existingUser = await prisma.profiles.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error("Este correo electrónico ya ha sido registrado.");
    }
    
    // In a real Supabase env, you would NOT handle the password here.
    // The password would be passed to the supabase.auth.signUp client-side method.
    // For this backend simulation, we're just creating the profile.

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

    const user = await getUserById(newProfile.id);
    if (!user) {
        throw new Error("Failed to retrieve created user.");
    }
    return user;
}


export async function updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
    try {
        const dataToUpdate: any = {};
        
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

        // Handle cases where a value should be set to null
        if ('planStartDate' in updatedData && updatedData.planStartDate === undefined) dataToUpdate.plan_start_date = null;
        if ('planEndDate' in updatedData && updatedData.planEndDate === undefined) dataToUpdate.plan_end_date = null;
        if ('currentWeek' in updatedData && updatedData.currentWeek === undefined) dataToUpdate.current_week = null;
        if ('planDurationInWeeks' in updatedData && updatedData.planDurationInWeeks === undefined) dataToUpdate.plan_duration_in_weeks = null;


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
    // This now saves to a separate table
    const { goals, muscleFocus, ...restOfData } = data;
    await prisma.onboarding_data.upsert({
        where: { id: userId },
        update: {
            ...restOfData,
            goals,
            muscleFocus: muscleFocus || [],
        },
        create: {
            id: userId,
            ...restOfData,
            goals,
            muscleFocus: muscleFocus || [],
        },
    });
}
