'use server';

import { PrismaClient } from '@prisma/client';
import type { UserPlan, ProgressData, OnboardingData, UserPlanFromPrisma, Template } from '@/lib/types';
import type { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to convert JSON to UserPlan
function toUserPlan(plan: Prisma.UserPlanGetPayload<{}>): UserPlan {
    return {
        ...plan,
        weeklyPlan: plan.weeklyPlan as any, // Assuming it's already in the correct format from DB
    };
}

// PLAN SERVICES
export async function getActivePlanForUser(userId: string): Promise<UserPlan | null> {
    const plan = await prisma.userPlan.findFirst({
        where: { userId, isActive: true },
    });
    return plan ? toUserPlan(plan) : null;
}

export async function assignPlanToUser(userId: string, planData: UserPlan): Promise<void> {
    // Deactivate any existing active plans for the user
    await prisma.userPlan.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
    });

    // Create the new active plan
    await prisma.userPlan.create({
        data: {
            userId,
            planJustification: planData.planJustification,
            warmup: planData.warmup,
            recommendations: planData.recommendations,
            weeklyPlan: planData.weeklyPlan as any, // Prisma expects Json
            isActive: true,
        },
    });
}

// PROGRESS SERVICES
export async function getProgressForWeek(userId: string, week: number): Promise<ProgressData | null> {
    const progress = await prisma.progress.findUnique({
        where: { userId_week: { userId, week } },
    });
    return progress ? (progress.data as any) : null;
}

export async function saveProgressForWeek(userId: string, week: number, data: ProgressData): Promise<void> {
    await prisma.progress.upsert({
        where: { userId_week: { userId, week } },
        update: { data: data as any },
        create: { userId, week, data: data as any },
    });
}

export async function getAllProgressForUser(userId: string): Promise<ProgressData[]> {
    const allProgress = await prisma.progress.findMany({
        where: { userId },
        orderBy: { week: 'asc' },
    });
    return allProgress.map(p => p.data as any);
}

// ONBOARDING DATA SERVICES
export async function saveOnboardingData(userId: string, data: Omit<OnboardingData, 'id' | 'userId' | 'createdAt'>): Promise<void> {
     await prisma.onboardingData.upsert({
        where: { userId },
        update: { data: data as any },
        create: { userId, data: data as any },
    });
}

export async function getOnboardingData(userId: string): Promise<any | null> { // Adjust type as needed
    const onboardingData = await prisma.onboardingData.findUnique({
        where: { userId },
    });
    return onboardingData ? onboardingData.data : null;
}


// PLAN HISTORY SERVICES
export async function getPlanHistory(userId: string): Promise<UserPlan[]> {
    const history = await prisma.planHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
    });
    return history.map(h => h.plan as any);
}

export async function addPlanToHistory(userId: string, plan: UserPlan): Promise<void> {
    await prisma.planHistory.create({
        data: {
            userId,
            plan: plan as any,
        },
    });
}
