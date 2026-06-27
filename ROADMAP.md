# ROADMAP

## Long-term Structural Milestones

1. **Decompilation Infrastructure Setup:**
   - Establish automated tooling for ROM splitting, disassembly, and C code stubbing for N64 architecture.
   - Configure a reproducible build environment to recompile a byte-matching N64 ROM.

2. **WebAssembly / Emulation Integration:**
   - Investigate Emscripten toolchains to compile N64 emulators (e.g., Mupen64Plus) to WebAssembly.
   - Design a TypeScript-based hypervisor that loads ROMs, manages virtual memory arrays, and handles user input via the browser.

3. **Graphics & Asset Pipeline:**
   - Build a web-compatible translation layer to intercept N64 microcode graphics commands (e.g., Fast3D).
   - Translate interpreted graphical commands into modern WebGL/Three.js render buffers natively.

4. **Engine Expansion (Future Consoles):**
   - Expand tools to handle GameCube/Wii ISO formats (e.g., Dolphin WASM).
   - Provide standard web APIs for interacting with different console emulators within a unified "Mario Party" web hub.