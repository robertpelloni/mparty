import { test, expect } from '@playwright/test';

test.describe('Decompilation Status & Stub Viewer', () => {

    test('should render decompilation status metrics and allow processing nonmatchings', async ({ page }) => {
        await page.goto('/');

        // Verify title & initial status metrics
        await expect(page.getByText('Decompilation Pipeline & Stub Generator')).toBeVisible();
        await expect(page.getByText('Non-Matching Units')).toBeVisible();
        await expect(page.getByText('Mario Party (N64)')).toBeVisible();

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
