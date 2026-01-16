"use client"; // must be client component for interactivity

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

        // Validate only the fields backend expects
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

            // Navigate to add exercises page
            router.push(`/edit_exercises?workoutid=${workout.id}`);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add Workout</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    pushWorkout();
                }}
            >
                <label>
                    Date:
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                <label>
                    Workout type:
                    <input
                        type="text"
                        value={workoutKind}
                        onChange={(e) => setWorkoutKind(e.target.value)}
                    />
                </label>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <Button
                    label={loading ? "Saving..." : "Save"}
                    disabled={loading}
                />
            </form>

            <Button label="Home" onClick={() => router.push("/")} />
        </div>
    );
}
