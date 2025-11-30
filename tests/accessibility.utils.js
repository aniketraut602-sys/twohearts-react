import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkAccessibility(page) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
}