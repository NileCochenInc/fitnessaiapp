"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import ExerciseCard from "@/components/ExerciseCard";

type Exercise = {
  workout_exercise_id: number;
  exercise_id: number;
  name: string;
};

export default function PageClient() {
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

  const [editDate, setEditDate] = useState(workoutData.workout_date);
  const [editKind, setEditKind] = useState(workoutData.workout_kind);

  if (!workoutId) {
    return <p className="text-[#ed4245] text-center">Error: No workout ID provided</p>;
  }

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
    <div className="min-h-screen p-4 bg-[#2f3136] text-[#dcddde]">
      {loading && <p className="text-center">Loading workouts...</p>}
      {error && <p className="text-red-500 text-center mb-2">{error}</p>}

      {!loading && !error && (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

          {/* Workout card */}
          <div className="bg-[#36393f] p-4 rounded-xl shadow-lg flex flex-col gap-2">
            <h1 className="text-xl font-bold">
              {workoutData.workout_kind} workout on {workoutData.workout_date}
            </h1>

            {/* Edit button always below title */}
            {!editWorkoutMode && (
              <div className="flex justify-center mt-2">
                <Button
                  label="Edit"
                  onClick={() => setEditWorkoutMode(true)}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
                />
              </div>
            )}
          </div>

          {/* Edit workout form */}
          {editWorkoutMode && (
            <div className="bg-[#36393f] p-4 rounded-xl shadow-lg flex flex-col gap-2">
              <label htmlFor="editDate">Edit Date:</label>
              <input
                id="editDate"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="p-2 rounded-lg bg-[#2f3136] border border-[#72767d] text-[#dcddde] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              />
              <label htmlFor="editKind">Edit Kind:</label>
              <input
                id="editKind"
                type="text"
                value={editKind}
                onChange={(e) => setEditKind(e.target.value)}
                className="p-2 rounded-lg bg-[#2f3136] border border-[#72767d] text-[#dcddde] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  label="Save"
                  onClick={handleSave}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
                />
                <Button
                  label="Cancel"
                  onClick={handleCancel}
                  className="bg-[#72767d] hover:bg-[#5b5d61] text-white p-2 rounded-lg w-full sm:w-auto"
                />
              </div>
            </div>
          )}

          {/* Exercises list */}
          <ul className="flex flex-col gap-2">
            {exercises.length === 0 && (
              <p className="text-center text-[#b9bbbe]">No previous exercises yet.</p>
            )}
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.workout_exercise_id}
                exercise_id={exercise.exercise_id}
                name={exercise.name}
                onDelete={() =>
                  handleDelete(exercise.workout_exercise_id)
                }
                onEdit={() =>
                  handleEdit(exercise.workout_exercise_id, exercise.name)
                }
              />
            ))}
          </ul>

          {/* Add exercise form */}
          <div className="bg-[#36393f] p-4 rounded-xl shadow-lg flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Add exercise</h2>
            <input
              type="text"
              placeholder="Exercise name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="p-2 rounded-lg bg-[#2f3136] border border-[#72767d] text-[#dcddde] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                label="Add"
                onClick={pushExercise}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
              />
              <Button
                label="Back to Previous Workouts"
                onClick={() => router.push("/previous_workouts")}
                className="bg-[#72767d] hover:bg-[#5b5d61] text-white p-2 rounded-lg w-full sm:w-auto"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
