"use client"; // must be client component for interactivity

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from '../../components/Button';
import { WorkoutSchema, WorkoutJSON } from "@/types/workouts";





export default function Page() {
    const router = useRouter();

    const [date, setDate]   = useState("");
    const [workout_kind, setWorkoutKind] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    


    const pushWorkout = async () => {
        //push new workout to database
        //push workout date and workout type


        setLoading(true);
        setError(null);

        const payload: WorkoutJSON = {
                user_id: 1, //hardcoded user id for now
                workout_date: date,
                workout_kind: workout_kind
        }

        //validate form data
        const parsed = WorkoutSchema.safeParse(payload);

        //handle validation failure
        if (!parsed.success) {
        
            const messages = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`);
            setError(messages.join(", "));
            return;
        }

    
        try {

            
            //make POST request to backend
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(parsed.data),
            });


            //throw error if request fails
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Failed to create workout");
            }
            

            // log returned workout
            const workout = await res.json();
            console.log("Created workout:", workout);

            //navigate to add exercise page if successful
            router.push(`/edit_exercises?workoutid=${workout.id}`);

        
        } catch (err) {
            //handle errors
            console.error(err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }

    }


    return (
        <div>
        <h1>Add workout</h1>
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
                    value={workout_kind} 
                    onChange={(e) => setWorkoutKind(e.target.value)}
                />
            </label>

            {/* display error if error */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Button    
                label={loading ? "Saving..." : "Save"}
                disabled={loading}
            />
        </form>
        </div>
        );

}