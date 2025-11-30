const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should allow a user to sign up and log in', async ({ page }) => {
    await page.goto('/auth');

    // Sign up
    await page.click('button:has-text("Sign Up")');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Log in
    await page.locator('h2:has-text("Login")').waitFor();
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should be redirected to the browse page
    await page.waitForURL('/browse');
    await expect(page).toHaveURL('/browse');
  });
});