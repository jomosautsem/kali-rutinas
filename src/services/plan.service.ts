
'use client'; 

import type { UserPlan, ProgressData, GeneratePersonalizedTrainingPlanInput, Template } from '@/lib/types';
import { getUserById } from './user.service';
import prisma from '@/lib/prisma';


// PLAN SERVICES
export async function getActivePlanForUser(userId: string): Promise<UserPlan | null> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return null;

    // This data would live in a `training_plans` table in a real DB
    const storedPlan = localStorage.getItem(`userPlan_${user.email}`);
    return storedPlan ? JSON.parse(storedPlan) : null;
}

export async function assignPlanToUser(userId: string, planData: UserPlan): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;
    
    // This data would live in a `training_plans` table in a real DB
    localStorage.setItem(`userPlan_${user.email}`, JSON.stringify(planData));
}

// PROGRESS SERVICES
export async function getProgressForWeek(userId: string, week: number): Promise<ProgressData | null> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return null;

    // This data would live in a `workout_progress` table in a real DB
    const progress = localStorage.getItem(`progress_week${week}_${user.email}`);
    return progress ? JSON.parse(progress) : null;
}

export async function saveProgressForWeek(userId: string, week: number, data: ProgressData): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;

    // This data would live in a `workout_progress` table in a real DB
    localStorage.setItem(`progress_week${week}_${user.email}`, JSON.stringify(data));
}

export async function getAllProgressForUser(userId: string): Promise<ProgressData[]> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return [];

    const allProgress: ProgressData[] = [];
    const totalWeeks = user.planDurationInWeeks || 8; 

    for (let i = 1; i <= totalWeeks; i++) {
        // This data would live in a `workout_progress` table in a real DB
        const progress = localStorage.getItem(`progress_week${i}_${user.email}`);
        if (progress) {
            allProgress.push(JSON.parse(progress));
        }
    }
    return allProgress;
}


// ONBOARDING DATA SERVICES
export async function getOnboardingData(userId: string): Promise<any | null> {
    // This now reads from the DB instead of localStorage
    const data = await prisma.onboarding_data.findUnique({
        where: { id: userId }
    });
    return data;
}

// PLAN HISTORY SERVICES
export async function getPlanHistory(userId: string): Promise<UserPlan[]> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return [];
    
    // This data would live in a `training_plan_history` table in a real DB
    const history = localStorage.getItem(`planHistory_${user.email}`);
    return history ? JSON.parse(history) : [];
}

export async function addPlanToHistory(userId: string, plan: UserPlan): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;

    let history = await getPlanHistory(userId);
    history.push(plan);
    if (history.length > 3) {
        history = history.slice(-3);
    }
    // This data would live in a `training_plan_history` table in a real DB
    localStorage.setItem(`planHistory_${user.email}`, JSON.stringify(history));
}
