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

## Floating-Point Argument Registers & 64-Bit Integer Pairs (v0.58.0)

- [x] Distinguish double-precision float parameters (`f64 f12`, `f64 f14`) from single-precision floats (`f32`) based on opcode suffixes (`.d`, `ldc1`, `sdc1`) in `tools/c_stubber.js`.
- [x] Support 64-bit integer argument pair detection (`s64 a0`) across `$a0-$a1` when doubleword memory instructions (`ld`, `sd`) are present.
- [x] Add loop structure detection (`hasLoop`) tracking backward branching instructions (`bne`, `beq`, `bgez`) to annotate control flow in generated C comments.
- [x] Expand unit tests in `tools/test_c_stubber.js` verifying double-precision float inferencing and loop annotations.

## Memory-Mapped I/O & Rodata Relocations (v0.59.0)

- [x] Detect memory-mapped I/O (MMIO) register addresses (`0xA4000000`-`0xA4800000`) for N64 hardware interfaces (`SP`, `MI`, `VI`, `AI`, `PI`, `RI`, `SI`).
- [x] Parse `.rodata` symbol references and jump table target labels through `%hi` and `%lo` relocation pairs.
- [x] Annotate detected hardware MMIO registers and `.rodata` symbols in generated C function comments.
- [x] Add unit test in `tools/test_c_stubber.js` validating MMIO and `.rodata` relocation detection.

## Stack Arguments & Unsigned Type Inference (v0.60.0)

- [x] Support stack-passed argument detection beyond `$a3` (`s32 a4 /* from stack */`).
- [x] Infer unsigned integer types (`u32`) for returns and parameters based on unsigned MIPS instructions (`divu`, `multu`, `sltu`, `lbu`, `lhu`).
- [x] Implement graceful error handling and reporting for malformed/empty assembly bodies.
- [x] Add unit tests in `tools/test_c_stubber.js` verifying stack argument detection and unsigned type inference.

## Batch Processing Statistics & Report Generation (v0.61.0)

- [x] Add batch processing statistics tracking (total functions, generated files, skipped files, warnings, errors) to `tools/c_stubber.js`.
- [x] Implement structured JSON report serialization to `build/stubber_report.json`.
- [x] Add unit test in `tools/test_c_stubber.js` verifying batch directory processing and statistics metrics.

## Global Pointer Relocations & Symbol Access Tracking (v0.62.0)

- [x] Support `%gp_rel` relocation parsing to recognize small data/BSS symbol access.
- [x] Distinguish global reads vs. global writes across instructions.
- [x] Annotate separated `Global Reads:` and `Global Writes:` symbol summaries in generated C comments.
- [x] Add unit test in `tools/test_c_stubber.js` validating `%gp_rel` tracking and read/write classification.

## Multi-Title Splat Configurations for Mario Party 1-3 (v0.63.0)

- [x] Add multi-title configuration profiles (`GAME_PROFILES`) and automatic detection for Mario Party 1 (`mp1`), Mario Party 2 (`mp2`), and Mario Party 3 (`mp3`) in `tools/generate_splat.py`.
- [x] Add `--game` / `-g` CLI option to `tools/generate_splat.py`.
- [x] Create `tools/test_generate_splat.py` unit test suite validating profile resolution and YAML output.
- [x] Integrate multi-title splat test into `tools/test_pipeline.py`.

## Modular Non-Matching Extraction & Granular Stubbing (v0.64.0)

- [x] Enhance `tools/disassemble.py` to recursively scan subdirectories under `asm/` and extract non-matching functions into `asm/nonmatchings/`.
- [x] Support `--process-nonmatchings` flag in `tools/c_stubber.js` for modular per-function stub generation.
- [x] Add unit test in `tools/test_c_stubber.js` validating modular non-matching directory processing.

## AI Loop Non-Matching Target Resolution (v0.65.0)

- [x] Add `locate_target_asm` and `locate_target_bin` in `tools/ai_loop.py` to resolve target assembly and binaries across `asm/nonmatchings/` and `build/expected/`.
- [x] Add `--nonmatchings-dir` CLI parameter to `tools/ai_loop.py`.
- [x] Add unit test in `tools/test_ai_loop.py` verifying non-matching directory target resolution.

## Multi-Title Decompilation Dashboard Target Selection (v0.66.0)

- [x] Add game target selector (MP1, MP2, MP3) in `DecompilationStatus.tsx`.
- [x] Connect target game selection to `/api/ai` and configure `--nonmatchings-dir`.
- [x] Update Playwright tests in `decompilation_status.spec.ts`.

## Multi-Title Targeting in Centralized CLI (v0.67.0)

- [x] Add `--game` / `-g` argument in `tools/mparty_cli.py`.
- [x] Render target title in interactive terminal dashboard header.
- [x] Create `tools/test_mparty_cli.py` and integrate into `tools/test_pipeline.py`.

## AI Matcher Assembly Normalization (v0.68.0)

