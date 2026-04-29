import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// =============================
// GET /api/data/user-stats
// Returns general statistics for the authenticated user this month:
// - Total workouts
// - Average workouts per week
// - Exercise frequency
// =============================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Call data-tool endpoint
    const dataToolUrl = process.env.DATA_TOOL_URL || "http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io";
    const dataToolRes = await fetch(`${dataToolUrl}/api/user-stats/${userId}`, {
      signal: AbortSignal.timeout(30000), // 30s — data-tool is always warm (min_replicas=1)
    });
    const data = await dataToolRes.json();

    return NextResponse.json(data, { status: dataToolRes.status });
  } catch (err: any) {
    console.error("Error in GET /api/data/user-stats:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
