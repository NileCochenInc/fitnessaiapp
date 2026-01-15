"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "../../components/Button";
import EntryCard, { Entry } from "../../components/EntryCard";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workout_exercise_id = searchParams.get("workout_exercise_id");
  const exercise_name = searchParams.get("name");
  const workoutId = searchParams.get("workoutId");

  if (!workoutId || !exercise_name || !workout_exercise_id) {
    return <p>Error: Missing parameters</p>;
  }

  const [exerciseName, setExerciseName] = useState(exercise_name);
  const [draftExerciseName, setDraftExerciseName] = useState(exercise_name);
  const [isEditingName, setIsEditingName] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([
    { metrics: [{ metric: "", value: "", unit: "" }] },
  ]);

  /* ---------- Exercise Name Actions ---------- */

  const startEditExerciseName = () => {
    setDraftExerciseName(exerciseName);
    setIsEditingName(true);
  };

  const cancelEditExerciseName = () => {
    setDraftExerciseName(exerciseName);
    setIsEditingName(false);
  };

  const saveExerciseName = async () => {
    if (!workout_exercise_id) return;

    try {
      const response = await fetch("/api/exercises", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutExerciseId: Number(workout_exercise_id),
          name: draftExerciseName,
          userId: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to update exercise name");

      const updated = await response.json();
      setExerciseName(updated.name);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      alert("Could not save exercise name");
    }
  };

  /* ---------- Entry Actions ---------- */

  const addEntry = () => setEntries(prev => [...prev, { metrics: [{ metric: "", value: "", unit: "" }] }]);

  const updateEntry = (index: number, updatedEntry: Entry) => {
    setEntries(prev => prev.map((e, i) => (i === index ? updatedEntry : e)));
  };

  const removeEntry = (index: number) => setEntries(prev => prev.filter((_, i) => i !== index));

  /* ---------- Save All Entries ---------- */

  const pushExercise = () => {
    console.log(entries);
    // send entries to backend
  };

  /* ---------- Render ---------- */

  return (
    <div>
      {/* Exercise name */}
      {!isEditingName ? (
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-bold">{exerciseName}</h1>
          <Button label="Edit" type="button" onClick={startEditExerciseName} />
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <input
            className="border p-1 rounded"
            value={draftExerciseName}
            onChange={e => setDraftExerciseName(e.target.value)}
          />
          <Button label="Save" type="button" onClick={saveExerciseName} />
          <Button label="Cancel" type="button" onClick={cancelEditExerciseName} />
        </div>
      )}

      <h2 className="mb-2">Add data</h2>

      <div>
        {entries.map((entry, index) => (
          <EntryCard
            key={index}
            index={index}
            entry={entry}
            onUpdateEntry={updateEntry}
            onRemoveEntry={removeEntry}
          />
        ))}
      </div>

      <Button label="Add entry" type="button" onClick={addEntry} className="mt-2" />

      <Button label="Save" onClick={pushExercise} className="mt-4" />

      <Button
        label="Back to Exercises"
        onClick={() => router.push(`/edit_exercises?workoutid=${workoutId}`)}
        className="mt-2"
      />
    </div>
  );
}
