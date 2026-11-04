import { test, expect } from '@playwright/test';
import { EmulationCore } from '../src/lib/EmulationCore';

test.describe('EmulationCore Integration', () => {

    test('should construct properly without throwing', () => {
        const core = new EmulationCore('dummy-id');
        expect(core).toBeDefined();
    });

});
