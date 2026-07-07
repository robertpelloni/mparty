# TODO

## Short-term Tasks & Immediate Actions

- [x] Initialize Core Documentation (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
- [x] Create Python script (`tools/generate_splat.py`) for automated ROM splitting and generating `splat.yaml`.
- [x] Create Node/Python script (`tools/disassemble.py`) to orchestrate `spimdisasm` on split files.
- [x] Create Node script (`tools/c_stubber.js`) to generate matching `.c` stubs from `.s` assemblies.
- [x] Write a base `Makefile` for recompiling byte-matching ROMs.
- [x] Verify functionality of newly created tools via basic syntax checking and dry-runs.
- [x] Finalize initial repository structure with `HANDOFF.md` before concluding session.

## Current Session Tasks

- [x] Create `tools/verify_architecture.py`.
- [x] Create `tools/generate_advanced_mock_rom.py`.
- [x] Create `tools/test_pipeline.py`.
- [x] Create `tools/ai_matcher.py`.
- [x] Create `tools/ai_loop.py`.
- [x] Create `tools/mparty_cli.py`.

## Web Frontend Tasks

- [x] Setup Next.js frontend
- [x] Implement UI components
- [x] Implement Dashboard API
- [x] Configure Playwright tests

## Graphics & Asset Pipeline

- [x] Create `tools/texture_converter.py`.
- [x] Create `tools/model_extractor.py`.
- [x] Create `tools/audio_decoder.py`.
- [x] Create `tools/iso_extractor.py`.

## Engine Expansion

- [x] Expand `tools/iso_extractor.py` to parse GCZ format.
- [x] Create `web/src/lib/GameCubeEmulator.ts` for Dolphin WASM integration.

## Engine Expansion Integration (v0.15.0)

- [x] Integrate `GameCubeEmulator.ts` logic into `EmulationCore.ts` load procedures.

## Main Event Loop

- [x] Initialize the mparty event loop to handle incoming connections.

## Network Parsing

- [x] Expand the `mparty_cli.py` run loop to parse incoming network connection streams.

## Memory Syncing

- [x] Expand the `mparty_cli.py` run loop to dispatch data payloads to the frontend over WebSockets.
- [x] Connect `web/src/lib/NetplayManager.ts` to the websocket stream.

## CI/CD Pipeline

- [x] Create GitHub Actions workflow to run the test suite on push.

## Decompilation Infrastructure

- [x] Parse actual `.z64` test ROM header in `tools/generate_splat.py`.
- [x] Ensure `tools/disassemble.py` executes successfully on valid splat configurations.

## WASM Netplay Protocol Integration (v0.12.0)

- [x] Wire `hostGame()` and `joinGame()` from `NetplayManager.ts` to `NetworkControl.tsx` UI.

## Rollback Netcode Integration (v0.18.0)

- [x] Implement prediction method in `NetplayManager.ts` and add mock toggle button to `NetworkControl.tsx`.

## UI Redesign and Reorganization (v0.13.0)

- [x] Consolidate layout in `page.tsx` and prioritize high-value features.

## Graphics Translation Pipeline (v0.14.0)

- [x] Implement memory processing and vertex caching mocks in `Fast3DTranslator.ts`.
## Automated AI Matching Web Hook (v0.21.0)

- [x] Expose an API route in Next.js to trigger the `ai_loop.py` script and report back logs.
- [x] Add a button in `DecompilationStatus.tsx` to manually trigger the AI matching pipeline for testing.

## WebAsset Viewer Web Hook Integration (v0.22.0)

- [x] Update frontend hook to intercept payload metrics dynamically instead of raw fallback buffers.
- [x] Ensure `AssetGallery` pulls data efficiently utilizing robust network latency logic.
