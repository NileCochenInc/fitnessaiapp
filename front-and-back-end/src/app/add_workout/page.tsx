"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from '../../components/Button';
import { WorkoutSchema } from "@/types/workouts";

export default function Page() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [workoutKind, setWorkoutKind] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pushWorkout = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      workout_date: date,
      workout_kind: workoutKind
    };

    const parsed = WorkoutSchema.pick({ workout_date: true, workout_kind: true }).safeParse(payload);

    if (!parsed.success) {
      const messages = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`);
      setError(messages.join(", "));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create workout");
      }

      const workout = await res.json();
      console.log("Created workout:", workout);

      router.push(`/edit_exercises?workoutid=${workout.id}`);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2f3136" }}>
      <div className="bg-[#36393f] w-full max-w-md p-8 rounded-xl shadow-lg flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-[#dcddde]">Add Workout</h1>

        {error && (
          <p className="bg-[#ed4245] text-white p-2 rounded text-center">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushWorkout();
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col text-[#dcddde] font-semibold">
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 p-3 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              required
            />
          </label>

          <label className="flex flex-col text-[#dcddde] font-semibold">
            Workout type:
            <input
              type="text"
              value={workoutKind}
              onChange={(e) => setWorkoutKind(e.target.value)}
              className="mt-1 p-3 rounded bg-[#2f3136] text-[#dcddde] border border-[#72767d] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              placeholder="e.g., Cardio, Strength"
              required
            />
          </label>

          <Button
            label={loading ? "Saving..." : "Save"}
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200 disabled:bg-gray-500"
          />
        </form>

        <Button
          label="Home"
          onClick={() => router.push("/")}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-3 rounded transition-colors duration-200"
        />
      </div>
    </div>
  );
}
