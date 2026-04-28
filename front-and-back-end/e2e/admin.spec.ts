import { test, expect, request } from "@playwright/test";

const ADMIN_BASE_URL =
  process.env.ADMIN_BASE_URL ||
  "https://fitness-ai-app-admin.ashycliff-d78872a9.canadacentral.azurecontainerapps.io";

test.describe("Admin Dashboard — production smoke tests", () => {
  test("health endpoint returns healthy status without auth", async () => {
    const ctx = await request.newContext({ baseURL: ADMIN_BASE_URL });
    const res = await ctx.get("/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.timestamp).toBeTruthy();
    await ctx.dispose();
  });

  test("protected endpoints return 401 without Authorization header", async () => {
    const ctx = await request.newContext({ baseURL: ADMIN_BASE_URL });
    const res = await ctx.get("/total_users");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
    await ctx.dispose();
  });

  test("protected endpoints return data with valid Authorization header", async () => {
    const apiToken = process.env.ADMIN_API_TOKEN;
    if (!apiToken) {
      test.skip(true, "ADMIN_API_TOKEN not set");
      return;
    }
    const ctx = await request.newContext({
      baseURL: ADMIN_BASE_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${apiToken}` },
    });
    const res = await ctx.get("/total_users");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.totalUsers).toBe("number");
    await ctx.dispose();
  });
});
