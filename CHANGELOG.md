# CHANGELOG

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