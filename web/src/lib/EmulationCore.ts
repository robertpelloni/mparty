/**
 * EmulationCore.ts
 *
 * Hypervisor wrapper for the WebAssembly (Emscripten) emulation cores.
 * This class abstracts the loading of ROMs and communication with the
 * underlying C++ compiled WASM modules (e.g., Mupen64Plus).
 */

import { InputManager } from './InputManager';

export type EmulatorType = 'N64' | 'GameCube' | 'Wii';

export interface RomMetadata {
  id: string;
  title: string;
  platform: EmulatorType;
  fileSize: number;
}

export class EmulationCore {
  private isLoaded: boolean = false;
  private canvasContext: WebGLRenderingContext | null = null;
  private inputManager: InputManager;
  private animationFrameId: number = 0;

  constructor(private canvasElementId: string) {
    this.inputManager = new InputManager();
  }

  /**
   * Initializes the WebGL/Canvas context required for the WASM module to bind to.
   */
  public initializeContext(): boolean {
    const canvas = document.getElementById(this.canvasElementId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`EmulationCore: Canvas element with ID '${this.canvasElementId}' not found.`);
      return false;
    }

    try {
      this.canvasContext = canvas.getContext('webgl');
      if (!this.canvasContext) {
        throw new Error('WebGL not supported');
      }
      console.log('EmulationCore: WebGL context successfully bound.');
      return true;
    } catch (e) {
      console.error('EmulationCore: Failed to initialize WebGL context', e);
      return false;
    }
  }

  /**
   * Loads a target ROM byte array into the Emscripten virtual memory space.
   */
  public async loadRom(romBuffer: ArrayBuffer, meta: RomMetadata): Promise<void> {
    console.log(`EmulationCore: Attempting to load ${meta.title} (${meta.platform})...`);
    console.log(`EmulationCore: Buffer size is ${romBuffer.byteLength} bytes.`);

    // TODO: In a real implementation, this would involve calling the Emscripten Module
    // e.g., Module.FS.writeFile('/target.z64', new Uint8Array(romBuffer));
    //       Module.ccall('loadROM', 'number', ['string'], ['/target.z64']);

    // Simulate async load time
    await new Promise(resolve => setTimeout(resolve, 500));

    this.isLoaded = true;
    console.log(`EmulationCore: ${meta.title} successfully loaded into WASM memory space.`);
  }

  /**
   * Triggers the emulator's main execution loop.
   */
  public start(): void {
    if (!this.isLoaded) {
      throw new Error('EmulationCore: Cannot start, no ROM is loaded.');
    }
    console.log('EmulationCore: Starting WASM execution loop...');

    this.inputManager.attachListeners();
    this.executionLoop();
  }

  private executionLoop = (): void => {
    if (!this.isLoaded) return;

    // 1. Poll input states and feed them to the WASM emulator memory
    const packedInput = this.inputManager.getPackedN64State();
    // e.g., Module.ccall('updateInput', 'void', ['number'], [packedInput]);

    // 2. Trigger emulator to step 1 frame
    // e.g., Module.ccall('stepFrame', 'void', [], []);

    this.animationFrameId = requestAnimationFrame(this.executionLoop);
  };

  /**
   * Halts emulation and cleans up the virtual filesystem.
   */
  public stop(): void {
    if (this.isLoaded) {
      console.log('EmulationCore: Halting execution and clearing memory.');
      this.isLoaded = false;
      this.inputManager.detachListeners();
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
