import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Health check endpoint with database status
export async function GET() {
  try {
    // Get database pool status
    const poolStatus = (pool as any).getPoolStatus?.() || {
      initialized: false,
      hasError: false,
      error: null,
    };

    const health = {
      status: poolStatus.hasError ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: poolStatus.initialized,
        hasError: poolStatus.hasError,
        error: poolStatus.error,
      },
    };

    // Return 503 if database has error, 200 if OK, 200 with degraded if not initialized yet
    const statusCode = poolStatus.hasError ? 503 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
