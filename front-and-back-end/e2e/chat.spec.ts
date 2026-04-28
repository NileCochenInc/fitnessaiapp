import { test, expect } from "@playwright/test";

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

// Assistant bubbles are left-aligned (justify-start) and have max-w-xs.
// The loading indicator div is also justify-start but lacks max-w-xs.
const assistantBubbleSelector = "div.flex.justify-start > div[class*='max-w-xs']";

// Error banner shown when the API returns a non-2xx status
const errorBannerSelector = "text=/Chat failed:/";

test.describe("AI Chat — production smoke tests", () => {
  test("user can log in and reach the chat page", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await expect(page.getByText("Fit Buddy AI Chat")).toBeVisible();
    await expect(page.getByPlaceholder("Type your message...")).toBeVisible();
  });

  test("user can send a message and receive a non-error AI response", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/chat");

    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible();

    await input.fill("Hello, can you give me one short fitness tip?");
    await page.getByRole("button", { name: "💬" }).click();

    // User message should appear immediately
    await expect(
      page.locator("text=Hello, can you give me one short fitness tip?")
    ).toBeVisible({ timeout: 10_000 });

    // Fail fast if the API returned an HTTP error (e.g. 500 from AI service)
    await expect(page.locator(errorBannerSelector)).not.toBeVisible({
      timeout: 10_000,
    });

    // Wait for the assistant response bubble (up to 75 s for AI to reply)
    const assistantBubble = page.locator(assistantBubbleSelector).first();
    await expect(assistantBubble).toBeVisible({ timeout: 75_000 });

    // Confirm the bubble has actual content
    const responseText = await assistantBubble.innerText();
    expect(responseText.trim().length).toBeGreaterThan(10);

    // Confirm no error banner appeared
    await expect(page.locator(errorBannerSelector)).not.toBeVisible();
  });

  test("send button is disabled while waiting for response", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/chat");

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Quick test message");

    const sendBtn = page.getByRole("button", { name: "💬" });
    await sendBtn.click();

    // Input should be disabled immediately while loading
    await expect(input).toBeDisabled({ timeout: 3_000 });

    // Fail fast if API error
    await expect(page.locator(errorBannerSelector)).not.toBeVisible({
      timeout: 10_000,
    });

    // Wait for response so the test cleans up properly
    await expect(
      page.locator(assistantBubbleSelector).first()
    ).toBeVisible({ timeout: 75_000 });
  });
});
