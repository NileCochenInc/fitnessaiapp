import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// =============================
// GET /api/data/exercise-stats/[exerciseId]
// Returns specific statistics for an exercise this month for the authenticated user:
// - Frequency (times performed)
// - Max metrics (for each metric type available)
// =============================

export async function GET(
  req: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const exerciseId = Number(params.exerciseId);

    // Validate exerciseId
    if (!Number.isInteger(exerciseId) || exerciseId <= 0) {
      return NextResponse.json({ error: "Invalid exerciseId" }, { status: 400 });
    }

    // Call data-tool endpoint
    const dataToolRes = await fetch(
      `http://data-tool:8080/api/exercise-stats/${userId}/${exerciseId}`
    );
    const data = await dataToolRes.json();

    return NextResponse.json(data, { status: dataToolRes.status });
  } catch (err: any) {
    console.error("Error in GET /api/data/exercise-stats:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
