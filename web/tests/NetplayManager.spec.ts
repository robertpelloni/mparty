import { test, expect } from '@playwright/test';
import { NetplayManager } from '../src/lib/NetplayManager';

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
});
