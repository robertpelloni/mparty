# VISION

## Ultimate Goal
The ultimate vision for this project is to build an automated, modular pipeline for extracting, decompiling, and recompiling legacy console binaries—specifically starting with the Nintendo 64 architecture (Mario Party 1-3).

The goal is *not* simply a one-to-one manual translation of low-level assembly into JavaScript. The vision embraces reality: building infrastructure that supports a **WebAssembly emulation container** wrapped in a modern, interactive **TypeScript frontend**. This provides a native-feeling, selectable web interface for every Mario Party game while offloading the rigorous physical architecture execution to optimized WASM cores.

## Core Foundational Concepts
1. **Automation-First Reverse Engineering**: Human labor in decompiling is a bottleneck. We provide robust Python/Node.js scaffolding to automatically split ROMs, disassemble code into readable formats, and create matchable C stubs instantly.
2. **Emulation over Native Translation**: Instead of porting millions of lines of N64 memory mapping into native JS, we build translation layers. We utilize Emscripten and existing open-source engines (Mupen64Plus/Dolphin) to run the game natively, wrapped in web hooks.
3. **Pristine Documentation & Structure**: The codebase must be highly readable, modular, and explicit about its architecture so future developers (and LLMs) can easily contribute to specific isolated blocks.