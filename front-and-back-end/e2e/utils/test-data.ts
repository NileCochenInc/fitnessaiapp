import { Page, APIRequestContext } from '@playwright/test';

/**
 * Test data utilities for creating dummy workouts and exercises
 */

interface DummyWorkout {
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

const DUMMY_WORKOUTS: DummyWorkout[] = [
  {
    exerciseName: 'Push-ups',
    sets: 3,
    reps: 15,
    notes: 'E2E Test Data - Bodyweight',
  },
  {
    exerciseName: 'Running',
    sets: 1,
    reps: 1,
    duration: 30,
    notes: 'E2E Test Data - Cardio',
  },
  {
    exerciseName: 'Squats',
    sets: 4,
    reps: 10,
    weight: 185,
    notes: 'E2E Test Data - Legs',
  },
  {
    exerciseName: 'Bench Press',
    sets: 4,
    reps: 8,
    weight: 225,
    notes: 'E2E Test Data - Chest',
  },
  {
    exerciseName: 'Pull-ups',
    sets: 3,
    reps: 12,
    notes: 'E2E Test Data - Back',
  },
];

/**
 * Create dummy workouts via API to populate stats
 * Uses page.evaluate() with credentials to maintain browser session authentication
 */
export async function createDummyWorkouts(page: Page, count: number = 5): Promise<void> {
  console.log(`Creating ${count} dummy workouts for test user...`);

  const workoutsToCreate = DUMMY_WORKOUTS.slice(0, count);

  for (const workout of workoutsToCreate) {
    try {
      const payload = {
        workout_date: new Date().toISOString(),
        workout_kind: workout.exerciseName,
      };

      console.log(`  - Creating: ${workout.exerciseName}`);

      const result = await page.evaluate(async (data) => {
        const response = await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        return {
          status: response.status,
          ok: response.ok,
          text: await response.text(),
        };
      }, payload);

      if (!result.ok) {
        console.warn(`Failed to create workout "${workout.exerciseName}": ${result.status} - ${result.text}`);
      } else {
        console.log(`    ✓ Workout created successfully`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`Error creating workout "${workout.exerciseName}": ${errorMsg}`);
    }
  }

  console.log(`✓ Dummy workouts creation completed`);
}

/**
 * Create dummy workouts using direct API request (alternative method)
 * Useful if page context is not available
 */
export async function createDummyWorkoutsViaAPI(
  request: APIRequestContext,
  baseURL: string,
  count: number = 5
): Promise<void> {
  console.log(`Creating ${count} dummy workouts via API...`);

  const workoutsToCreate = DUMMY_WORKOUTS.slice(0, count);

  for (const workout of workoutsToCreate) {
    try {
      const payload = {
        exercise: workout.exerciseName,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        duration: workout.duration,
        notes: workout.notes,
        date: new Date().toISOString(),
      };

      console.log(`  - Creating: ${workout.exerciseName}`);

      const response = await request.post(`${baseURL}/api/progress`, {
        data: payload,
      });

      if (!response.ok()) {
        const errorText = await response.text();
        console.warn(`Failed to create workout: ${response.status()} - ${errorText}`);
      } else {
        console.log(`    ✓ Workout created`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`Error creating workout: ${errorMsg}`);
    }
  }

  console.log(`✓ Workout creation completed`);
}

/**
 * Verify that stats are populated and non-empty
 * Called after creating dummy workouts to confirm data is available
 */
export async function verifyStatsPopulated(page: Page): Promise<boolean> {
  console.log('Verifying stats are populated...');

  try {
    // Navigate to stats page
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    // Check for stat cards
    const statCards = page.locator('[data-testid="stat-card"], .stat-card').first();
    const isVisible = await statCards.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      console.log('✓ Stats cards found on page');
      return true;
    }

    // Check for loading state
    const loadingSpinner = page.locator('[data-testid="loading"], .spinner');
    const isLoading = await loadingSpinner.isVisible({ timeout: 2000 }).catch(() => false);

    if (isLoading) {
      console.log('Stats still loading, waiting...');
      await page.waitForTimeout(3000);
      return verifyStatsPopulated(page);
    }

    console.warn('Could not verify stats are displayed');
    return false;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`Error verifying stats: ${errorMsg}`);
    return false;
  }
}

/**
 * Get stats data from API to verify structure
 */
export async function getStatsDataFromAPI(page: Page): Promise<Record<string, any> | null> {
  try {
    const result = await page.evaluate(async () => {
      const response = await fetch('/api/data/user-stats', { credentials: 'include' });
      return { status: response.status, ok: response.ok, data: await response.json() };
    });

    if (!result.ok) {
      console.error(`Failed to fetch stats: ${result.status}`);
      return null;
    }

    const data = result.data;
    console.log('✓ Stats API response received');
    console.log(`  - Total Workouts: ${data.totalWorkouts || 'N/A'}`);
    console.log(`  - Average Exercises Per Day: ${data.averageExercisesPerDay || 'N/A'}`);

    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching stats: ${errorMsg}`);
    return null;
  }
}
