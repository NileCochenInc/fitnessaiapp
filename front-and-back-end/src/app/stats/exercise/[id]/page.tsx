"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/Button";
import StatsCard from "@/components/StatsCard";
import { ExerciseStatsDTO } from "@/types/stats";

export default function ExerciseStatsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ExerciseStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exerciseId = params.id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch exercise stats
  useEffect(() => {
    const fetchExerciseStats = async () => {
      if (status !== "authenticated" || !exerciseId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/data/exercise-stats/${exerciseId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch exercise stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching exercise stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch exercise stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseStats();
  }, [status, exerciseId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2f3136]">
        <div className="text-[#dcddde] text-lg">Loading exercise details...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2f3136]">
        <div className="bg-[#36393f] rounded-xl shadow-lg p-6 border border-[#72767d] text-[#dcddde] max-w-md">
          <h2 className="text-xl font-bold mb-4 text-[#ed4245]">Error</h2>
          <p className="mb-6">{error || "Failed to load exercise stats"}</p>
          <div className="flex gap-2">
            <Button
              label="Back to Stats"
              onClick={() => router.push("/stats")}
              className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg transition-colors"
            />
            <Button
              label="Go Home"
              onClick={() => router.push("/")}
              className="flex-1 bg-[#72767d] hover:bg-[#626a72] text-white p-2 rounded-lg transition-colors"
            />
          </div>
        </div>
      </div>
    );
  }

  // Format metric name for display (e.g., "weight" -> "Weight")
  const formatMetricName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Format metric value for display
  const formatMetricValue = (value: number) => {
    // If it's a decimal, show up to 2 decimal places
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#2f3136] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#dcddde] mb-2">
            {stats.exerciseName}
          </h1>
          <p className="text-[#72767d]">Exercise statistics for this month</p>
        </div>

        {/* Main Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Frequency Card */}
          <StatsCard
            title="Times Performed"
            value={stats.frequencyThisMonth}
            unit="this month"
          />

          {/* Max Metrics Cards */}
          {Object.entries(stats.maxMetrics).map(([metricName, value]) => (
            <StatsCard
              key={metricName}
              title={`Max ${formatMetricName(metricName)}`}
              value={formatMetricValue(value)}
              unit={
                metricName.toLowerCase() === "weight"
                  ? "lbs"
                  : metricName.toLowerCase() === "distance"
                    ? "miles"
                    : metricName.toLowerCase() === "time"
                      ? "min"
                      : ""
              }
            />
          ))}
        </div>

        {/* Summary Section */}
        {stats.frequencyThisMonth > 0 && (
          <div className="bg-[#36393f] rounded-xl shadow-lg p-6 border border-[#72767d] mb-8">
            <h2 className="text-xl font-semibold text-[#dcddde] mb-3">
              Summary
            </h2>
            <p className="text-[#dcddde]">
              You performed <strong>{stats.exerciseName}</strong> a total of{" "}
              <strong className="text-[#5865f2]">
                {stats.frequencyThisMonth} time
                {stats.frequencyThisMonth === 1 ? "" : "s"}
              </strong>{" "}
              this month.
              {Object.keys(stats.maxMetrics).length > 0 && (
                <>
                  {" "}
                  Your best performance recorded{" "}
                  <strong className="text-[#5865f2]">
                    {Object.entries(stats.maxMetrics)
                      .map(
                        ([name, val]) =>
                          `${formatMetricValue(val)} ${name.toLowerCase()}`
                      )
                      .join(", ")}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            label="← Back to Stats"
            onClick={() => router.push("/stats")}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-3 rounded-lg transition-colors duration-200"
          />
          <Button
            label="Back to Home"
            onClick={() => router.push("/")}
            className="bg-[#72767d] hover:bg-[#626a72] text-white px-6 py-3 rounded-lg transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}
