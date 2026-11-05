import { test, expect } from '@playwright/test';

test.describe('System Tray and UI Controls', () => {
  test('system tray icon toggles panel and manages servers', async ({ page }) => {
    await page.goto('/');

    // Check tray trigger button is visible
    const trayBtn = page.getByRole('button', { name: 'Toggle System Tray' });
    await expect(trayBtn).toBeVisible();
    await expect(trayBtn).toContainText('Active');

    // Click to expand system tray
    await trayBtn.click();
    await expect(page.getByRole('region', { name: 'System Tray Controls' })).toBeVisible();
    await expect(page.locator('text=Next.js Web Server').first()).toBeVisible();
    await expect(page.locator('text=Netplay Sync Socket').first()).toBeVisible();

    // Quit servers
    const quitBtn = page.getByRole('button', { name: 'Quit Servers' });
    await quitBtn.click();
    await expect(page.locator('text=All servers safely halted. Background workers detached.').first()).toBeVisible();

    // Restart servers
    const restartBtn = page.getByRole('button', { name: 'Restart All' });
    await restartBtn.click();
    await expect(page.locator('text=Services successfully restarted.').first()).toBeVisible();

    // Close tray
    const closeBtn = page.getByRole('button', { name: 'Close System Tray' });
    await closeBtn.click();
    await expect(page.getByRole('region', { name: 'System Tray Controls' })).not.toBeVisible();
  });

  test('subsystems and diagnostics render and interact properly', async ({ page }) => {
    await page.goto('/');

    // Input diagnostics
    await expect(page.locator('text=Controller & Input Diagnostics').first()).toBeVisible();
    const btnA = page.locator('button', { hasText: 'Button A :' });
    await btnA.click();
    await expect(btnA).toContainText('ON');
    await expect(page.locator('text=0x00000001').first()).toBeVisible();

    // Audio Engine
    await expect(page.locator('text=Legacy Console Audio Engine').first()).toBeVisible();
    const testAudioBtn = page.locator('button', { hasText: 'Test PCM Audio Stream' });
    await testAudioBtn.click();
    await expect(page.locator('text=PCM stream dispatched (Buffer Queued)').first()).toBeVisible();

    // Graphics Pipeline
    await expect(page.locator('text=Fast3D Graphics Middleware').first()).toBeVisible();
    const decodeListBtn = page.locator('button', { hasText: 'Decode Display List' });
    await decodeListBtn.click();
    await expect(page.locator('text=Processed F3DEX2 Display List').first()).toBeVisible();

    // Console Bridge
    await expect(page.locator('text=GameCube / Wii Hypervisor Bridge').first()).toBeVisible();
    const mountIsoBtn = page.locator('button', { hasText: 'Mount ISO' });
    await mountIsoBtn.click();
    await expect(page.locator('text=Mounted ISO: MP4 in Dolphin WASM Bridge').first()).toBeVisible();
  });
});
