
import type { UserPlan, ProgressData } from "./types";

/**
 * Calculates the total training volume for each day of the week based on progress data.
 * @param plan The user's training plan.
 * @param progress The user's progress data for a single week.
 * @returns An object where keys are abbreviated day names and values are the total volume.
 */
export function calculateWeeklyVolume(plan: UserPlan, progress: ProgressData): { [dayAbbr: string]: number } {
  const result: { [dayAbbr: string]: number } = {};
  
  plan.weeklyPlan.forEach(dayPlan => {
    const dayKey = dayPlan.day;
    const dayAbbr = dayKey.substring(0, 3);
    const dayProgress = progress[dayKey];
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
    result[dayAbbr] = totalVolume;
  });

  return result;
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
 * @param progress The user's progress data, potentially spanning multiple weeks.
 * @returns An object mapping exercise names to their record details.
 */
export function calculatePersonalRecords(plan: UserPlan, progress: ProgressData): Record<string, { oneRm: number, weight: number, reps: number }> {
    const records: Record<string, { oneRm: number, weight: number, reps: number }> = {};
    const keyExercises = new Set<string>();

    plan.weeklyPlan.forEach(day => {
        day.exercises.forEach(ex => {
            keyExercises.add(ex.name);
        })
    });

    for (const exerciseName of keyExercises) {
        let bestSet = { oneRm: 0, weight: 0, reps: 0 };
        
        for (const day in progress) {
            if (progress[day] && progress[day][exerciseName]) {
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
 * Gets the historical max weight lifted for a specific exercise across all training sessions.
 * @param exerciseName The name of the exercise to track.
 * @param progress The user's entire progress data, with date-like keys (e.g., "W1 Lun").
 * @returns An array of objects with date and max weight for the chart.
 */
export function getExerciseHistory(exerciseName: string, progress: ProgressData): { date: string, maxWeight: number }[] {
    const history: { date: string, maxWeight: number }[] = [];

    const sortedDays = Object.keys(progress).sort((a, b) => {
        // Simple sort assuming "W1", "W2", etc. prefixes
        return a.localeCompare(b, undefined, { numeric: true });
    });

    sortedDays.forEach((dayKey) => {
        if (progress[dayKey][exerciseName]) {
            let maxWeight = 0;
            const exerciseProgress = progress[dayKey][exerciseName];
            Object.values(exerciseProgress).forEach(set => {
                if (set.completed) {
                    const weight = parseFloat(set.weight);
                    if (weight > maxWeight) {
                        maxWeight = weight;
                    }
                }
            });
            
            if (maxWeight > 0) {
                history.push({ date: dayKey, maxWeight });
            }
        }
    });

    return history;
}

    