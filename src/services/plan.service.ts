
'use client'; 

import type { UserPlan, ProgressData, GeneratePersonalizedTrainingPlanInput } from '@/lib/types';
import { getUserById } from './user.service';
import prisma from '@/lib/prisma';


// PLAN SERVICES
export async function getActivePlanForUser(userId: string): Promise<UserPlan | null> {
    const plan = await prisma.training_plans.findFirst({
        where: { user_id: userId, is_active: true }
    });

    if (!plan || !plan.plan_data) return null;
    return plan.plan_data as UserPlan;
}

export async function assignPlanToUser(userId: string, planData: UserPlan): Promise<void> {
    // Deactivate any old active plans for this user
    await prisma.training_plans.updateMany({
        where: { user_id: userId, is_active: true },
        data: { is_active: false },
    });
    
    // Create the new active plan
    await prisma.training_plans.create({
        data: {
            user_id: userId,
            plan_data: planData,
            is_active: true,
        }
    });
}

// PROGRESS SERVICES
export async function getProgressForWeek(userId: string, week: number): Promise<ProgressData | null> {
    const progress = await prisma.workout_progress.findUnique({
        where: { user_id_week: { user_id: userId, week: week } }
    });
    
    if (!progress || !progress.progress_data) return null;
    return progress.progress_data as ProgressData;
}

export async function saveProgressForWeek(userId: string, week: number, data: ProgressData): Promise<void> {
    await prisma.workout_progress.upsert({
        where: { user_id_week: { user_id: userId, week: week } },
        update: { progress_data: data },
        create: { user_id: userId, week: week, progress_data: data },
    });
}

export async function getAllProgressForUser(userId: string): Promise<ProgressData[]> {
    const user = await getUserById(userId);
    if (!user) return [];

    const allProgressRecords = await prisma.workout_progress.findMany({
        where: { user_id: userId },
        orderBy: { week: 'asc' },
    });
    
    return allProgressRecords.map(p => p.progress_data as ProgressData);
}

// ONBOARDING DATA SERVICES
export async function getOnboardingData(userId: string): Promise<GeneratePersonalizedTrainingPlanInput | null> {
    const data = await prisma.onboarding_data.findUnique({
        where: { id: userId }
    });
    if (!data) return null;
    // We need to cast because the generated Prisma type is slightly different
    return data as unknown as GeneratePersonalizedTrainingPlanInput;
}

// PLAN HISTORY SERVICES
export async function getPlanHistory(userId: string): Promise<UserPlan[]> {
    const historyRecords = await prisma.plan_history.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
    });
    return historyRecords.map(h => h.plan_data as UserPlan);
}

export async function addPlanToHistory(userId: string, plan: UserPlan): Promise<void> {
    await prisma.plan_history.create({
        data: {
            user_id: userId,
            plan_data: plan,
        }
    });
}

    