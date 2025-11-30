const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('./accessibility.utils');

test.describe('Keyboard Navigation and Accessibility', () => {
  test('should allow tabbing through the login form and have no violations', async ({ page }) => {
    await page.goto('/auth');
    await page.locator('input[type="email"]').waitFor();

    // Check accessibility on page load
    await checkAccessibility(page);

    await page.press('body', 'Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.press('input[type="email"]', 'Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();

    await page.press('input[type="password"]', 'Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
});