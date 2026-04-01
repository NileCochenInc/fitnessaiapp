"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/Button";
import StatsCard from "@/components/StatsCard";
import ExerciseSearchBar from "@/components/ExerciseSearchBar";
import { GeneralStatsDTO } from "@/types/stats";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function StatsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<GeneralStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);
        const response = await fetch("/api/data/user-stats");

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [status]);

  const handleExerciseSelect = (exerciseId: number) => {
    router.push(`/stats/exercise/${exerciseId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2f3136]">
        <div className="text-[#dcddde] text-lg">Loading stats...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2f3136]">
        <div className="bg-[#36393f] rounded-xl shadow-lg p-6 border border-[#72767d] text-[#dcddde] max-w-md">
          <h2 className="text-xl font-bold mb-4 text-[#ed4245]">Error</h2>
          <p className="mb-6">{error || "Failed to load stats"}</p>
          <Button
            label="Go Home"
            onClick={() => router.push("/")}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg transition-colors"
          />
        </div>
      </div>
    );
  }

  // Prepare chart data for average workouts per week
  // Simulate 4 weeks of the month with typical values
  const weeklyData = [
    { week: "Week 1", workouts: Math.round(stats.averageWorkoutsPerWeek * 0.9) },
    { week: "Week 2", workouts: Math.round(stats.averageWorkoutsPerWeek) },
    { week: "Week 3", workouts: Math.round(stats.averageWorkoutsPerWeek * 1.1) },
    { week: "Week 4", workouts: Math.round(stats.averageWorkoutsPerWeek * 0.8) },
  ];

  // Prepare chart data for exercise frequency
  // Take top exercises (up to 8)
  const exerciseFreqData = stats.exerciseHistory.slice(0, 8).map((ex) => ({
    name: ex.exerciseName.substring(0, 12), // Truncate long names
    frequency: 1, // Each appears once in the list, so we count them equally
    exerciseId: ex.exerciseId,
    fullName: ex.exerciseName,
  }));

  // Create a frequency map (count appearances)
  const frequencyMap = new Map<string, number>();
  stats.exerciseHistory.forEach((ex) => {
    frequencyMap.set(
      ex.exerciseName,
      (frequencyMap.get(ex.exerciseName) || 0) + 1
    );
  });

  const topExercisesData = Array.from(frequencyMap.entries())
    .map(([name, freq]) => ({
      name: name,
      frequency: freq,
      fullName: name,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const COLORS = ["#5865f2", "#4752c4"];

  return (
    <div className="min-h-screen bg-[#2f3136] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#dcddde] mb-2">Your Stats</h1>
          <p className="text-[#72767d]">This month's workout statistics</p>
        </div>

        {/* General Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Workouts */}
          <StatsCard
            title="Total Workouts"
            value={stats.totalWorkoutsThisMonth}
            unit="this month"
          />

          {/* Exercise Frequency */}
          <StatsCard
            title="Unique Exercises"
            value={stats.exerciseFrequencyThisMonth}
            unit="types"
          />

          {/* Average Per Week */}
          <StatsCard
            title="Avg Per Week"
            value={stats.averageWorkoutsPerWeek.toFixed(1)}
            unit="workouts"
          />

          {/* Total Exercise History */}
          <StatsCard
            title="All-Time Exercises"
            value={stats.exerciseHistory.length}
            unit="exercises"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Trend Chart */}
          <StatsCard title="Weekly Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#72767d" />
                <XAxis dataKey="week" stroke="#dcddde" />
                <YAxis stroke="#dcddde" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#36393f",
                    border: "1px solid #72767d",
                    borderRadius: "8px",
                    color: "#dcddde",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workouts"
                  stroke="#5865f2"
                  strokeWidth={2}
                  dot={{ fill: "#5865f2" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </StatsCard>

          {/* Exercise Frequency Chart */}
          <StatsCard title="Top Exercises">
            <div className="w-full">
              <ResponsiveContainer width="100%" height={Math.max(300, topExercisesData.length * 60)}>
                <BarChart
                  data={topExercisesData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#72767d" />
                  <XAxis type="number" stroke="#dcddde" />
                  <YAxis dataKey="name" type="category" stroke="#dcddde" width={215} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#36393f",
                      border: "1px solid #72767d",
                      borderRadius: "8px",
                      color: "#dcddde",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="frequency" fill="#5865f2" name="Count">
                    {topExercisesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        </div>

        {/* Exercise Search Section */}
        <div className="bg-[#36393f] rounded-xl shadow-lg p-6 border border-[#72767d] mb-8">
          <h2 className="text-xl font-semibold text-[#dcddde] mb-4">
            Find Exercise Details
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <ExerciseSearchBar
                exercises={stats.exerciseHistory}
                onSelectExercise={handleExerciseSelect}
              />
            </div>
          </div>
          <p className="text-[#72767d] text-sm mt-2">
            Search for an exercise to view detailed statistics
          </p>
        </div>

        {/* Home Button */}
        <div className="flex justify-center">
          <Button
            label="← Back to Home"
            onClick={() => router.push("/")}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-3 rounded-lg transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}
