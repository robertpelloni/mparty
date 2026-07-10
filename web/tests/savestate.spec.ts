import { test, expect } from '@playwright/test';

test('savestate interaction test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Cross-Gen Save States').first()).toBeVisible();

  // Test Export
  const saveStateBtn = page.locator('button', { hasText: 'Save State' });
  await saveStateBtn.click();
  await expect(page.locator('text=Exported Universal JSON').first()).toBeVisible();

  // Test Import
  const loadStateBtn = page.locator('button', { hasText: 'Load State' });
  await loadStateBtn.click();
  await expect(page.locator('text=Imported Cross-Gen JSON').first()).toBeVisible();
});
