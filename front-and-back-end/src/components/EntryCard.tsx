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
    <div className="bg-[#36393f] p-4 rounded-xl shadow-lg mb-4">
      <h3 className="font-semibold text-[#dcddde] mb-3 text-lg">Entry {index + 1}</h3>

      {entry.metrics.map((metric, metricIndex) => (
        <div
          key={metricIndex}
          className="flex flex-col sm:flex-row sm:items-end gap-3 mb-3"
        >
          <div className="flex flex-col">
            <label className="text-sm font-medium text-[#b9bbbe]">Metric</label>
            <input
              className="p-2 rounded-lg border border-[#72767d] bg-[#2f3136] text-[#dcddde] w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              type="text"
              placeholder="e.g. weight"
              value={metric.metric}
              onChange={e => updateMetric(metricIndex, "metric", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-[#b9bbbe]">Value</label>
            <input
              className="p-2 rounded-lg border border-[#72767d] bg-[#2f3136] text-[#dcddde] w-full sm:w-20 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              type="text"
              placeholder="e.g. 10"
              value={metric.value}
              onChange={e => updateMetric(metricIndex, "value", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-[#b9bbbe]">Unit</label>
            <input
              className="p-2 rounded-lg border border-[#72767d] bg-[#2f3136] text-[#dcddde] w-full sm:w-20 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              type="text"
              placeholder="e.g. lbs"
              value={metric.unit}
              onChange={e => updateMetric(metricIndex, "unit", e.target.value)}
            />
          </div>

          <Button
            label="– metric"
            type="button"
            onClick={() => removeMetric(metricIndex)}
            className="bg-[#ed4245] hover:bg-[#b3393c] text-white p-2 rounded-lg w-full sm:w-auto mt-2 sm:mt-0"
          />
        </div>
      ))}

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button
          label="Add metric"
          type="button"
          onClick={addMetric}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg w-full sm:w-auto"
        />
        <Button
          label="Remove entry"
          type="button"
          onClick={() => onRemoveEntry(index)}
          className="bg-[#ed4245] hover:bg-[#b3393c] text-white p-2 rounded-lg w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
