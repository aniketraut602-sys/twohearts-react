/**
 * Sample Playwright test skeleton.
 * Requires Playwright to be installed in your environment.
 */
const { test, expect } = require('@playwright/test');

test('landing page loads and has title', async ({ page }) => {
  await page.goto('http://localhost:4173'); // adjust port if needed
  await expect(page).toHaveTitle(/Two Hearts|TwoHearts/i);
  // basic a11y-friendly check: ensure main landmark exists
  await expect(page.locator('main')).toBeVisible();
});
