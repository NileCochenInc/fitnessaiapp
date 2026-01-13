"use client"; // must be client component for interactivity

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from '../../components/Button';
import { WorkoutJSON } from "@/types/workouts";





export default function Page() {
    const router = useRouter();

    const [date, setDate]   = useState("");
    const [workout_kind, setWorkoutKind] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const goToAddExercise = () => {
        router.push("/add_exercise"); // navigate to /add_exercise
    };

    const pushWorkout = async () => {
        //push new workout to database
        //push workout date and workout type


        setLoading(true);

        try {


            const payload: WorkoutJSON = {
                user_id: 1, //hardcoded user id for now
                workout_date: date,
                workout_kind: workout_kind
            }
            
            //make POST request to backend
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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
            goToAddExercise();

        
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
                    type="text" 
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
                onClick={pushWorkout}
                disabled={loading}
            />
        </form>
        </div>
        );

}