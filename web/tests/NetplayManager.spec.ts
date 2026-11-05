import { test, expect } from '@playwright/test';
import { NetplayManager, NetplayPacket } from '../src/lib/NetplayManager';

test.describe('NetplayManager Unit Tests', () => {

    test('should maintain rollback buffer size limits', () => {
        const netplay = new NetplayManager();

        // Fill buffer past maxRollbackFrames (7)
        for (let i = 0; i < 10; i++) {
            netplay.predictInputState(i, 50);
        }

        // The implementation clears the buffer if size > maxRollbackFrames
        // So after frame 7 it clears, then adds 8, 9.
        // Therefore at the end, the size should be 2.
        const bufferSize = (netplay as any).rollbackBuffer.size;
        expect(bufferSize).toBeLessThanOrEqual(7);
    });

    test('syncRemoteInputs should return true if input matches prediction', () => {
        const netplay = new NetplayManager();

        // Predict input for frame 100 as 0x0
        netplay.predictInputState(100, 50);

        // Remote input arrives matching prediction
        const result = netplay.syncRemoteInputs(100, new Uint32Array([0x0]));
        expect(result).toBe(true);

        // Should clear from buffer after success
        expect((netplay as any).rollbackBuffer.has(100)).toBe(false);
    });

    test('syncRemoteInputs should return false on prediction mismatch', () => {
        const netplay = new NetplayManager();

        // Predict input for frame 101 as 0x0
        netplay.predictInputState(101, 50);

        // Remote input arrives mismatched
        const result = netplay.syncRemoteInputs(101, new Uint32Array([0x1]));
        expect(result).toBe(false);
    });

    test('syncRemoteInputs should return false if frame is missing from buffer', () => {
        const netplay = new NetplayManager();

        // Remote input arrives for a frame not predicted/already cleared
        const result = netplay.syncRemoteInputs(999, new Uint32Array([0x0]));
        expect(result).toBe(false);
    });

    test('sendDataPacket should return false when channel is not open', () => {
        const netplay = new NetplayManager();
        const sent = netplay.sendDataPacket('ping', { test: true });
        expect(sent).toBe(false);
    });

    test('should support registering packet handlers and dispatching incoming string messages', () => {
        const netplay = new NetplayManager();
        let receivedPacket: NetplayPacket | null = null;

        netplay.onDataPacket((packet) => {
            receivedPacket = packet;
        });

        // Mock open data channel and trigger onmessage
        const mockChannel = {
            readyState: 'open',
            send: () => {},
            close: () => {}
        };
        (netplay as any).dataChannel = mockChannel;
        (netplay as any).setupChannelListeners();

        const testPacket: NetplayPacket = {
            action: 'sync_input',
            data: [1, 2, 3],
            timestamp: 123456789
        };

        // Simulate incoming message event
        mockChannel['onmessage']({ data: JSON.stringify(testPacket) });

        expect(receivedPacket).not.toBeNull();
        expect(receivedPacket?.action).toBe('sync_input');
        expect(receivedPacket?.data).toEqual([1, 2, 3]);
    });
});
