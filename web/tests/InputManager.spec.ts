import { test, expect } from '@playwright/test';
import { InputManager } from '../src/lib/InputManager';

test.describe('InputManager Boundary & Edge Case Validation', () => {

    test('should bound analog inputs properly to valid signed 8-bit limits (-128 to 127)', () => {
        const im = new InputManager();

        // Force state for testing
        (im as any).state.joyX = 200; // Out of bounds > 127
        (im as any).state.joyY = -200; // Out of bounds < -128

        const packed = im.getPackedN64State();

        // Extract signed bytes
        const packedX = (packed >> 16) & 0xFF;
        const packedY = (packed >> 24) & 0xFF;
        const signedX = packedX > 127 ? packedX - 256 : packedX;
        const signedY = packedY > 127 ? packedY - 256 : packedY;

        // Before refactor, this fails (signedX is -56 instead of 127)
        expect(signedX).toBe(127);
        expect(signedY).toBe(-128);
    });

    test('should prevent NaN parsing in gamepad axes', () => {
         const im = new InputManager();
         (im as any).state.joyX = NaN;
         (im as any).state.joyY = null;

         const packed = im.getPackedN64State();

         const packedX = (packed >> 16) & 0xFF;
         const packedY = (packed >> 24) & 0xFF;

         expect(packedX).toBe(0);
         expect(packedY).toBe(0);
    });
});
