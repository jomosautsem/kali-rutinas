
import type { UserPlan, ProgressData } from "./types";

/**
 * Calculates the total training volume for each day of the week based on progress data.
 * @param plan The user's training plan.
 * @param progress The user's progress data.
 * @returns An array of objects, each containing a day and its total volume.
 */
export function calculateWeeklyVolume(plan: UserPlan, progress: ProgressData): { day: string, volume: number }[] {
  return plan.weeklyPlan.map(dayPlan => {
    const dayProgress = progress[dayPlan.day];
    let totalVolume = 0;

    if (dayProgress) {
      Object.values(dayProgress).forEach(exerciseProgress => {
        Object.values(exerciseProgress).forEach(setProgress => {
          if (setProgress.completed) {
            const weight = parseFloat(setProgress.weight) || 0;
            const reps = parseInt(setProgress.reps, 10) || 0;
            totalVolume += weight * reps;
          }
        });
      });
    }

    return {
      day: dayPlan.day.substring(0, 3), // Abbreviate day name
      volume: totalVolume,
    };
  });
}

/**
 * Calculates the estimated 1 Rep Max (1RM) using the Epley formula.
 * @param weight The weight lifted.
 * @param reps The number of repetitions performed.
 * @returns The estimated 1RM.
 */
function epleyFormula(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps === 0) return 0;
    return weight * (1 + reps / 30);
}


/**
 * Finds the personal records (estimated 1RM) for key exercises from the user's progress.
 * @param plan The user's training plan.
 * @param progress The user's progress data.
 * @returns An object mapping exercise names to their record details.
 */
export function calculatePersonalRecords(plan: UserPlan, progress: ProgressData): Record<string, { oneRm: number, weight: number, reps: number }> {
    const records: Record<string, { oneRm: number, weight: number, reps: number }> = {};
    const keyExercises = new Set<string>();

    // Identify key compound exercises from the plan to track records for
    plan.weeklyPlan.forEach(day => {
        day.exercises.forEach(ex => {
            // Simple heuristic to find compound lifts, can be improved
            if (ex.name.toLowerCase().includes('press') || ex.name.toLowerCase().includes('sentadilla') || ex.name.toLowerCase().includes('peso muerto') || ex.name.toLowerCase().includes('dominadas')) {
                keyExercises.add(ex.name);
            }
        })
    });

    if(keyExercises.size === 0 && plan.weeklyPlan[0]?.exercises[0]){
        keyExercises.add(plan.weeklyPlan[0].exercises[0].name);
    }

    for (const exerciseName of keyExercises) {
        let bestSet = { oneRm: 0, weight: 0, reps: 0 };
        
        for (const day in progress) {
            if (progress[day][exerciseName]) {
                const exerciseProgress = progress[day][exerciseName];
                for (const setIndex in exerciseProgress) {
                    const set = exerciseProgress[setIndex];
                    if (set.completed) {
                        const weight = parseFloat(set.weight);
                        const reps = parseInt(set.reps, 10);
                        if (!isNaN(weight) && !isNaN(reps)) {
                            const oneRm = epleyFormula(weight, reps);
                            if (oneRm > bestSet.oneRm) {
                                bestSet = { oneRm, weight, reps };
                            }
                        }
                    }
                }
            }
        }
        
        if (bestSet.oneRm > 0) {
            records[exerciseName] = bestSet;
        }
    }

    return records;
}


/**
 * Gets the historical max weight lifted for a specific exercise across all training days.
 * @param exerciseName The name of the exercise to track.
 * @param progress The user's entire progress data.
 * @returns An array of objects with date and max weight for the chart.
 */
export function getExerciseHistory(exerciseName: string, progress: ProgressData): { date: string, maxWeight: number }[] {
    const history: { date: string, maxWeight: number }[] = [];

    // Assuming dates are keys in progress data, which is not the case.
    // Let's sort the days from the progress object if they are date-like strings, otherwise we can't build a timeline.
    // For this implementation, we'll assume the keys are standard day names and can't be sorted chronologically.
    // We will simulate a date based on the day of the week for demonstration.
    // A real implementation would need to store progress with timestamps.
    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const sortedDays = Object.keys(progress).sort((a, b) => {
        const aIndex = dayOrder.findIndex(day => a.toLowerCase().startsWith(day.toLowerCase()));
        const bIndex = dayOrder.findIndex(day => b.toLowerCase().startsWith(day.toLowerCase()));
        return aIndex - bIndex;
    });

    sortedDays.forEach((day, index) => {
        if (progress[day][exerciseName]) {
            let maxWeight = 0;
            const exerciseProgress = progress[day][exerciseName];
            Object.values(exerciseProgress).forEach(set => {
                if (set.completed) {
                    const weight = parseFloat(set.weight);
                    if (weight > maxWeight) {
                        maxWeight = weight;
                    }
                }
            });
            
            if (maxWeight > 0) {
                // NOTE: This date is simulated. A real app would need timestamps on progress entries.
                history.push({ date: `Sem ${Math.floor(index / 7) + 1}, Día ${index % 7 + 1}`, maxWeight });
            }
        }
    });

    return history;
}
