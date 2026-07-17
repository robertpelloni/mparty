import { test, expect } from '@playwright/test';

test.describe('API Endpoint (/api/roms)', () => {
    test('should return ROM metadata successfully', async ({ request }) => {
        const response = await request.get('/api/roms');
        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThan(0);
        expect(json.data[0]).toHaveProperty('id');
        expect(json.data[0]).toHaveProperty('title');
        expect(json.data[0]).toHaveProperty('platform');
    });
});
