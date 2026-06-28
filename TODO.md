# TODO

## Short-term Tasks & Immediate Actions

- [x] Initialize Core Documentation (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
[x] Create Python script (`tools/generate_splat.py`) for automated ROM splitting and generating `splat.yaml`.
[x] Create Node/Python script (`tools/disassemble.py`) to orchestrate `spimdisasm` on split files.
[x] Create Node script (`tools/c_stubber.js`) to generate matching `.c` stubs from `.s` assemblies.
[x] Write a base `Makefile` for recompiling byte-matching ROMs.
[x] Verify functionality of newly created tools via basic syntax checking and dry-runs.
[x] Finalize initial repository structure with `HANDOFF.md` before concluding session.
- [x] Initialize Next.js/TypeScript frontend boilerplate.
- [x] Integrate Emscripten toolchain wrapper for WebAssembly emulation cores.
- [x] Implement AI decompilation matching harness (`tools/ai_matcher.py`).
- [x] Implement Fast3D microcode translation abstraction for WebGL.
- [x] Implement texture converter script (`tools/texture_converter.py`) for the Graphics & Asset Pipeline.
- [x] Create ISO filesystem extractor stub for GameCube/Wii integration.
- [x] Establish universal ROM metadata API route in frontend hub.
- [x] Create automated integration test script (`tools/test_pipeline.py`) to validate full CI/CD loop.
- [x] Create continuous AI orchestration loop stub (`tools/ai_loop.py`).
- [x] Achieve Phase 1 completion by running the first automated C-to-ASM byte match.
- [x] Implement InputManager wrapper to translate browser APIs to N64 controller bitmasks.
- [x] Implement Web Audio API abstractions (`AudioManager.ts`) for continuous PCM playback.
- [x] Create a centralized master CLI orchestrator (`mparty_cli.py`) for simplified developer execution.
- [x] Establish IndexedDB persistence pipeline for emulation save states.
- [x] Create WebRTC peer-to-peer NetplayManager for multiplayer input synchronization.
- [x] Conclude Phase 1 scaffolding with a master structural verification script (`verify_architecture.py`).
- [x] Implement Audio Decoder script (`tools/audio_decoder.py`) to parse MUSYX audio banks for the Audio Pipeline.
- [x] Replace initial simple mock ROM generator with an advanced version injecting functional MIPS logic.
