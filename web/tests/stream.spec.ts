import { test, expect } from '@playwright/test';

test.describe('Stream API Endpoint (/api/stream)', () => {

    test('should reject malformed JSON', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: 'this is not valid json',
            headers: { 'Content-Type': 'application/json' }
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.error).toBe('Bad Request');
    });

    test('should reject missing action', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { data: [1, 2, 3] }
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "action" field');
    });

    test('should reject missing data array', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 'sync_input', data: 'not an array' }
        });
        expect(response.status()).toBe(400);
        const json = await response.json();
        expect(json.message).toContain('Missing or invalid "data" array');
    });

    test('should accept valid payload', async ({ request }) => {
        const response = await request.post('/api/stream', {
            data: { action: 'sync_input', data: [1, 2, 3] }
        });
        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.receivedDataLength).toBe(3);
    });

    test('should enforce rate limits', async ({ request }) => {
        // Need to simulate multiple requests quickly
        // Assuming max is 100
        let status = 200;
        for(let i=0; i<105; i++) {
           const response = await request.post('/api/stream', {
                data: { action: 'ping', data: [] }
           });
           status = response.status();
           if(status === 429) break;
        }
        expect(status).toBe(429);
    });

});