- [x] Add `normalize_instruction` in `tools/ai_matcher.py` to strip addresses and comments from disassembly.
- [x] Support normalized diff output in `generate_assembly_diff`.
- [x] Create `tools/test_ai_matcher.py` unit test suite and integrate into `tools/test_pipeline.py`.

## Architecture Verification Expansion (v0.69.0)

- [x] Add toolchain scripts and test suites to `REQUIRED_FILES` in `tools/verify_architecture.py`.
- [x] Add `web`, `web/src`, and `web/tests` to `REQUIRED_DIRECTORIES`.
- [x] Verify validation layer failure modes in `tools/test_validation_layer.py`.

## Baseline Splat Configurations for Mario Party 1-3 (v0.70.0)

- [x] Generate baseline `splat.yaml`, `splat.mp1.yaml`, `splat.mp2.yaml`, and `splat.mp3.yaml` configurations.
- [x] Add `splat-configs` target in `Makefile`.
- [x] Assert presence in `tools/verify_architecture.py`.
- [x] Add structure tests in `tools/test_generate_splat.py`.

## COP0 Register Recognition & Subword MMIO Typing (v0.71.0)

- [x] Add COP0 coprocessor register detection (`Status`, `Cause`, `Count`, etc.) in `tools/c_stubber.js`.
- [x] Infer subword pointer types (`u8*`, `s8*`, `u16*`, `s16*`) and volatile MMIO qualifiers (`volatile u32*`).
- [x] Expand unit tests in `tools/test_c_stubber.js` (17 tests total).

## Toolchain Resolution & Pipeline Normalization (v0.72.0)

- [x] Refactor toolchain lookup (`compiler`, `objcopy`, `objdump`) in `tools/ai_matcher.py` with `shutil.which`.
- [x] Normalize sequential step comments in `tools/test_pipeline.py`.

## CLI Dashboard Dynamic Cycling & Status Overrides (v0.73.0)

- [x] Implement `cycle_target_game` and status parameter overrides in `tools/mparty_cli.py`.
- [x] Add unit tests in `tools/test_mparty_cli.py`.

## Mario Party 4 GameCube Decompilation Scaffolding (v0.74.0)

- [x] Add `mp4` profile to `tools/generate_splat.py`.
- [x] Generate baseline `splat.mp4.yaml`.
- [x] Register in `Makefile` and `tools/verify_architecture.py`.
- [x] Add unit tests in `tools/test_generate_splat.py`.

## Documentation Governance & README Consolidation (v0.75.0)

- [x] Consolidate `README.md` into production-ready architectural guide.
- [x] Verify architecture requirements against all core documentation.

## Frontend UI Refinements & Formatting (v0.76.0)

- [x] Clean up JSX formatting and handler indentation in `web/src/components/NetworkControl.tsx`.
- [x] Validate Next.js production build and Playwright test suites.

## Multi-Title Non-Matching Prefixes in C Stubber (v0.77.0)

- [x] Support configurable `nonmatchingsPrefix` and `--nonmatchings-prefix` in `tools/c_stubber.js`.
- [x] Add Unit Test 18 in `tools/test_c_stubber.js`.

## Validation Layer Splat Config Failure Testing (v0.78.0)

- [x] Add missing splat configuration failure tests in `tools/test_validation_layer.py`.
- [x] Assert 6/6 failure mode coverage in `tools/test_pipeline.py`.

## Granular MMIO Sub-Register Mapping (v0.79.0)

- [x] Add Audio, Video, and Serial Interface sub-registers to `tools/c_stubber.js`.
- [x] Implement immediate memory offset addition for base pointer MMIO detection.
- [x] Add Unit Test 19 in `tools/test_c_stubber.js`.

## Decompilation Studio Mario Party 4 Target Selection (v0.80.0)

- [x] Add `mp4` to `DecompilationStatus.tsx` target selector and `/api/ai`.
- [x] Add Playwright test in `web/tests/decompilation_status.spec.ts`.

## Centralized CLI Mario Party 4 Integration (v0.81.0)

- [x] Add `mp4` to `tools/mparty_cli.py` title parser, cycle sequence, and status formatting.
- [x] Expand unit tests in `tools/test_mparty_cli.py`.

## Rodata Relocation Refinement & Float Constant Recognition (v0.82.0)

- [x] Differentiate read-only rodata from mutable global data in `tools/c_stubber.js`.
- [x] Add `rodataFloats` recognition and annotation.
- [x] Add Unit Test 20 in `tools/test_c_stubber.js`.

## Disassembly Directory Customization & Unit Testing (v0.83.0)

- [x] Add `--asm-dir` and `--nonmatchings-dir` to `tools/disassemble.py`.
- [x] Create `tools/test_disassemble.py` unit test suite.
- [x] Integrate into `tools/test_pipeline.py` and `tools/verify_architecture.py`.

## Position-Independent Code (PIC) Relocations in C Stubber (v0.84.0)

- [x] Add `%got` and `%call16` pattern parsing in `tools/c_stubber.js`.
- [x] Annotate `External Calls` in generated C stub comments.
- [x] Add Unit Test 21 in `tools/test_c_stubber.js`.

