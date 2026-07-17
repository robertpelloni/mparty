import { test, expect } from '@playwright/test';
import { Fast3DTranslator } from '../src/lib/Fast3DTranslator';

test.describe('Fast3DTranslator Boundary Validations', () => {

    test('should prevent rendering triangles if vertex cache is missing indices', () => {
         // Create a fake WebGL rendering context
         const mockGL = {
             enable: () => {},
             clearColor: () => {},
             DEPTH_TEST: 1,
             clear: () => {},
             COLOR_BUFFER_BIT: 1,
             DEPTH_BUFFER_BIT: 2
         } as any;

         const translator = new Fast3DTranslator(mockGL);

         // Trigger a G_TRI1 command that references uninitialized cache indices
         let warnCalled = false;
         const originalWarn = console.warn;
         console.warn = () => { warnCalled = true; };

         translator.gSP1Triangle(0, 1, 2); // These should be null since we didn't gSPVertex them

         console.warn = originalWarn;

         expect(warnCalled).toBe(true);
    });

    test('should load vertices up to the 32 max size without over-indexing', () => {
         const mockGL = {
             enable: () => {},
             clearColor: () => {},
             DEPTH_TEST: 1
         } as any;

         const translator = new Fast3DTranslator(mockGL);

         // Attempt to write past the 32 element bounds of the vertex cache
         translator.gSPVertex(0x80000000, 10, 30); // Write 10 vertices starting at index 30

         // This tests if the loop securely protects bounds
         expect((translator as any).vertexCache.length).toBe(32);
    });
});
