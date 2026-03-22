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
    const dataToolRes = await fetch(`http://data-tool:8080/api/user-stats/${userId}`);
    const data = await dataToolRes.json();

    return NextResponse.json(data, { status: dataToolRes.status });
  } catch (err: any) {
    console.error("Error in GET /api/data/user-stats:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
