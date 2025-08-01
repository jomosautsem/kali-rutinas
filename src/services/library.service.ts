'use server';

import { PrismaClient } from '@prisma/client';
import type { LibraryExercise } from '@/lib/types';

const prisma = new PrismaClient();

export async function getLibraryExercises(): Promise<LibraryExercise[]> {
    return prisma.libraryExercise.findMany();
}

export async function addLibraryExercise(exerciseData: Omit<LibraryExercise, 'id'>): Promise<LibraryExercise> {
    return prisma.libraryExercise.create({
        data: exerciseData,
    });
}

export async function updateLibraryExercise(id: string, exerciseData: Omit<LibraryExercise, 'id'>): Promise<LibraryExercise> {
    return prisma.libraryExercise.update({
        where: { id },
        data: exerciseData,
    });
}

export async function deleteLibraryExercise(id: string): Promise<void> {
    await prisma.libraryExercise.delete({
        where: { id },
    });
}
