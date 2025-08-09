
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// --- USER SERVICE FUNCTIONS ---

export async function getAllUsers(): Promise<User[]> {
    const profiles = await prisma.profiles.findMany();
    
    return profiles.map(profile => ({
        ...profile,
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        registeredAt: profile.registered_at?.toISOString() || new Date().toISOString()
    })) as User[];
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { email },
    });
    if (!profile) return null;
    return {
        ...profile,
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        registeredAt: profile.registered_at?.toISOString() || new Date().toISOString()
    } as User;
}

export async function getUserById(id: string): Promise<User | null> {
    const profile = await prisma.profiles.findUnique({
        where: { id },
    });
    if (!profile) return null;
    return {
        ...profile,
        name: `${profile.first_name} ${profile.paternal_last_name} ${profile.maternal_last_name || ''}`.trim(),
        firstName: profile.first_name,
        paternalLastName: profile.paternal_last_name,
        maternalLastName: profile.maternal_last_name || '',
        registeredAt: profile.registered_at?.toISOString() || new Date().toISOString()
    } as User;
}

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

    const newUser = await prisma.users.create({
        data: {
            email: userData.email,
            encrypted_password: hashedPassword,
        }
    });

    const newProfile = await prisma.profiles.create({
        data: {
            id: newUser.id,
            first_name: userData.firstName,
            paternal_last_name: userData.paternalLastName,
            maternal_last_name: userData.maternalLastName,
            email: userData.email,
            role: 'client',
            status: 'pendiente',
            plan_status: 'sin-plan'
        }
    });

    if (!newProfile) {
        throw new Error("No se pudo crear el perfil del usuario.");
    }

    return {
        id: newProfile.id,
        ...newProfile,
        name: `${newProfile.first_name} ${newProfile.paternal_last_name} ${newProfile.maternal_last_name || ''}`.trim(),
        firstName: newProfile.first_name,
        paternalLastName: newProfile.paternal_last_name,
        maternalLastName: newProfile.maternal_last_name || '',
        registeredAt: newProfile.registered_at?.toISOString() || new Date().toISOString()
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
