"use client"; // must be client component for interactivity

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from '@/components/Button';
import WorkoutCard from "@/components/WorkoutCard";

type Workout = {
  id: number;
  workout_date: string;
  workout_kind: string;
};

export default function Page() {
    const router = useRouter();

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this workout?")) return;

        try {
            const res = await fetch(`/api/workouts?workoutId=${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete workout");
            }

            setWorkouts((prev) => prev.filter((w) => w.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    // Fetch previous workouts from backend on component mount
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await fetch(`/api/workouts`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to fetch workouts");
                }

                const data: Workout[] = await response.json();

                // Sort by date descending
                const sortedData = data.sort((a, b) => {
                    return new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime();
                });

                setWorkouts(sortedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, []); // Removed userId dependency

    return (
        <div className="p-4">
            {loading && <p>Loading workouts...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <div>
                    <h1 className="text-xl font-bold mb-4">Previous Workouts</h1>

                    {workouts.length === 0 && <p>No previous workouts found.</p>}

                    <ul>
                        {workouts.map((workout) => (
                            <WorkoutCard 
                                key={workout.id}
                                id={workout.id}
                                workout_date={workout.workout_date} 
                                workout_kind={workout.workout_kind}
                                onDelete={handleDelete}
                                onEdit={() => router.push(`/edit_exercises?workoutid=${workout.id}`)}
                            />
                        ))}
                    </ul>
                </div>
            )}

            <Button label="Add new workout" onClick={() => router.push("/add_workout")} />
            <Button label="Home" onClick={() => router.push("/")} />
        </div>
    );
}
