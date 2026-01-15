"use client";

import Button from "@/components/Button";

export type Metric = {
  metric: string;
  value: string;
  unit: string;
};

export type Entry = {
  metrics: Metric[];
};

type EntryCardProps = {
  entry: Entry;
  index: number;
  onUpdateEntry: (index: number, updatedEntry: Entry) => void;
  onRemoveEntry: (index: number) => void;
};

export default function EntryCard({ entry, index, onUpdateEntry, onRemoveEntry }: EntryCardProps) {
  const addMetric = () => {
    const newMetrics = [...entry.metrics, { metric: "", value: "", unit: "" }];
    onUpdateEntry(index, { ...entry, metrics: newMetrics });
  };

  const removeMetric = (metricIndex: number) => {
    const newMetrics = entry.metrics.filter((_, i) => i !== metricIndex);
    onUpdateEntry(index, { ...entry, metrics: newMetrics });
  };

  const updateMetric = (metricIndex: number, field: keyof Metric, value: string) => {
    const newMetrics = entry.metrics.map((m, i) =>
      i === metricIndex ? { ...m, [field]: value } : m
    );
    onUpdateEntry(index, { ...entry, metrics: newMetrics });
  };

  return (
    <div className="border p-3 rounded mb-3">
      <h3 className="font-semibold mb-2">Entry {index + 1}</h3>

      {entry.metrics.map((metric, metricIndex) => (
        <div key={metricIndex} className="flex gap-2 mb-2 items-center">
          <input
            className="border p-1 rounded"
            type="text"
            placeholder="Metric"
            value={metric.metric}
            onChange={e => updateMetric(metricIndex, "metric", e.target.value)}
          />
          <input
            className="border p-1 rounded"
            type="text"
            placeholder="Value"
            value={metric.value}
            onChange={e => updateMetric(metricIndex, "value", e.target.value)}
          />
          <input
            className="border p-1 rounded"
            type="text"
            placeholder="Unit"
            value={metric.unit}
            onChange={e => updateMetric(metricIndex, "unit", e.target.value)}
          />
          <Button label="– metric" type="button" onClick={() => removeMetric(metricIndex)} />
        </div>
      ))}

      <div className="flex gap-2">
        <Button label="Add metric" type="button" onClick={addMetric} />
        <Button label="Remove entry" type="button" onClick={() => onRemoveEntry(index)} />
      </div>
    </div>
  );
}