## Unaligned Memory Access Handling in C Stubber (v0.85.0)

- [x] Detect unaligned load/store instructions (`lwl`, `lwr`, `ldl`, `ldr`, `swl`, `swr`, `sdl`, `sdr`) in `tools/c_stubber.js`.
- [x] Add `hasUnalignedAccess` tracking and comment annotations (`Features: Unaligned Memory Access (lwl/lwr/swl/swr)`).
- [x] Add Unit Test 22 in `tools/test_c_stubber.js` (22/22 unit tests passing).

## Resilient Non-Matching Error Handling & Diagnostics (v0.86.0)

- [x] Add function-level try-catch error recovery in `tools/c_stubber.js`.
- [x] Track detailed warnings (`stats.warnings`) and preserve `#pragma GLOBAL_ASM` generation.
- [x] Add Unit Test 23 in `tools/test_c_stubber.js` (23/23 unit tests passing).

## Float & Double Pointer Parameter Inferencing (v0.87.0)

- [x] Infer `f32*` and `f64*` pointer argument types in `tools/c_stubber.js` based on `lwc1`/`swc1` and `ldc1`/`sdc1` memory operations.
- [x] Add Unit Test 24 in `tools/test_c_stubber.js` (24/24 unit tests passing).

## Const Qualifier Inferencing on Read-Only Pointers (v0.88.0)

- [x] Infer `const` qualifiers for pointer parameters without memory store instructions in `tools/c_stubber.js`.
- [x] Add Unit Test 25 in `tools/test_c_stubber.js` (25/25 unit tests passing).

## Function Symbol Directive Recognition (v0.89.0)

- [x] Support `.globl` and `.ent` symbol directives in `tools/c_stubber.js` and `tools/disassemble.py`.
- [x] Add Unit Test 26 in `tools/test_c_stubber.js` and update `tools/test_disassemble.py`.

## Pointer Return Type Inferencing (v0.90.0)

- [x] Infer `void*` return types in `tools/c_stubber.js` when `$v0` holds pointer addresses.
- [x] Emit `return NULL;` fallback stubs in non-matching C files.
- [x] Add Unit Test 27 in `tools/test_c_stubber.js` (27/27 unit tests passing).

## Trivial Leaf Function Synthesis (v0.91.0)

- [x] Detect trivial return expressions in `tools/c_stubber.js` (`isTrivialLeaf`, `trivialReturnExpr`).
- [x] Synthesize direct `return <expr>;` statements in C stubs.
- [x] Add Unit Test 28 in `tools/test_c_stubber.js` (28/28 unit tests passing).

## Automated Splat Option Parsing in Disassembler (v0.92.0)

- [x] Parse `asm_path` and `non_matchings_path` directly from splat YAML in `tools/disassemble.py`.
- [x] Add unit tests in `tools/test_disassemble.py` (5/5 tests passing).

## TLS Relocation Recognition in C Stubber (v0.93.0)

- [x] Support `%dtprel_hi`, `%dtprel_lo`, `%tprel_hi`, `%tprel_lo` in `tools/c_stubber.js`.
- [x] Track `tlsSymbols` and emit comment annotations.
- [x] Add Unit Test 29 in `tools/test_c_stubber.js` (29/29 unit tests passing).

## Function Closing Directive Recognition (v0.94.0)

- [x] Support `.end` and `glabel_end` directives in `tools/disassemble.py` and `tools/c_stubber.js`.
- [x] Add Unit Test 30 in `tools/test_c_stubber.js` and test in `tools/test_disassemble.py`.

## Floating-Point Trivial Leaf Return Synthesis (v0.95.0)

- [x] Synthesize floating-point trivial returns in `tools/c_stubber.js` (`return f12;`, `return 0.0f;`).
- [x] Add Unit Test 31 in `tools/test_c_stubber.js` (31/31 unit tests passing).

## Bitwise & Shift Trivial Leaf Return Synthesis (v0.96.0)

- [x] Synthesize bitwise/shift trivial returns in `tools/c_stubber.js` (`return a0 & 0xFF;`, `return a0 << 2;`).
- [x] Add Unit Test 32 in `tools/test_c_stubber.js` (32/32 unit tests passing).

## PI/MI Hardware MMIO Register Expansion (v0.97.0)

- [x] Add PI Cartridge DMA and MI Interrupt Mask register mappings in `tools/c_stubber.js`.
- [x] Add Unit Test 33 in `tools/test_c_stubber.js` (33/33 unit tests passing).

## RI/DPC Hardware MMIO Register Expansion (v0.98.0)

- [x] Add RDRAM Interface and Display Processor Command register mappings in `tools/c_stubber.js`.
- [x] Add Unit Test 34 in `tools/test_c_stubber.js` (34/34 unit tests passing).

## SP Hardware MMIO Register Expansion (v0.99.0)

- [x] Add Signal Processor (SP) DMA and status register mappings in `tools/c_stubber.js`.
- [x] Add Unit Test 35 in `tools/test_c_stubber.js` (35/35 unit tests passing).
