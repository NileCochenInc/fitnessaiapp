import { NextRequest, NextResponse } from "next/server";

/**
 * DEBUG endpoint to test container-to-container connectivity
 * Tests both internal simple names and external FQDNs
 * DO NOT use in production - remove after debugging
 */
export async function GET(req: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      DATA_TOOL_URL: process.env.DATA_TOOL_URL || "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    services: {}
  };

  // Test configurations
  const testConfigs = [
    {
      name: "data-tool-internal",
      url: "http://fitness-ai-app-data-tool:8080/api/user-stats/1"
    },
    {
      name: "data-tool-external",
      url: "http://fitness-ai-app-data-tool.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080/api/user-stats/1"
    },
    {
      name: "data-tool-internal-root",
      url: "http://fitness-ai-app-data-tool:8080/"
    },
    {
      name: "data-tool-external-root",
      url: "http://fitness-ai-app-data-tool.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080/"
    }
  ];

  for (const config of testConfigs) {
    try {
      console.log(`[DEBUG] Testing ${config.name}: ${config.url}`);
      console.time(config.name);
      
      const res = await fetch(config.url, { cache: 'no-store' });
      console.timeEnd(config.name);
      
      results.services[config.name] = {
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        reachable: true
      };
    } catch (e: any) {
      console.error(`[DEBUG] ${config.name} error:`, e.message);
      console.timeEnd(config.name);
      
      results.services[config.name] = {
        error: e.message,
        code: e.code || e.name,
        reachable: false
      };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
