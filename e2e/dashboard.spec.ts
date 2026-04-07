import { test, expect } from "@playwright/test";

test.describe("Dashboard (authenticated)", () => {
  // These tests verify the app structure; real auth flows are integration-tested elsewhere.
  // We test that protected routes redirect unauthenticated users correctly.

  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("settings redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/login/);
  });

  test("apps page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/apps");
    await expect(page).toHaveURL(/login/);
  });
});
