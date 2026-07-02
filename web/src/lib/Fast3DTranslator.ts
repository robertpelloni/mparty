/**
 * Fast3DTranslator.ts
 *
 * Middleware translation layer for N64 microcode graphics commands.
 *
 * Legacy N64 games do not write pixels directly via modern APIs; they construct
 * "Display Lists" of microcode commands (e.g., Fast3D) that are sent to the RSP.
 * This class catches those underlying C library calls (like gSPProcessDisplayList)
 * when emitted from the WebAssembly core and translates them natively into WebGL operations.
 */

export interface Vertex {
  x: number;
  y: number;
  z: number;
  u: number;
  v: number;
  color: number; // RGBA packed
}

export class Fast3DTranslator {
  private gl: WebGLRenderingContext;

  // Simulated internal vertex cache typical of N64 microcode (usually 32 vertices max)
  private vertexCache: Vertex[] = new Array(32);

  constructor(context: WebGLRenderingContext) {
    this.gl = context;
    this.initGLState();
  }

  private initGLState() {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    console.log("Fast3DTranslator: WebGL state initialized for microcode interception.");
  }

  /**
   * Translates an intercepted gSPProcessDisplayList command.
   * @param displayListPointer Memory offset in the WASM array pointing to the start of the list.
   */
  public gSPProcessDisplayList(displayListPointer: number) {
    console.log(`Fast3DTranslator: Processing display list at offset 0x${displayListPointer.toString(16)}`);

    // Mock loop decoding commands from WASM memory (F3DEX2)
    const mockDisplayList = [
      { opcode: 'G_VTX', vtxPointer: 0x80200000, numVertices: 3, writeIndex: 0 },
      { opcode: 'G_TRI1', v0: 0, v1: 1, v2: 2 },
      { opcode: 'G_ENDDL' }
    ];

    for (const cmd of mockDisplayList) {
      if (cmd.opcode === 'G_VTX') {
        this.gSPVertex(cmd.vtxPointer!, cmd.numVertices!, cmd.writeIndex!);
      } else if (cmd.opcode === 'G_TRI1') {
        this.gSP1Triangle(cmd.v0!, cmd.v1!, cmd.v2!);
      } else if (cmd.opcode === 'G_ENDDL') {
        break;
      }
    }
  }

  /**
   * Simulates the G_VTX macro, loading vertices into the internal RSP cache.
   */
  public gSPVertex(vtxPointer: number, numVertices: number, writeIndex: number) {
    console.log(`Fast3DTranslator: Loading ${numVertices} vertices into cache index ${writeIndex} from 0x${vtxPointer.toString(16)}`);

    // Mock reading memory by populating the internal cache with dummy WebGL vertices
    for (let i = 0; i < numVertices; i++) {
       const idx = writeIndex + i;
       if (idx < 32) {
         this.vertexCache[idx] = { x: Math.random(), y: Math.random(), z: Math.random(), u: 0, v: 0, color: 0xFFFFFFFF };
       }
    }
  }

  /**
   * Simulates the G_TRI1 macro, drawing a single triangle from the vertex cache.
   */
  public gSP1Triangle(v0: number, v1: number, v2: number) {
    console.log(`Fast3DTranslator: Buffered G_TRI1 to draw triangle with cache indices: ${v0}, ${v1}, ${v2}`);

    const vtx0 = this.vertexCache[v0];
    const vtx1 = this.vertexCache[v1];
    const vtx2 = this.vertexCache[v2];

    if (!vtx0 || !vtx1 || !vtx2) {
        console.warn("Fast3DTranslator: Missing vertex data in cache for G_TRI1.");
        return;
    }

    // In a full implementation, we'd pack these into a Float32Array and bind it to
    // a gl.ARRAY_BUFFER before calling gl.drawArrays.
    console.log(`Fast3DTranslator: WebGL gl.drawArrays mocked for triangle (${vtx0.x.toFixed(2)}, ${vtx1.x.toFixed(2)}, ${vtx2.x.toFixed(2)})`);
  }

  /**
   * Clears the current frame buffer.
   */
  public clearDisplay() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
