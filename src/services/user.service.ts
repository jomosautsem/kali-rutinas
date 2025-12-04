'use server';

import prisma from '@/lib/prisma';
import type { User, GeneratePersonalizedTrainingPlanInput } from "@/lib/types";

// NOTE: The Supabase client is no longer needed on the server for user creation.

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

// createUser function has been removed. User creation is now handled by a Supabase trigger.

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
