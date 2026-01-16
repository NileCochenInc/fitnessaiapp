"use client";

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
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`/api/workouts`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch workouts");
        }

        const data: Workout[] = await response.json();

        const sortedData = data.sort(
          (a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
        );

        setWorkouts(sortedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-[#2f3136] flex flex-col items-center">
      {loading && <p className="text-[#dcddde]">Loading workouts...</p>}
      {error && <p className="bg-[#ed4245] text-white p-2 mb-4 rounded">{error}</p>}

      {!loading && !error && (
        <div className="w-full max-w-lg flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-[#dcddde] text-center">Previous Workouts</h1>

          {workouts.length === 0 && (
            <p className="text-[#b9bbbe] text-center">No previous workouts found.</p>
          )}

          <ul className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-4 mt-4">
            <Button
              label="Add new workout"
              onClick={() => router.push("/add_workout")}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200"
            />
            <Button
              label="Home"
              onClick={() => router.push("/")}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
