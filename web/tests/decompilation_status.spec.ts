import { test, expect } from '@playwright/test';

test.describe('Decompilation Status & Stub Viewer', () => {

    test('should render decompilation status metrics and allow processing nonmatchings', async ({ page }) => {
        await page.goto('/');

        // Verify title & initial status metrics
        await expect(page.getByText('Decompilation Pipeline & Stub Generator')).toBeVisible();
        await expect(page.getByText('Non-Matching Units')).toBeVisible();
        await expect(page.getByText('Mario Party 1 (N64)')).toBeVisible();

        // Verify game target selector
        const select = page.locator('select').filter({ hasText: 'MP1 (N64)' });
        await expect(select).toBeVisible();
        await select.selectOption('mp2');
        await expect(page.getByText('Mario Party 2 (N64)')).toBeVisible();

        // Select MP4 GameCube target option
        await select.selectOption('mp4');
        await expect(page.getByText('Mario Party 4 (GameCube)')).toBeVisible();
        await expect(page.getByText('24,500')).toBeVisible();

        // Switch back to MP2 for remaining interaction steps
        await select.selectOption('mp2');
        await expect(page.getByText('Mario Party 2 (N64)')).toBeVisible();

        // Click Process Nonmatchings
        const processBtn = page.getByRole('button', { name: 'Process Nonmatchings' });
        await expect(processBtn).toBeVisible();
        await processBtn.click();

        // Check that logs update
        await expect(page.getByText(/Splitting non-matching assembly blocks/)).toBeVisible();

        // Toggle stub inspector
        const inspectBtn = page.getByRole('button', { name: 'Inspect Stubs' });
        await expect(inspectBtn).toBeVisible();
        await inspectBtn.click();

        // Verify stub code preview appears
        await expect(page.getByText('Sample Generated Typed Stub with GLOBAL_ASM Fallback')).toBeVisible();
        await expect(page.getByText(/#pragma GLOBAL_ASM/)).toBeVisible();

        // Toggle off
        const hideBtn = page.getByRole('button', { name: 'Hide Stubs' });
        await hideBtn.click();
        await expect(page.getByText('Sample Generated Typed Stub with GLOBAL_ASM Fallback')).not.toBeVisible();
    });
});
