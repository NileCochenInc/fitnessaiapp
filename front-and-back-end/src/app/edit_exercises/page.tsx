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
    const dummyWorkout = { id: 1, workout_date: "2026-01-01", workout_kind: " " };

    //dummy exercises
    const dummyExercises = [
        {exercise_id: 1, name: " ", },
        {exercise_id: 2, name: " ", },
        {exercise_id: 3, name: " ", },
        {exercise_id: 4, name: " ", },
        {exercise_id: 5, name: " ", },
        {exercise_id: 6, name: " ", },
        {exercise_id: 7, name: " ", },
    ];

    const [exercises, setExercises] = useState(dummyExercises);
    const [workoutData, setWorkoutData] = useState(dummyWorkout);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editWorkoutMode, setEditWorkoutMode] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState("");

    // Temporary state for inputs
    const [editDate, setEditDate] = useState(workoutData.workout_date);
    const [editKind, setEditKind] = useState(workoutData.workout_kind);

    const searchParams = useSearchParams();
    const workoutId = searchParams.get("workoutid");
   

    if (!workoutId) {
        return <p>Error: No workout ID provided</p>;

    }


    useEffect(() => {
    const fetchWorkoutAndExercises = async () => {
        if (!workoutId) return;

        setLoading(true);
        setError(null);

        try {
        // TEMP: hard-coded userId for development
        const userId = 1;

        const res = await fetch(
            `/api/exercises?workoutId=${workoutId}&userId=${userId}`
        );

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Failed to fetch workout data");
        } else {
            // Set workout metadata
            setWorkoutData({
            id: Number(workoutId),
            workout_date: data.workout_date,
            workout_kind: data.workout_kind,
            });

            // Set exercises array (empty if none)
            setExercises(data.exercises || []);
        }
        } catch (err: any) {
        console.error("Error fetching workout data:", err);
        setError("Network error while fetching workout data");
        } finally {
        setLoading(false);
        }
    };

    fetchWorkoutAndExercises();
    }, [workoutId]);





    const pushExercise = async () => {
    if (!workoutId) return;
    if (!newExerciseName.trim()) {
        setError("Exercise name cannot be empty");
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const userId = 1; // Replace with real user ID or auth token later
        const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            workoutId: Number(workoutId),
            userId,
            name: newExerciseName.trim(),
        }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || "Failed to add exercise");
        } else {
        // Add the new exercise to state
        setExercises((prev) => [...prev, data]);
        setNewExerciseName(""); // clear input
        }
    } catch (err: any) {
        console.error("Error adding exercise:", err);
        setError("Network error while adding exercise");
    } finally {
        setLoading(false);
    }
    };

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


                <input
                    type="text"
                    placeholder="Exercise name"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                />


            </form>
            <Button label="Add" onClick={pushExercise} />
            <Button label="Back to Previous Workouts" onClick={() => router.push("/previous_workouts")} />
            
        </div>
        );

}