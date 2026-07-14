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

## Compiler Optimization Alignment (v0.23.0)

- [x] Ensure `Makefile` uses the `-O2` compiler flag for N64 GCC builds, aligning with `ai_matcher.py` optimizations.

## Centralized Mparty CLI Dashboard (v0.24.0)

- [x] Update `mparty_cli.py` with an interactive terminal menu using standard Python libraries to monitor all backend statuses.
- [x] Ensure the CLI properly displays mock statuses for the Netplay server, Next.js dashboard, and AI matching pipeline.

## WebAssembly WASM Netplay Integration (v0.25.0)

- [x] Update `NetplayManager.ts` to implement a rollback netcode buffer interface capable of receiving remote game states.
- [x] Expand the UI to include a visual 'Latency Config' slider to mock adjusting ping compensation for the `NetplayManager`.

## Audio Stream Decoding Integration (v0.27.0)

- [x] Update `AudioManager.ts` to implement a `decodePCMStream()` method for parsing raw Float32 data buffers.
- [x] Ensure the Audio context buffers maintain a continuous queue to prevent underrun clicking during latency.

## WebAssembly Audio Decoding Translation (v0.28.0)

- [x] Update `EmulationCore.ts` to hook `AudioManager.decodePCMStream` directly into the emulator execution loop to parse WASM output blocks.
- [x] Update the `Fast3DTranslator.ts` cache initialization step to properly pre-allocate geometric buffer capacity.

## WebAssembly Netplay Sync Logic (v0.29.0)

- [x] Update `NetplayManager.ts` to implement a `syncRemoteInputs()` method for resolving WebRTC payload mismatches.
- [x] Add a `Mock Client Desync` button to `NetworkControl.tsx` to visualize the sync loop handling unexpected latency drops.

## WebAssembly Universal Save State Integration (v0.34.0)

- [x] Update `SaveStateManager.ts` to fully integrate the `extractUniversalState` loop into local IndexedDB payload syncing.
- [x] Add explicit logs tracking when translation thresholds (e.g. cross-generation state conversions) trigger within `SaveStateControl.tsx`.

## Test Suite Enhancements

- [x] Create a test suite to validate the validation layer's failure modes.
- [x] Refactor `tools/verify_architecture.py` to handle edge-case failure modes gracefully.

- [x] Complete pre-commit and submit workflow for validation layer update.

## API Hardening

- [x] Create a new route `/api/stream/route.ts` to implement basic streaming payload stubs.
- [x] Integrate rate limiting into `/api/stream/route.ts` to reject payloads exceeding frequency thresholds.
- [x] Implement robust object validation mapping to ensure strictly structured action payloads (e.g., rejecting missing actions or non-array data).
- [x] Create automated integration tests `tests/stream.spec.ts` for the newly created stream edge cases.

## Input Validation Hardening

- [x] Create a test suite for `InputManager` edge cases (e.g., NaN joystick inputs or out-of-bound values).
- [x] Refactor `InputManager.ts` to cleanly cap input parameters and filter out NaNs.

## Netplay Manager Refinements

- [x] Prioritize writing targeted unit tests `tests/NetplayManager.spec.ts` for newly added async rollback handlers.
- [x] Ensure rollback buffer sizes are maintained effectively without leaking historical states.
