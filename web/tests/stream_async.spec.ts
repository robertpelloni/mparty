import { test, expect } from '@playwright/test';

test.describe('Stream API Async Payload Validations', () => {

    test('should reject excessively large arrays', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 'sync_input', data: new Array(1500).fill(0) }
        });
        expect(response.status()).toBe(413);
    });

    test('should reject unsupported actions', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 'DROP_TABLES', data: [] }
        });
        expect(response.status()).toBe(400);
    });
});
