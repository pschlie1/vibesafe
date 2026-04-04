import { test, expect } from "@playwright/test";

test.describe("Marketing pages", () => {
  test("homepage loads with key elements", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Scantient/i);
    await expect(page.getByRole("navigation")).toBeVisible();
    // Primary CTA exists
    await expect(page.getByRole("link", { name: /scan|start|free|get started/i }).first()).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Scantient/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("signup page is accessible from homepage", async ({ page }) => {
    await page.goto("/");
    const signupLink = page.getByRole("link", { name: /sign up|get started|free scan/i }).first();
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(/signup|login/);
  });
});
