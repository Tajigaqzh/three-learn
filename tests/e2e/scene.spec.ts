import { expect, test } from '@playwright/test';

test('renders the basic cube scene canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#threeRoot');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveJSProperty('tagName', 'CANVAS');
});

test('renders the shadow cube scene canvas', async ({ page }) => {
  await page.goto('/shadow-cube');

  const canvas = page.locator('#threeRoot');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveJSProperty('tagName', 'CANVAS');
});
