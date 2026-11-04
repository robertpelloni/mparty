import { test, expect } from '@playwright/test';

test.describe('Client-Side Data Fetching (useDataFetch)', () => {
    test('should eventually load data on the dashboard', async ({ page }) => {
        await page.goto('/');

        // Wait for the asset gallery to load something
        // useDataFetch has a simulated 300ms latency
        await expect(page.locator('text=Extracted Assets').first()).toBeVisible();
        await expect(page.locator('aside >> button').first()).toBeVisible({ timeout: 5000 });
    });
});
