# CHANGELOG

## [1.7.0] - 2026-06-28
### Added
- Created `tools/audio_decoder.py` as a scaffolding script to mock the extraction and decoding of proprietary MUSYX audio banks (.ctl/.tbl) into raw PCM streams for the Next.js `AudioManager`.

## [1.6.0] - 2026-06-28
### Added
- Created `tools/verify_architecture.py` to strictly assert the existence and integrity of all required Mario Party WebEngine scaffolding components.
- Concluded Phase 1 initialization.

## [1.5.0] - 2026-06-28
### Added
- Created `web/src/lib/NetplayManager.ts` establishing WebRTC data channels for low-latency peer-to-peer multiplayer input polling.

## [1.4.0] - 2026-06-28
### Added
- Created `web/src/lib/SaveStateManager.ts` to implement persistent IndexedDB storage for binary WASM emulation snapshots.
- Implemented `triggerSaveState` and `triggerLoadState` abstractions within the `EmulationCore.ts` execution loop.

## [1.3.0] - 2026-06-28
### Added
- Created `tools/mparty_cli.py` as a centralized command-line interface to unify testing, continuous AI looping, and launching the WebEngine server.

## [1.2.0] - 2026-06-28
### Added
- Created `web/src/lib/AudioManager.ts` to manage Web Audio API `AudioContext` buffers natively, catching and scheduling raw PCM float streams emitted from the WASM cores to prevent underruns.
- Hooked the `AudioManager` into the `EmulationCore.ts` `requestAnimationFrame` lifecycle.

## [1.1.0] - 2026-06-28
### Added
- Created `web/src/lib/InputManager.ts` to capture HTML5 Gamepad API and Keyboard events and translate them into packed 32-bit legacy console structures for the WASM engine.
- Integrated `InputManager` polling into the `EmulationCore.ts` runtime loop.

## [1.0.0] - 2026-06-28
### Added
- Completed Phase 1 milestone. The autonomous system successfully achieved its first byte-matching validation.
- Upgraded `tools/ai_matcher.py` to extract raw binary `.text` via `objcopy`, ignoring ELF metadata artifacts.

## [0.9.0] - 2026-06-28
### Added
- Created `tools/ai_loop.py` to automate the continuous discovery and matching process for decompiled C files, satisfying the final "Next Step" of the project handover framework.

## [0.8.0] - 2026-06-28
### Added
- Added `tools/test_pipeline.py` to automate end-to-end testing of the entire mock ROM generation, splat decompilation, texture conversion, ISO FST extraction, and AI compilation loops.

## [0.7.0] - 2026-06-28
### Added
- Implemented `/api/roms` in Next.js to provide a universal JSON endpoint for dynamically discovering and loading cross-platform titles (N64, GameCube, Wii) into the emulation hub.
- Refactored `GameSelector.tsx` to consume this remote API instead of hardcoded component state.

## [0.6.0] - 2026-06-28
### Added
- Added `tools/iso_extractor.py` scaffolding to handle extraction of GameCube/Wii `.iso` files (Dolphin FST parsing, `.rel` modules, and `.szs` archives).

## [0.5.0] - 2026-06-27
### Added
- Created `tools/texture_converter.py` to automate the extraction and conversion of binary N64 textures (RGBA16) to web-friendly PNG format.

## [0.4.0] - 2026-06-27
### Added
- Created `web/src/lib/Fast3DTranslator.ts` middleware to parse N64 microcode `gSP` macros and translate them into native WebGL operations.

## [0.3.0] - 2026-06-27
### Added
- Implemented `tools/ai_matcher.py` harness to automate byte-matching C objects to MIPS assembly using `mips-linux-gnu-gcc`.

## [0.2.0] - 2026-06-27
### Added
- Created `web/src/lib/EmulationCore.ts` as a hypervisor to wrap underlying WebAssembly/Emscripten N64 emulation cores.
- Implemented `GameSelector.tsx` UI allowing dynamic mounting of the WebGL canvas and ROM loading simulation.

## [0.1.0] - 2026-06-26
### Added
- Initialized core documentation structure according to system directives (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
- Prepared directory for `tools/` implementation for ROM splitting and decompilation orchestration.