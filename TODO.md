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

## WASM Hypervisor Refinements

- [x] Mocked the remaining `TODO` pointers in `EmulationCore.ts` and `SaveStateManager.ts` to flesh out the WASM filesystem injection logic.
- [x] Ran syntax validation across updated hypervisor files to ensure no typings regressions.

## API Hardening

- [x] Create automated integration tests `tests/api_roms.spec.ts` for the existing `/api/roms` endpoint to ensure metadata stability.

## Resilience Post-Mortem

- [x] Migrated high-frequency stream requests away from HTTP routes to raw WebRTC data channels in `NetplayManager.ts` (`sendDataPacket`, `onDataPacket`) to prevent request timeouts under extreme simulation loads.

## Data Validation Layer Updates

- [x] Harden `/api/stream/route.ts` against extremely large payloads and unmapped events (e.g. DoS vector protection).
- [x] Create integration tests `tests/stream_async.spec.ts` for boundary checks.

- [x] Integrate `tools/test_ai_loop.py` into the continuous integration testing pipeline.

## Automated AI Matching Expansion

- [x] Investigate modifying `tools/ai_loop.py` to directly hook into an LLM via the mock API layer to self-correct `.c` files during compilation.

- [x] Harden `tools/test_ai_loop.py` to test LLM mock iteration failures and missing API key conditions.

## Data Validation Layer Updates

- [x] Implemented targeted unit tests for `validatePayload()` via `tests/validatePayload.spec.ts` capturing boundary checks on the new async data flow (e.g., nulls, numeric overrides, and nested references).

## Graphics Translation Hardening

- [x] Implemented targeted unit tests for `Fast3DTranslator.ts` (`tests/Fast3DTranslator.spec.ts`) capturing boundary checks on the internal microcode vertex cache (e.g. over-indexing preventing buffer overflows).

## UI Consolidation and Subsystem Architecture (v0.46.0)

- [x] Implemented `web/src/components/SystemTray.tsx` with server quit/restart controls and status indicators.
- [x] Implemented `web/src/components/AudioEngineControl.tsx` wiring `AudioManager.decodePCMStream` and volume controls.
- [x] Implemented `web/src/components/InputDiagnostics.tsx` wiring `InputManager` to 32-bit packed bitmasks.
- [x] Implemented `web/src/components/GraphicsPipelineControl.tsx` wiring `Fast3DTranslator` display list decoding.
- [x] Implemented `web/src/components/ConsoleBridgeControl.tsx` wiring `GameCubeEmulator` Dolphin WASM ISO mounting.
- [x] Implemented `web/src/components/CliTerminalModal.tsx` for interactive terminal commands.
- [x] Redesigned `web/src/app/page.tsx` into a consolidated 4-tier single-page dashboard.
- [x] Created `web/tests/system_tray.spec.ts` for end-to-end subsystem and tray verification.

## AI Loop Self-Correction & Multi-Step Matching (v0.47.0)

- [x] Implemented multi-step iterative LLM self-correction loop in `tools/ai_loop.py` feeding compiler/matcher diagnostics into the prompt.
- [x] Added unit test coverage for multi-step self-correction in `tools/test_ai_loop.py`.
- [x] Integrated configurable API URLs and `--max-retries` parameter.

## WebRTC DataChannel Streaming Resilience (v0.48.0)

- [x] Implemented direct WebRTC DataChannel packet transmission and reception in `NetplayManager.ts` (`sendDataPacket`, `onDataPacket`).
- [x] Added unit tests in `NetplayManager.spec.ts` covering packet streaming and message dispatcher handlers.

## Intelligent C Stub Generation & Assembly Pattern Recognition (v0.49.0)

- [x] Expanded `tools/c_stubber.js` with pattern recognition for MIPS argument registers (`$a0-$a3`, `$f12`), return value registers (`$v0`, `$f0`), and stack frame analysis.
- [x] Created dedicated unit test suite `tools/test_c_stubber.js` verifying typed stub generation from nonmatching assembly sequences.

## Structured Assembly Diff Feedback in AI Decompilation Loop (v0.50.0)

- [x] Added `generate_assembly_diff` in `tools/ai_matcher.py` to produce unified diffs between compiled disassembly and target assembly.
- [x] Routed structured assembly diff diagnostics through `tools/ai_loop.py` for LLM prompt self-correction.
- [x] Added test coverage in `tools/test_ai_loop.py` for structured diff feedback.

## AI Loop Candidate Scoring & Rule Caching (v0.51.0)

- [x] Added temperature stepping (`0.2`, `0.4`, `0.7`) and diff line penalty scoring in `tools/ai_loop.py` to retain best matching candidates.
- [x] Implemented learned decompilation rule persistence in `build/decomp_rules.json`.
- [x] Expanded `tools/test_ai_loop.py` with tests for rules caching and candidate convergence.

## Advanced Stubber Heuristics & Control Flow (v0.52.0)

- [x] Differentiated load/store semantics, inferred pointer argument types (`void*`), added 64-bit return detection (`s64`, `f64`), and detected indirect jump table switch statements in `tools/c_stubber.js`.
- [x] Expanded test coverage in `tools/test_c_stubber.js`.

## Non-Matching Section Extraction & GLOBAL_ASM Stubs (v0.53.0)

- [x] Expanded `tools/disassemble.py` to automatically extract individual functions into `asm/nonmatchings/<module>/<func>.s`.
- [x] Added `#pragma GLOBAL_ASM` generation with `#ifdef NON_MATCHING` guards in `tools/c_stubber.js`.
- [x] Added test case in `tools/test_c_stubber.js` verifying `#pragma GLOBAL_ASM` output formatting.

## Pipeline Integration of Disassembly & Typed Stub Verification (v0.54.0)

- [x] Integrated `tools/disassemble.py`, `asm/nonmatchings/` extraction, and typed C stub generation directly into the end-to-end integration test runner `tools/test_pipeline.py`.
- [x] Added execution of `tools/test_c_stubber.js` to `test_pipeline.py`.

## Interactive Decompilation Pipeline UI & Stub Inspector (v0.55.0)

- [x] Added C stub inspector viewer and non-matching processing trigger button to `DecompilationStatus.tsx`.
- [x] Added Playwright test in `web/tests/decompilation_status.spec.ts` asserting non-matching flow and stub inspection modal.

## Symbol Discovery & Function Prototype Header Generation (v0.56.0)

- [x] Added symbol discovery and prototype header generation (`include/functions.h`) in `tools/generate_splat.py`.
- [x] Added assertion in `tools/test_pipeline.py` verifying header generation.

## Advanced Struct Offset Inferencing & Callee-Saved Registers (v0.57.0)

- [x] Added struct offset spread inference on pointer parameters (`void* arg /* struct */`) in `tools/c_stubber.js`.
- [x] Added callee-saved register tracking (`$s0-$s7`, `$fp`) and boolean condition detection in generated C stubs.
- [x] Expanded unit tests in `tools/test_c_stubber.js` verifying struct offset spreads and boolean flag detection.
