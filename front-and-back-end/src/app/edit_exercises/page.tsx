"use client"; // must be client component for interactivity


import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from '@/components/Button';
import React, { useState, useEffect } from "react";
import ExerciseCard from "@/components/ExcerciseCard";



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

    //handle changes to workout data
    const handleEditWorkout = () => {

    }
    



    return (
        <div>
            {loading && <p>Loading workouts...</p>}
            {error && <p>Error: {error}</p>}
            
            
            {!loading && !error && <div>
                <h1 className="text-xl font-bold mb-4">{workoutData.workout_kind} workout on {workoutData.workout_date}</h1>
            
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