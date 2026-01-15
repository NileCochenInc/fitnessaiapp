"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "../../components/Button";

/* ---------- Types ---------- */

type Metric = {
  metric: string;
  value: string;
  unit: string;
};

type Entry = {
  metrics: Metric[];
};

/* ---------- Component ---------- */

export default function Page() {
  const router = useRouter();
  const params= useParams();


  //get parameters from URL
  const searchParams = useSearchParams();
  const workout_exercise_id = searchParams.get("workout_exercise_id");
  const exercise_name = searchParams.get("name");
  const workoutId = searchParams.get("workoutId");

   if (!workoutId) {
        return <p>Error: No workout ID provided</p>;
    }
    if (!exercise_name) {
        return <p>Error: No exercise provided</p>;
    }
    if (!workout_exercise_id) {
        return <p>Error: No workout_exercise_id provided</p>;
    }


  /* ---------- State ---------- */
  const [entries, setEntries] = useState<Entry[]>([
    {
      metrics: [{ metric: "", value: "", unit: "" }]
    }
  ]);

  const [exerciseName, setExerciseName] = useState(exercise_name || "");




  /* ---------- Entry Actions ---------- */

  const addEntry = () => {
    setEntries(prev => [
      ...prev,
      { metrics: [{ metric: "", value: "", unit: "" }] }
    ]);
  };

  const removeEntry = (entryIndex: number) => {
    setEntries(prev => prev.filter((_, i) => i !== entryIndex));
  };

  /* ---------- Metric Actions ---------- */

  const addMetric = (entryIndex: number) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === entryIndex
          ? {
              ...entry,
              metrics: [...entry.metrics, { metric: "", value: "", unit: "" }]
            }
          : entry
      )
    );
  };

  const removeMetric = (entryIndex: number, metricIndex: number) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === entryIndex
          ? {
              ...entry,
              metrics: entry.metrics.filter((_, j) => j !== metricIndex)
            }
          : entry
      )
    );
  };

  const updateMetric = (
    entryIndex: number,
    metricIndex: number,
    field: keyof Metric,
    value: string
  ) => {
    setEntries(prev =>
      prev.map((entry, i) =>
        i === entryIndex
          ? {
              ...entry,
              metrics: entry.metrics.map((metric, j) =>
                j === metricIndex
                  ? { ...metric, [field]: value }
                  : metric
              )
            }
          : entry
      )
    );
  };

  /* ---------- Save ---------- */

  const pushExercise = () => {
    console.log(entries);
    // send `entries` to backend
  };

  /* ---------- Render ---------- */

  return (
    <div>
      <h1>{exerciseName}</h1>
      <h2>Add data</h2>

      <form>
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex} style={{ marginBottom: "1rem" }}>
            <h3>Entry {entryIndex + 1}</h3>

            {entry.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} style={{ marginBottom: "0.5rem" }}>
                <label>
                  Metric:
                  <input
                    type="text"
                    placeholder="weight"
                    value={metric.metric}
                    onChange={e =>
                      updateMetric(
                        entryIndex,
                        metricIndex,
                        "metric",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Value:
                  <input
                    type="text"
                    value={metric.value}
                    onChange={e =>
                      updateMetric(
                        entryIndex,
                        metricIndex,
                        "value",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Unit:
                  <input
                    type="text"
                    placeholder="lbs"
                    value={metric.unit}
                    onChange={e =>
                      updateMetric(
                        entryIndex,
                        metricIndex,
                        "unit",
                        e.target.value
                      )
                    }
                  />
                </label>

                <Button
                  label="- metric"
                  type="button"
                  onClick={() =>
                    removeMetric(entryIndex, metricIndex)
                  }
                />
              </div>
            ))}

            <Button
              label="Add metric"
              type="button"
              onClick={() => addMetric(entryIndex)}
            />

            <Button
              label="Remove entry"
              type="button"
              onClick={() => removeEntry(entryIndex)}
            />
          </div>
        ))}

        <Button
          label="Add entry"
          type="button"
          onClick={addEntry}
        />
      </form>

      <Button label="Save" onClick={pushExercise} />

      <Button label="Back to Exercises" onClick={() => router.push(`/edit_exercises?workoutid=${workoutId}`)} />
    </div>
  );
}
