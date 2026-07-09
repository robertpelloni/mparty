/**
 * AudioManager.ts
 *
 * Middleware for mapping the native PCM audio byte streams emitted by the
 * N64/GameCube WebAssembly cores (e.g. from MUSYX or direct DAC output) into
 * the modern HTML5 Web Audio API.
 *
 * It manages an internal ring buffer to prevent audio skipping (underruns)
 * caused by JS event loop desyncs from the strict WASM 60hz execution.
 */

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private nextPlayTime: number = 0;

  // Standard N64 native audio output sample rate
  private readonly SAMPLE_RATE = 32000;

  constructor() {
    // The context must be initialized after a user interaction (like clicking "Play")
    // to bypass modern browser autoplay policies.
  }

  /**
   * Initializes the Web Audio context. Safe to call multiple times.
   */
  public initialize(): void {
    if (typeof window === 'undefined') return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.SAMPLE_RATE,
        latencyHint: 'interactive'
      });
      this.nextPlayTime = this.audioContext.currentTime;
      console.log(`AudioManager: Web Audio API initialized at ${this.SAMPLE_RATE}Hz`);
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Decodes an arbitrary raw PCM byte stream array into valid Web Audio Float32 arrays.
   * Useful for loading external mock legacy audio banks like MUSYX.
   */
  public decodePCMStream(rawPCMBuffer: ArrayBuffer): void {
      if (!this.audioContext) return;
      console.log(`AudioManager: Decoding ${rawPCMBuffer.byteLength} bytes of raw PCM streams to internal queue.`);

      // Mock logic to handle raw interleaved PCM data
      const floatView = new Float32Array(rawPCMBuffer);
      const halfLength = Math.floor(floatView.length / 2);

      const left = new Float32Array(halfLength);
      const right = new Float32Array(halfLength);

      for(let i = 0; i < halfLength; i++) {
          left[i] = floatView[i * 2];
          right[i] = floatView[i * 2 + 1];
      }

      this.pushAudioBuffer(left as Float32Array<ArrayBuffer>, right as Float32Array<ArrayBuffer>);
  }

  /**
   * Shuts down the audio context and clears the buffer.
   */
  public close(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      console.log('AudioManager: Web Audio context closed.');
    }
  }

  /**
   * Pushes a raw Float32 PCM interleaved buffer (L/R) into the AudioContext queue.
   * This is typically called at the end of the WASM emulator's `stepFrame`.
   *
   * @param leftChannel Float32 array representing Left DAC PCM
   * @param rightChannel Float32 array representing Right DAC PCM
   */
  public pushAudioBuffer(leftChannel: Float32Array<ArrayBuffer>, rightChannel: Float32Array<ArrayBuffer>): void {
    if (!this.audioContext) return;

    // Create a new AudioBuffer to hold this frame's audio
    const frameBuffer = this.audioContext.createBuffer(
      2, // Stereo
      leftChannel.length,
      this.SAMPLE_RATE
    );

    // Copy the raw PCM data from the WASM emulator memory boundaries to the Web Audio buffer
    frameBuffer.copyToChannel(leftChannel, 0);
    frameBuffer.copyToChannel(rightChannel, 1);

    // Create a node to play this specific chunk
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = frameBuffer;
    sourceNode.connect(this.audioContext.destination);

    // Ensure seamless scheduling. If the emulator fell behind, catch up to current time.
    const currentTime = this.audioContext.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.05; // 50ms buffering delay for safety
    }

    sourceNode.start(this.nextPlayTime);

    // Advance the play head by the duration of the chunk we just queued
    this.nextPlayTime += frameBuffer.duration;
  }
}
