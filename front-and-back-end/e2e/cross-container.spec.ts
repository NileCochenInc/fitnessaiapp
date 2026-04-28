import { test, expect, request } from "@playwright/test";

const EMAIL = process.env.TEST_USER_EMAIL ?? "statstest@example.com";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "testpass123";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(EMAIL);
  await page.getByPlaceholder("Enter your password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
}

const assistantBubbleSelector = "div.flex.justify-start > div[class*='max-w-xs']";
const errorBannerSelector = "text=/Chat failed:/";

test.describe("Cross-container communication — AI service reachability", () => {
  test("POST /api/chat returns HTTP 200 (proves server → AI hop succeeds)", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/chat");

    let chatApiStatus: number | undefined;
    page.on("response", (r) => {
      if (r.url().includes("/api/chat") && r.request().method() === "POST")
        chatApiStatus = r.status();
    });

    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill("Give me a one-sentence fitness tip.");
    await page.getByRole("button", { name: "💬" }).click();

    await page.waitForResponse(
      (r) =>
        r.url().includes("/api/chat") && r.request().method() === "POST",
      { timeout: 40_000 }
    );
    expect(chatApiStatus).toBe(200);
    await expect(page.locator(errorBannerSelector)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test("AI response renders in the UI", async ({ page }) => {
    await login(page);
    await page.goto("/chat");

    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill("In one sentence: what is progressive overload?");
    await page.getByRole("button", { name: "💬" }).click();

    const bubble = page.locator(assistantBubbleSelector).first();
    await expect(bubble).toBeVisible({ timeout: 90_000 });
    const text = await bubble.innerText();
    expect(text.trim().length).toBeGreaterThan(10);
    await expect(page.locator(errorBannerSelector)).not.toBeVisible();
  });

  test("two consecutive chat sessions both get AI responses — DB session not poisoned between requests", async ({
    page,
  }) => {
    await login(page);

    // Session 1: send a message and verify a real AI response appears.
    await page.goto("/chat");
    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill("What is a deadlift?");
    await page.getByRole("button", { name: "💬" }).click();
    const firstBubble = page.locator(assistantBubbleSelector).first();
    await expect(firstBubble).toBeVisible({ timeout: 90_000 });
    await expect(page.locator(errorBannerSelector)).not.toBeVisible();
    const text1 = await firstBubble.innerText();
    expect(text1.trim().length).toBeGreaterThan(10);

    // Session 2: reload the chat page so the UI resets (fresh loading=false
    // state — no dependency on the SSE stream from session 1 closing).
    // With the old global db.session, the first request's DB transaction
    // would leave the session in an error state, causing this second request
    // to throw "Can't reconnect until invalid transaction is rolled back".
    await page.goto("/chat");
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill("What is a squat?");
    await page.getByRole("button", { name: "💬" }).click();
    const secondBubble = page.locator(assistantBubbleSelector).first();
    await expect(secondBubble).toBeVisible({ timeout: 90_000 });
    await expect(page.locator(errorBannerSelector)).not.toBeVisible();
    const text2 = await secondBubble.innerText();
    expect(text2.trim().length).toBeGreaterThan(10);
    expect(text2).not.toMatch(/Can't reconnect|invalid transaction/i);
  });
});

test.describe("Data-tool reachability", () => {
  test("GET /api/data/user-stats returns 200 — data-tool container reachable from server", async ({
    page,
  }) => {
    await login(page);
    const res = await page.request.get("/api/data/user-stats");
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Valid response has these keys (values may be zero for a fresh user)
    expect(body).toHaveProperty("totalWorkoutsThisMonth");
    expect(body).toHaveProperty("averageWorkoutsPerWeek");
    expect(body).toHaveProperty("exerciseFrequencyThisMonth");
  });
});
