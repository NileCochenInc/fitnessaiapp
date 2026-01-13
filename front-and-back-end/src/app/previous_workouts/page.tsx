"use client"; // must be client component for interactivity

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from '../../components/Button';

type Workout = {
  id: number;
  date: string;
  workout_kind: string;
};



export default function Page() {
    const router = useRouter();

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 

    const userId = "123"; //hardcoded for now


    //fetch previous workouts from backend on component mount
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await fetch(`/api/workouts?userId=${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch workouts");
                }
                const data: Workout[] = await response.json();
                setWorkouts(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, [userId]);


    return (
    

    <div className="p-4">
      {loading && <p>Loading workouts...</p>}
      {error && <p>Error: {error}</p>}


      {!loading && !error && <div>
        <h1 className="text-xl font-bold mb-4">Previous Workouts</h1>

        {workouts.length === 0 && <p>No previous workouts found.</p>}

        <ul>
            {workouts.map((workout) => (
            <li key={workout.id} className="mb-3 border p-2 rounded">
                <p>
                <strong>Date:</strong> {workout.date}
                </p>
                <p>
                <strong>Type:</strong> {workout.workout_kind}
                </p>
            </li>
            ))}
        </ul>
      </div>}

      <Button label="Add new workout" onClick={() => router.push("/add_workout")} />
    </div>
    );

}