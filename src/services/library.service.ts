
'use client'; // This service interacts with localStorage

import type { LibraryExercise } from '@/lib/types';

const EXERCISE_LIBRARY_KEY = "exerciseLibrary";

const initialLibrary: LibraryExercise[] = [
    { id: "ex-1", name: "Press de Banca", muscleGroup: "Pecho", description: "Ejercicio fundamental para el desarrollo del pectoral, hombros y tríceps.", mediaUrl: "https://www.youtube.com/watch?v=g_w_Gkse6e4" },
    { id: "ex-2", name: "Sentadilla con Barra", muscleGroup: "Cuádriceps", description: "El rey de los ejercicios de pierna, trabaja cuádriceps, glúteos e isquiotibiales.", mediaUrl: "https://www.youtube.com/watch?v=C_p6-fXg2cQ" },
    { id: "ex-3", name: "Peso Muerto Convencional", muscleGroup: "Espalda", description: "Ejercicio compuesto que fortalece toda la cadena posterior, desde la espalda baja hasta los isquiotibiales.", mediaUrl: "https://www.youtube.com/watch?v=SytqA2A_p4g" },
    { id: "ex-4", name: "Dominadas", muscleGroup: "Espalda", description: "Excelente ejercicio con peso corporal para desarrollar la amplitud de la espalda.", mediaUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
    { id: "ex-5", name: "Press Militar", muscleGroup: "Hombros", description: "Ejercicio clave para construir hombros fuertes y definidos.", mediaUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI" },
];

function getLibraryFromStorage(): LibraryExercise[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(EXERCISE_LIBRARY_KEY);
    if (stored) {
        return JSON.parse(stored);
    } else {
        localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(initialLibrary));
        return initialLibrary;
    }
}

function saveLibraryToStorage(library: LibraryExercise[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(library));
}

export async function getLibraryExercises(): Promise<LibraryExercise[]> {
    return getLibraryFromStorage();
}

export async function addLibraryExercise(exerciseData: Omit<LibraryExercise, 'id'>): Promise<LibraryExercise> {
    const library = getLibraryFromStorage();
    const newExercise: LibraryExercise = {
        ...exerciseData,
        id: `ex-${Date.now()}`,
    };
    const updatedLibrary = [...library, newExercise];
    saveLibraryToStorage(updatedLibrary);
    return newExercise;
}

export async function updateLibraryExercise(id: string, exerciseData: Omit<LibraryExercise, 'id'>): Promise<LibraryExercise> {
    const library = getLibraryFromStorage();
    let updatedExercise: LibraryExercise | null = null;
    const updatedLibrary = library.map(ex => {
        if (ex.id === id) {
            updatedExercise = { ...ex, ...exerciseData };
            return updatedExercise;
        }
        return ex;
    });

    if (!updatedExercise) throw new Error("Exercise not found");
    
    saveLibraryToStorage(updatedLibrary);
    return updatedExercise;
}

export async function deleteLibraryExercise(id: string): Promise<void> {
    let library = getLibraryFromStorage();
    library = library.filter(ex => ex.id !== id);
    saveLibraryToStorage(library);
}
