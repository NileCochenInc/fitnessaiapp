"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "../../components/Button";
import EntryCard, { Entry } from "../../components/EntryCard";

export default function AddExerciseDataClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workout_exercise_id = searchParams.get("workout_exercise_id");
  const exercise_name = searchParams.get("name");
  const workoutId = searchParams.get("workoutId");

  const { data: session, status } = useSession();

  // ---------- Handle missing params or unauthenticated ----------
  if (!workoutId || !exercise_name || !workout_exercise_id) {
    return <p className="text-red-500">Error: Missing parameters</p>;
  }

  if (status === "loading") {
    return <p className="text-center text-[#dcddde]">Loading session...</p>;
  }

  if (!session?.user?.id) {
    router.push("/api/auth/signin");
    return null;
  }

  const userId = session.user.id;

  // ---------- State ----------
  const [exerciseName, setExerciseName] = useState(exercise_name);
  const [draftExerciseName, setDraftExerciseName] = useState(exercise_name);
  const [isEditingName, setIsEditingName] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- Fetch entries on page load ----------
  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch(
          `/api/exercise_data?workoutExerciseId=${workout_exercise_id}&userId=${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch entries");
        const data = await res.json();

        const mappedData: Entry[] = data.entries.map((entry: any) => ({
          ...entry,
          metrics: entry.metrics.map((metric: any) => ({
            metric: metric.key,
            value: metric.value_number ?? metric.value_text ?? "",
            unit: metric.unit ?? "",
          })),
        }));

        setEntries(
          mappedData.length > 0
            ? mappedData
            : [{ metrics: [{ metric: "", value: "", unit: "" }] }]
        );
      } catch (err) {
        console.error(err);
        alert("Could not load exercise entries");
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [workout_exercise_id, userId]);

  // ---------- Exercise Name Actions ----------
  const startEditExerciseName = () => {
    setDraftExerciseName(exerciseName);
    setIsEditingName(true);
  };

  const cancelEditExerciseName = () => {
    setDraftExerciseName(exerciseName);
    setIsEditingName(false);
  };

  const saveExerciseName = async () => {
    try {
      const res = await fetch("/api/exercises", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutExerciseId: Number(workout_exercise_id),
          name: draftExerciseName,
          userId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update exercise name");
      const updated = await res.json();
      setExerciseName(updated.name);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      alert("Could not save exercise name");
    }
  };

  // ---------- Entry Actions ----------
  const addEntry = () =>
    setEntries(prev => [...prev, { metrics: [{ metric: "", value: "", unit: "" }] }]);

  const updateEntry = (index: number, updatedEntry: Entry) => {
    setEntries(prev => prev.map((e, i) => (i === index ? updatedEntry : e)));
  };

  const removeEntry = (index: number) =>
    setEntries(prev => prev.filter((_, i) => i !== index));

  // ---------- Save All Entries ----------
  const pushExercise = async () => {
    try {
      const mappedEntries = entries.map(entry => ({
        ...entry,
        metrics: entry.metrics.map(metric => ({
          key: metric.metric,
          value_number: Number(metric.value),
          value_text: metric.value,
          unit: metric.unit,
        })),
      }));

      const res = await fetch("/api/exercise_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutExerciseId: Number(workout_exercise_id),
          userId,
          name: exerciseName,
          entries: mappedEntries,
        }),
      });

      if (!res.ok) throw new Error("Failed to save exercise entries");
      alert("Exercise saved!");
    } catch (err) {
      console.error(err);
      alert("Could not save exercise entries");
    }
  };

  // ---------- Render ----------
  if (loading)
    return <p className="text-center text-[#dcddde]">Loading entries...</p>;

  return (
    <div className="min-h-screen bg-[#2f3136] p-4 text-[#dcddde] flex flex-col items-center">
      {/* Exercise name */}
      <div className="w-full max-w-2xl mb-4">
        {!isEditingName ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#36393f] p-4 rounded-xl shadow-lg">
            <h1 className="text-xl font-bold">{exerciseName}</h1>
            <Button
              label="Edit"
              type="button"
              onClick={startEditExerciseName}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#36393f] p-4 rounded-xl shadow-lg">
            <input
              className="p-2 rounded-lg border border-[#72767d] bg-[#2f3136] text-[#dcddde] w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              value={draftExerciseName}
              onChange={e => setDraftExerciseName(e.target.value)}
            />
            <Button
              label="Save"
              type="button"
              onClick={saveExerciseName}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
            />
            <Button
              label="Cancel"
              type="button"
              onClick={cancelEditExerciseName}
              className="bg-[#72767d] hover:bg-[#5b5d61] text-white p-2 rounded-lg w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryCard
            key={index}
            index={index}
            entry={entry}
            onUpdateEntry={updateEntry}
            onRemoveEntry={removeEntry}
          />
        ))}

        <Button
          label="Add entry"
          type="button"
          onClick={addEntry}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full"
        />

        <Button
          label="Save"
          onClick={pushExercise}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full mt-2"
        />

        <Button
          label="Back to Exercises"
          onClick={() => router.push(`/edit_exercises?workoutid=${workoutId}`)}
          className="bg-[#72767d] hover:bg-[#5b5d61] text-white p-2 rounded-lg w-full mt-2"
        />
      </div>
    </div>
  );
}
