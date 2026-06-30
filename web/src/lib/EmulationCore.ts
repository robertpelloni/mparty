/**
 * EmulationCore.ts
 *
 * Hypervisor wrapper for the WebAssembly (Emscripten) emulation cores.
 * This class abstracts the loading of ROMs and communication with the
 * underlying C++ compiled WASM modules (e.g., Mupen64Plus).
 */

import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { SaveStateManager } from './SaveStateManager';

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
  private audioManager: AudioManager;
  private saveManager: SaveStateManager;
  private animationFrameId: number = 0;

  constructor(private canvasElementId: string) {
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.saveManager = new SaveStateManager();
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
    this.audioManager.initialize();
    this.executionLoop();
  }

  private executionLoop = (): void => {
    if (!this.isLoaded) return;

    // 1. Poll input states and feed them to the WASM emulator memory
    const packedInput = this.inputManager.getPackedN64State();
    // e.g., Module.ccall('updateInput', 'void', ['number'], [packedInput]);

    // 2. Trigger emulator to step 1 frame
    // e.g., Module.ccall('stepFrame', 'void', [], []);

    // 3. Flush the native audio buffers to the Web Audio API
    // const leftAudioPtr = Module.ccall('getAudioLeftBuffer', 'number', [], []);
    // const rightAudioPtr = Module.ccall('getAudioRightBuffer', 'number', [], []);
    // const audioLength = Module.ccall('getAudioLength', 'number', [], []);
    // const leftBuffer = new Float32Array(Module.HEAPF32.buffer, leftAudioPtr, audioLength);
    // const rightBuffer = new Float32Array(Module.HEAPF32.buffer, rightAudioPtr, audioLength);
    // this.audioManager.pushAudioBuffer(leftBuffer, rightBuffer);

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
      this.audioManager.close();
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Captures the current WASM execution memory array and persists it to IndexedDB.
   */
  public async triggerSaveState(gameId: string): Promise<void> {
    if (!this.isLoaded) return;
    console.log(`EmulationCore: Triggering memory snapshot for ${gameId}...`);
    // TODO: Extract raw HEAPU8 buffer from Emscripten
    // const memSnapshot = new Uint8Array(Module.HEAPU8.buffer);
    const mockSnapshot = new Uint8Array(1024); // Dummy 1KB snapshot
    await this.saveManager.saveState(gameId, mockSnapshot);
  }

  /**
   * Halts the WASM loop, injects a stored memory array from IndexedDB, and resumes.
   */
  public async triggerLoadState(gameId: string): Promise<void> {
    if (!this.isLoaded) return;
    console.log(`EmulationCore: Fetching memory snapshot for ${gameId}...`);
    const savedState = await this.saveManager.loadState(gameId);

    if (savedState) {
      console.log(`EmulationCore: Injecting ${savedState.length} bytes into WASM heap...`);
      // TODO: Inject back into Emscripten memory boundary
      // Module.HEAPU8.set(savedState);
    }
  }
}
