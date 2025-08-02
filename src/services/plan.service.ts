
'use client'; // This service interacts with localStorage

import type { UserPlan, ProgressData, GeneratePersonalizedTrainingPlanInput, Template } from '@/lib/types';
import { getUserById } from './user.service';

// PLAN SERVICES
export async function getActivePlanForUser(userId: string): Promise<UserPlan | null> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return null;

    const storedPlan = localStorage.getItem(`userPlan_${user.email}`);
    return storedPlan ? JSON.parse(storedPlan) : null;
}

export async function assignPlanToUser(userId: string, planData: UserPlan): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;
    
    localStorage.setItem(`userPlan_${user.email}`, JSON.stringify(planData));
}

// PROGRESS SERVICES
export async function getProgressForWeek(userId: string, week: number): Promise<ProgressData | null> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return null;

    const progress = localStorage.getItem(`progress_week${week}_${user.email}`);
    return progress ? JSON.parse(progress) : null;
}

export async function saveProgressForWeek(userId: string, week: number, data: ProgressData): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;

    localStorage.setItem(`progress_week${week}_${user.email}`, JSON.stringify(data));
}

export async function getAllProgressForUser(userId: string): Promise<ProgressData[]> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return [];

    const allProgress: ProgressData[] = [];
    const totalWeeks = user.planDurationInWeeks || 8; // Default to 8 weeks if not set

    for (let i = 1; i <= totalWeeks; i++) {
        const progress = localStorage.getItem(`progress_week${i}_${user.email}`);
        if (progress) {
            allProgress.push(JSON.parse(progress));
        }
    }
    return allProgress;
}


// ONBOARDING DATA SERVICES
export async function getOnboardingData(userId: string): Promise<any | null> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return null;

    const data = localStorage.getItem(`onboardingData_${user.email}`);
    return data ? JSON.parse(data) : null;
}

// PLAN HISTORY SERVICES
export async function getPlanHistory(userId: string): Promise<UserPlan[]> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return [];

    const history = localStorage.getItem(`planHistory_${user.email}`);
    return history ? JSON.parse(history) : [];
}

export async function addPlanToHistory(userId: string, plan: UserPlan): Promise<void> {
    const user = await getUserById(userId);
    if (!user || typeof window === 'undefined') return;

    let history = await getPlanHistory(userId);
    history.push(plan);
    // Keep only the last 3 plans
    if (history.length > 3) {
        history = history.slice(-3);
    }
    localStorage.setItem(`planHistory_${user.email}`, JSON.stringify(history));
}
