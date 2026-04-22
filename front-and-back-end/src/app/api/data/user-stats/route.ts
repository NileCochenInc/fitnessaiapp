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
  const timestamp = new Date().toISOString();
  console.log(`\n[user-stats] ========== REQUEST START ==========`);
  console.log(`[user-stats] [${timestamp}] Incoming request to /api/data/user-stats`);
  console.log(`[user-stats] NEXTAUTH_SECRET configured: ${!!process.env.NEXTAUTH_SECRET}`);
  console.log(`[user-stats] NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
  
  try {
    console.log(`[user-stats] Attempting to get server session...`);
    const session = await getServerSession(authOptions);
    
    console.log(`[user-stats] Session retrieval completed`);
    console.log(`[user-stats] Session object:`, JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error(`[user-stats] ❌ Session is NULL`);
      return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 });
    }
    
    if (!session.user) {
      console.error(`[user-stats] ❌ Session exists but no user object`);
      console.log(`[user-stats] Session keys:`, Object.keys(session));
      return NextResponse.json({ error: "Unauthorized - no user in session" }, { status: 401 });
    }
    
    if (!session.user.id) {
      console.error(`[user-stats] ❌ Session user has no ID`);
      console.log(`[user-stats] User object:`, JSON.stringify(session.user, null, 2));
      return NextResponse.json({ error: "Unauthorized - no user ID" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[user-stats] ✓ Session validated. User ID: ${userId}`);

    // Call data-tool endpoint
    const dataToolUrl = process.env.DATA_TOOL_URL || "http://data-tool:8080";
    console.log(`[user-stats] Calling data-tool at: ${dataToolUrl}/api/user-stats/${userId}`);
    
    const dataToolRes = await fetch(`${dataToolUrl}/api/user-stats/${userId}`);
    console.log(`[user-stats] Data-tool response status: ${dataToolRes.status}`);
    
    if (!dataToolRes.ok) {
      const errorText = await dataToolRes.text();
      console.error(`[user-stats] ❌ Data-tool error ${dataToolRes.status}: ${errorText}`);
    }
    
    const data = await dataToolRes.json();
    console.log(`[user-stats] ✓ Successfully retrieved stats from data-tool`);
    console.log(`[user-stats] ========== REQUEST END (SUCCESS) ==========\n`);

    return NextResponse.json(data, { status: dataToolRes.status });
  } catch (err: any) {
    console.error(`[user-stats] ❌ EXCEPTION caught:`, err.message);
    console.error(`[user-stats] Stack trace:`, err.stack);
    console.log(`[user-stats] ========== REQUEST END (ERROR) ==========\n`);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
