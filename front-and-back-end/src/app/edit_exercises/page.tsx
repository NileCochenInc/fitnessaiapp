"use client"; // must be client component for interactivity


import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from '@/components/Button';
import React, { useState, useEffect } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import { set } from "zod";



export default function Page() {
    const router = useRouter();
    const params= useParams();


    //dummy data
    const dummyWorkout = { id: 1, workout_date: "2026-01-01", workout_kind: "Cardio" };

    //dummy exercises
    const dummyExercises = [
        {exercise_id: 1, name: "Push Ups", },
        {exercise_id: 2, name: "Squats", },
        {exercise_id: 3, name: "Lunges", },
        {exercise_id: 4, name: "Plank", },
        {exercise_id: 5, name: "Burpees", },
        {exercise_id: 6, name: "Mountain Climbers", },
        {exercise_id: 7, name: "Jumping Jacks", },
    ];

    const [exercises, setExercises] = useState(dummyExercises);
    const [workoutData, setWorkoutData] = useState(dummyWorkout);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editWorkoutMode, setEditWorkoutMode] = useState(false);

    // Temporary state for inputs
    const [editDate, setEditDate] = useState(workoutData.workout_date);
    const [editKind, setEditKind] = useState(workoutData.workout_kind);

    const searchParams = useSearchParams();
    const workoutId = searchParams.get("workoutid");
   

    if (!workoutId) {
        return <p>Error: No workout ID provided</p>;

    }


    //get workout data and exercises from backend
    useEffect(() => {

    
    }, []); // empty dependency array = runs once on mount




    const pushExercise = () => {
        //push workout_excercise to backend
        //push excercise name
    }

    //delete exercise
    const handleDelete = (exercise_id: number) => {

    }

    //navidate to add exercise data page
    const handleEdit = (exercise_id: number) => {
    }


    const handleSave = async () => {

        if (!workoutId) {
            setError("No workout ID available");
            return;
        }

        if (!editDate || !editKind) {
            setError("Both fields are required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userId = 1; // Replace with real user ID if available
            const res = await fetch(`/api/workouts?workoutId=${workoutId}&userId=${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workout_date: editDate,
                    workout_kind: editKind,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // API returned an error
                setError(data.error || "Failed to save workout");
            } else {
                // Successfully updated
                setWorkoutData(data);
                setEditWorkoutMode(false);
            }
        } catch (err: any) {
            console.error("Error saving workout:", err);
            setError("Network error while saving workout");
        } finally {
            setLoading(false);
        }

    };

    const handleCancel = () => {
        setEditWorkoutMode(false);
        setEditDate(workoutData.workout_date);
        setEditKind(workoutData.workout_kind);
        setError(null);
    };


    



    return (
        <div>
            {loading && <p>Loading workouts...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            
            {!loading && !error && <div>
                
                <div className="mb-4 flex items-center gap-2">
                <h1 className="text-xl font-bold">
                    {workoutData.workout_kind} workout on {workoutData.workout_date}
                </h1>
                {!editWorkoutMode && (
                    <Button label="Edit" onClick={() => setEditWorkoutMode(true)} />
                )}
                </div>
                
                {editWorkoutMode  && (<div className="mb-4">
                    <label htmlFor="editDate">Edit Date:</label>
                    <input
                        id="editDate"
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                    />
                    <label htmlFor="editKind">Edit Kind:</label>
                    <input
                        id="editKind"
                        type="text"
                        value={editKind}
                        onChange={(e) => setEditKind(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                        <Button label="Save" onClick={handleSave} />
                        <Button label="Cancel" onClick={handleCancel} />
                    </div>
                </div>
                ) }

            
                {exercises.length === 0 && <p>No previous exercises yet.</p>}
            
                    <ul>
                        {exercises.map((exercise) => (
                            <ExerciseCard 
                                key = {exercise.exercise_id}
                                exercise_id = {exercise.exercise_id}
                                name={exercise.name}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        ))}
                    </ul>
            </div>}

            <h1 className="text-xl font-bold mb-4">Add exercise</h1>
            <form>


                <input type="text" placeholder="Exercise name"></input>


            </form>
            <Button label="Add" onClick={pushExercise} />
            
        </div>
        );

}