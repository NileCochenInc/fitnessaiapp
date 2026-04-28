import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    backend_running: true,
    ai_service_checks: []
  };

  // Test different hostname formats
  const hostnames = [
    "fitness-ai-app-ai:5000",
    "fitness-ai-app-ai.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:5000",
  ];

  for (const hostname of hostnames) {
    const check_result: any = {
      hostname,
      status: "pending",
      error: null,
      response_time_ms: 0,
      http_status: null
    };

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`http://${hostname}/health`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" }
      });
      
      clearTimeout(timeout);
      check_result.response_time_ms = Date.now() - start;
      check_result.http_status = res.status;
      check_result.status = "reachable";
    } catch (error: any) {
      check_result.response_time_ms = Date.now() - start;
      check_result.error = error.message || String(error);
      check_result.status = "unreachable";
    }

    results.ai_service_checks.push(check_result);
  }

  return NextResponse.json(results, { status: 200 });
}
