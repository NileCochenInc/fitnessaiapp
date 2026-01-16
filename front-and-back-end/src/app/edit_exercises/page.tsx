"use client"; // must be client component for interactivity

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import ExerciseCard from "@/components/ExerciseCard";

type Exercise = {
  workout_exercise_id: number;
  exercise_id: number;
  name: string;
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get("workoutid");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutData, setWorkoutData] = useState({
    id: 0,
    workout_date: "",
    workout_kind: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editWorkoutMode, setEditWorkoutMode] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");

  // Temporary state for inputs
  const [editDate, setEditDate] = useState(workoutData.workout_date);
  const [editKind, setEditKind] = useState(workoutData.workout_kind);

  if (!workoutId) {
    return <p>Error: No workout ID provided</p>;
  }

  // Fetch workout details and exercises on page load
  useEffect(() => {
    const fetchWorkoutAndExercises = async () => {
      if (!workoutId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/exercises?workoutId=${workoutId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch workout data");
        } else {
          setWorkoutData({
            id: Number(workoutId),
            workout_date: data.workout_date,
            workout_kind: data.workout_kind,
          });

          setEditDate(data.workout_date);
          setEditKind(data.workout_kind);

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

  // Add new exercise
  const pushExercise = async () => {
    if (!workoutId || !newExerciseName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: Number(workoutId),
          name: newExerciseName.trim(),
        }),
      });

      if (res.status === 401) {
        setError("You must be logged in to add an exercise");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add exercise");
      } else {
        if (!data.workout_exercise_id) {
          throw new Error("Backend did not return valid workout_exercise_id");
        }
        setExercises((prev) => [...prev, data]);
        setNewExerciseName("");
      }
    } catch (err: any) {
      setError(err.message || "Network error while adding exercise");
    } finally {
      setLoading(false);
    }
  };

  // Delete exercise
  const handleDelete = async (workout_exercise_id: number) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/exercises?workoutExerciseId=${workout_exercise_id}`,
        { method: "DELETE" }
      );

      if (res.status === 401) {
        setError("You must be logged in to delete an exercise");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete exercise");

      setExercises((prev) =>
        prev.filter((e) => e.workout_exercise_id !== workout_exercise_id)
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save workout edits
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
      const res = await fetch(`/api/workouts?workoutId=${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_date: editDate,
          workout_kind: editKind,
        }),
      });

      if (res.status === 401) {
        setError("You must be logged in to edit this workout");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save workout");
      } else {
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

  const handleEdit = (workout_exercise_id: number, name: string) => {
    router.push(
      `/add_exercise_data?workout_exercise_id=${workout_exercise_id}&name=${name}&workoutId=${workoutId}`
    );
  };

  return (
    <div>
      {loading && <p>Loading workouts...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {workoutData.workout_kind} workout on {workoutData.workout_date}
            </h1>
            {!editWorkoutMode && (
              <Button label="Edit" onClick={() => setEditWorkoutMode(true)} />
            )}
          </div>

          {editWorkoutMode && (
            <div className="mb-4">
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
          )}

          {exercises.length === 0 && <p>No previous exercises yet.</p>}

          <ul>
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.workout_exercise_id}
                exercise_id={exercise.exercise_id}
                name={exercise.name}
                onDelete={() => handleDelete(exercise.workout_exercise_id)}
                onEdit={() => handleEdit(exercise.workout_exercise_id, exercise.name)}
              />
            ))}
          </ul>
        </div>
      )}

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
      <Button
        label="Back to Previous Workouts"
        onClick={() => router.push("/previous_workouts")}
      />
    </div>
  );
}
