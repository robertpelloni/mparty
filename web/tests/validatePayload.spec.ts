import { test, expect } from '@playwright/test';

test.describe('Stream API - Payload Validation Matrix', () => {

    test('should reject null payload', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: null
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Invalid JSON payload');
    });

    test('should reject array payload (must be object)', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: [{ action: 'ping', data: [1,2,3] }]
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "action" field');
    });

    test('should reject string payload', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: "string payload"
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Invalid JSON payload');
    });

    test('should reject numeric payload', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: 12345
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Invalid JSON payload');
    });

    test('should reject empty object payload', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: {}
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "action" field');
    });

    test('should reject action with type mismatch (number instead of string)', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 123, data: [1,2,3] }
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "action" field');
    });

    test('should reject data with type mismatch (object instead of array)', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 'ping', data: { a: 1 } }
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "data" array');
    });
});
