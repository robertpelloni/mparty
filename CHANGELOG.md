# CHANGELOG

## [0.91.0]
### Added
- Implemented trivial leaf function detection and direct C stub body synthesis in `tools/c_stubber.js` (e.g. `return a0;`, `return 42;`, `return 0;`).
- Added Unit Test 28 in `tools/test_c_stubber.js` (28/28 tests passing).

## [0.90.0]
### Added
- Added pointer return type inferencing (`void*`) in `tools/c_stubber.js` when `$v0` is loaded or calculated from pointer arguments or symbol addresses.
- Added `return NULL;` fallback code generation for pointer return signatures in `#ifdef NON_MATCHING` C stubs.
- Added Unit Test 27 in `tools/test_c_stubber.js` (27/27 tests passing).

## [0.89.0]
### Added
- Expanded function symbol directive recognition in `tools/c_stubber.js` and `tools/disassemble.py` to support `.globl` and `.ent` in addition to `.global` and `glabel`.
- Added Unit Test 26 in `tools/test_c_stubber.js` (26/26 tests passing) and unit test in `tools/test_disassemble.py` validating modular function extraction across directives.

## [0.88.0]
### Added
- Added `const` qualifier inferencing on read-only pointer parameters in `tools/c_stubber.js`, distinguishing read-only memory references (`const void*`, `const u8*`, `const f32*`, `const void* /* struct */`) from mutable stored pointer targets.
- Added Unit Test 25 in `tools/test_c_stubber.js` validating `const` qualifier inference (25/25 tests passing).

## [0.87.0]
### Added
- Refined float and double pointer parameter inferencing (`f32*`, `f64*`) in `tools/c_stubber.js` based on single- and double-precision floating-point memory operations (`lwc1`/`swc1` and `ldc1`/`sdc1`).
- Added Unit Test 24 in `tools/test_c_stubber.js` validating `f32*` and `f64*` parameter type inference (24/24 tests passing).

## [0.86.0]
### Added
- Enhanced `tools/c_stubber.js` with resilient function-level try-catch error recovery for non-matching assembly stubs.
- Added detailed warning tracking (`stats.warnings`) and parse warning comment annotations (`Parse Warnings: ...`) in generated C stubs, ensuring uninterrupted `#pragma GLOBAL_ASM` generation even on malformed or edge-case assembly input.
- Added Unit Test 23 in `tools/test_c_stubber.js` validating resilient warning reporting and `#pragma GLOBAL_ASM` output (23/23 tests passing).

## [0.85.0]
### Added
- Added unaligned memory access instruction detection (`lwl`, `lwr`, `ldl`, `ldr`, `swl`, `swr`, `sdl`, `sdr`) to `tools/c_stubber.js`.
- Implemented `hasUnalignedAccess` tracking and added `Features: Unaligned Memory Access (lwl/lwr/swl/swr)` comment annotations to generated C stubs.
- Added Unit Test 22 in `tools/test_c_stubber.js` validating unaligned instruction parsing and comment generation (22/22 unit tests passing).

## [0.84.0]
### Added
- Added `%got(symbol)` and `%call16(symbol)` position-independent code (PIC) relocation recognition to `tools/c_stubber.js`.
- Added `calledFunctions` tracking to document `External Calls: ...` in generated C stub comments.
- Added Unit Test 21 in `tools/test_c_stubber.js` (21/21 tests passing).

## [0.83.0]
### Added
- Enhanced `tools/disassemble.py` with configurable `--asm-dir` and `--nonmatchings-dir` options for multi-title modular disassembly.
- Created `tools/test_disassemble.py` unit test suite verifying modular function extraction and isolation.
- Integrated disassembly unit testing into `tools/test_pipeline.py` and registered in `tools/verify_architecture.py`.

## [0.82.0]
### Added
- Refined `.rodata` relocation tracking in `tools/c_stubber.js` by recognizing floating-point constant loads (`lwc1`, `ldc1`) and annotating them as `Rodata Floats: ...`.
- Strictly isolated pure read-only data symbols in `rodataSymbols` by filtering out symbols with memory write access.
- Added Unit Test 20 in `tools/test_c_stubber.js` (20/20 unit tests passing).

## [0.81.0]
### Added
- Added Mario Party 4 (`mp4`) support to `tools/mparty_cli.py` across title names, parser choices, and cyclic dashboard rotations.
- Expanded unit tests in `tools/test_mparty_cli.py` covering `mp4` parsing and cycling (5/5 tests passing).

## [0.80.0]
### Added
- Added Mario Party 4 (`mp4`) target selection to `web/src/components/DecompilationStatus.tsx`, displaying GameCube build targets and metrics (`24,500` non-matching units).
- Updated `web/src/app/api/ai/route.ts` to allow `mp4` in target game parameter parsing.
- Added automated Playwright test in `web/tests/decompilation_status.spec.ts` asserting MP4 target switching and unit count rendering.

## [0.79.0]
### Added
- Expanded hardware MMIO register mapping in `tools/c_stubber.js` with sub-registers for Audio (`AI_LEN_REG`, `AI_STATUS_REG`, `AI_DACRATE_REG`, `AI_BITRATE_REG`), Video (`VI_ORIGIN_REG`, `VI_WIDTH_REG`, `VI_INTR_REG`), and Serial (`SI_PIF_ADDR_RD64B_REG`, `SI_STATUS_REG`) interfaces.
- Added immediate offset resolution in `analyzeAsmBody` to detect sub-registers accessed via non-zero offsets from base register pointers.
- Added Unit Test 19 in `tools/test_c_stubber.js` validating sub-register resolution (19/19 tests passing).

## [0.78.0]
### Added
- Expanded `tools/test_validation_layer.py` with failure mode test coverage for missing baseline splat configurations (`splat.yaml`).

## [0.77.0]
### Added
- Added configurable `nonmatchingsPrefix` support and `--nonmatchings-prefix` CLI option to `tools/c_stubber.js` for multi-title modular `#pragma GLOBAL_ASM` generation.
- Added Unit Test 18 in `tools/test_c_stubber.js` verifying custom non-matching prefix routing in generated C stubs (18/18 tests passing).

## [0.76.0]
### Refactored
- Cleaned up formatting and indentation in `web/src/components/NetworkControl.tsx` around rollback handlers and JSX input/tooltip elements.

## [0.75.0]
### Refactored
- Cleaned up `README.md` into a production-ready architectural guide covering the full decompilation toolchain, 4-tier single-page web hypervisor frontend, system tray daemon management, and quickstart commands.

## [0.74.0]
### Added
- Expanded `tools/generate_splat.py` with `mp4` profile support for Mario Party 4 (GameCube DOL/FST segment structure).
- Generated baseline `splat.mp4.yaml` configuration targeting GameCube memory layouts (`0x80003100` main DOL, `0x80200000` overlays).
- Added `splat.mp4.yaml` to `Makefile` `splat-configs` target and registered in `tools/verify_architecture.py`.
- Expanded unit tests in `tools/test_generate_splat.py` to validate `mp4` profile resolution and root configuration presence.

## [0.73.0]
### Added
- Added title profile cycling (`cycle_target_game`) in `tools/mparty_cli.py` to rotate between `mp1` -> `mp2` -> `mp3` -> `mp1`.
- Enhanced `render_dashboard_header` with configurable service status parameter overrides (`decomp`, `web`, `netplay`).
- Added Unit Tests in `tools/test_mparty_cli.py` (`test_cycle_target_game`, `test_render_dashboard_header_custom_statuses`).

## [0.72.0]
### Refactored
- Replaced subshell toolchain binary checks (`os.system("which ...")`) in `tools/ai_matcher.py` with standard Python `shutil.which` for compiler (`mips-linux-gnu-gcc`), objcopy, and objdump resolution.
- Cleaned up and normalized step numbering comments in `tools/test_pipeline.py` sequentially (Steps 1 through 11).

## [0.71.0]
### Added
- Expanded `tools/c_stubber.js` with MIPS System Control Coprocessor 0 (COP0) register recognition (`mfc0`/`mtc0` for `$12/Status`, `$13/Cause`, `$14/EPC`, `$9/Count`, `$11/Compare`, etc.), annotating them under `System Control COP0: ...` in generated C stub comments.
- Added subword memory access pointer typing (`u8*`, `s8*`, `u16*`, `s16*`) for byte and halfword load/store instructions (`lbu`, `sb`, `lhu`, `sh`).
- Added volatile MMIO base pointer inferencing (`volatile u32*`) when registers access hardware registers.
- Added Unit Tests 16 and 17 in `tools/test_c_stubber.js` validating COP0 recognition and subword/volatile MMIO type inferencing (17/17 passing).

## [0.70.0]
### Added
- Generated baseline `splat.yaml`, `splat.mp1.yaml`, `splat.mp2.yaml`, and `splat.mp3.yaml` configurations for Mario Party 1, 2, and 3 targeting respective assembly, source, asset, and overlay segment boundaries.
- Added `splat-configs` target in `Makefile` to batch generate splat configurations across all three titles.
- Updated `tools/verify_architecture.py` to assert the presence of baseline configurations `splat.yaml`, `splat.mp1.yaml`, `splat.mp2.yaml`, and `splat.mp3.yaml`.
- Added `test_repo_root_configurations` in `tools/test_generate_splat.py` to validate baseline configuration structure and segment paths.

## [0.69.0]
### Added
- Expanded `tools/verify_architecture.py` to assert the existence and integrity of all project toolchain scripts (`ai_matcher.py`, `ai_loop.py`, `mparty_cli.py`), test harness suites (`test_ai_matcher.py`, `test_generate_splat.py`, `test_mparty_cli.py`, `test_pipeline.py`), and web directory scaffolding (`web`, `web/src`, `web/tests`).
- Verified failure modes in `tools/test_validation_layer.py`.

## [0.68.0]
### Added
- Enhanced `tools/ai_matcher.py` with `normalize_instruction` to strip machine memory offsets, address hex tags, and formatting discrepancies from disassembly output.
- Added normalized assembly diff generation to highlight true opcode and register differences for LLM self-correction prompts.
- Created `tools/test_ai_matcher.py` unit test suite and integrated it into `tools/test_pipeline.py`.

## [0.67.0]
### Added
- Expanded `tools/mparty_cli.py` with multi-title targeting (`--game` / `-g` for `mp1`, `mp2`, `mp3`).
- Added title-aware interactive dashboard header displaying active profile details.
- Added unit test suite `tools/test_mparty_cli.py` and integrated into `tools/test_pipeline.py`.

## [0.66.0]
### Added
- Added multi-title Mario Party target selector (`mp1`, `mp2`, `mp3`) to `web/src/components/DecompilationStatus.tsx` dynamically updating build targets, non-matching function counts, and logs.
- Expanded `web/src/app/api/ai/route.ts` to parse target game requests and forward `--nonmatchings-dir` configuration to `ai_loop.py`.
- Updated Playwright integration tests in `web/tests/decompilation_status.spec.ts` verifying multi-title selection and metrics.

## [0.65.0]
### Added
- Enhanced `tools/ai_loop.py` with `locate_target_asm` and `locate_target_bin` supporting recursive assembly and binary resolution across modular `asm/nonmatchings/` and `build/expected/` directories.
- Added `--nonmatchings-dir` CLI parameter to `tools/ai_loop.py` for targeted non-matching function refinement.
- Added unit test in `tools/test_ai_loop.py` verifying non-matching target resolution (7/7 tests passing).

## [0.64.0]
### Added
- Enhanced `tools/disassemble.py` to recursively scan all subdirectories under `asm/` for `.s` files, extracting modular non-matching functions into `asm/nonmatchings/<module_path>/<func>.s`.
- Added `--process-nonmatchings` flag and recursive processing option to `tools/c_stubber.js` for granular per-function C stub generation.
- Added Unit Test 15 in `tools/test_c_stubber.js` validating modular non-matching directory processing and stub generation (15/15 passing).

## [0.63.0]
### Added
- Expanded `tools/generate_splat.py` with multi-title configuration profiles (`GAME_PROFILES`) and automatic detection for Mario Party 1 (`mp1`), Mario Party 2 (`mp2`), and Mario Party 3 (`mp3`).
- Added `--game` / `-g` CLI option to `tools/generate_splat.py` to target distinct game assembly, source, asset, and overlay memory layouts.
- Created `tools/test_generate_splat.py` test suite validating profile resolution, filename auto-detection, and multi-title YAML configuration generation.
- Integrated `Test Splat Multi-Title Generation` directly into `tools/test_pipeline.py`.

## [0.62.0]
### Added
- Added `%gp_rel` relocation parsing to detect small data/BSS symbol access relative to `$gp`.
- Differentiated global variable read accesses (`lw`, `lh`, `lb`, etc.) from write accesses (`sw`, `sh`, `sb`, etc.).
- Annotated separated `Global Reads` and `Global Writes` symbol lists in generated C function comments.
- Added Unit Test 14 in `tools/test_c_stubber.js` validating `%gp_rel` relocations and read/write classification (14/14 passing).

## [0.61.0]
### Added
- Added batch processing statistics tracking, skipped file accounting, and warning reporting to `processDirectory` in `tools/c_stubber.js`.
- Implemented structured JSON report emission to `build/stubber_report.json` during batch C-stubbing runs.
- Added unit test in `tools/test_c_stubber.js` validating batch directory processing, function counting, and skipped file metrics (13/13 passing).

## [0.60.0]
### Added
- Added support for detecting stack-passed arguments beyond `$a3` (e.g. `s32 a4 /* from stack */` loaded from caller stack frames via `$sp`).
- Added unsigned integer type inference (`u32` returns and parameters) driven by unsigned MIPS operations (`divu`, `multu`, `lbu`, `lhu`, `sltu`).
- Added graceful error handling and reporting for malformed or empty assembly bodies with line-number context.
- Added unit tests in `tools/test_c_stubber.js` validating stack argument resolution, unsigned type inference, and empty-input error recovery (12/12 passing).

## [0.59.0]
### Added
- Expanded `tools/c_stubber.js` to detect memory-mapped I/O (MMIO) register addresses for N64 hardware interfaces (`SP`, `DPC`, `DPS`, `MI`, `VI`, `AI`, `PI`, `RI`, `SI`).
- Implemented pattern recognition for `.rodata` symbols and jump table targets via `%hi` and `%lo` relocation pairs.
- Added automatic annotation of hardware MMIO registers and `.rodata` symbol references in generated C function comments.
- Added unit test coverage in `tools/test_c_stubber.js` for MMIO register and rodata relocation detection.

## [0.58.0]
### Added
- Expanded `tools/c_stubber.js` pattern recognition to distinguish double-precision float parameters (`f64 f12`, `f64 f14`) from single-precision floats (`f32`) based on opcode suffixes (`.d`, `ldc1`, `sdc1`).
- Added support for 64-bit integer argument pair detection (`s64 a0`) across `$a0-$a1` when doubleword memory instructions (`ld`, `sd`) are present.
- Added loop structure detection (`hasLoop`) tracking backward branching instructions (`bne`, `beq`, `bgez`) to annotate control flow in generated C comments.
- Added unit tests in `tools/test_c_stubber.js` verifying double-precision float inferencing and loop annotations.

## [0.57.0]
### Added
- Expanded `tools/c_stubber.js` with struct and array offset spread inference on pointer parameters (`void* arg /* struct */`).
- Added preservation analysis and comment emission for callee-saved registers (`$s0-$s7`, `$fp`) in generated C stubs.
- Added boolean condition detection (`isBooleanV0`) for return value registers constrained by `slt`/`slti`/`sltu`.
- Added unit tests in `tools/test_c_stubber.js` verifying struct offset spreads, callee-saved register tracking, and boolean flag detection.

## [0.56.0]
### Added
- Expanded `tools/generate_splat.py` to auto-discover symbol entry points and inject `non_matchings_path: asm/nonmatchings` configurations into generated `splat.yaml`.
- Automated generation of typed prototype headers in `include/functions.h` during splat configuration generation.
- Added verification of `include/functions.h` into `tools/test_pipeline.py`.

## [0.55.0]
### Added
- Expanded `web/src/components/DecompilationStatus.tsx` with an interactive C Stub preview viewer displaying typed signatures and `#pragma GLOBAL_ASM` wrappers.
- Added a "Process Nonmatchings" button to invoke modular assembly splitting into `asm/nonmatchings/` directly from the UI, updating non-matching function tallies in real-time.
- Added Playwright end-to-end test suite `web/tests/decompilation_status.spec.ts` asserting non-matching processing and stub inspector visibility toggles.

## [0.54.0]
### Added
- Integrated end-to-end intelligent C stubbing, non-matching extraction, and `test_c_stubber.js` directly into `tools/test_pipeline.py`.
- Automated validation of generated typed C signatures and `#pragma GLOBAL_ASM` blocks in the core testing pipeline.

## [0.53.0]
### Added
- Expanded `tools/disassemble.py` to automatically extract individual assembly functions into structured `asm/nonmatchings/<module>/<func>.s` directories.
- Updated `tools/c_stubber.js` with `#pragma GLOBAL_ASM("asm/nonmatchings/...")` wrapper generation guarded by `#ifdef NON_MATCHING`, ensuring byte-parity builds during ongoing decompilation.
- Added test coverage in `tools/test_c_stubber.js` verifying `#pragma GLOBAL_ASM` generation.

## [0.52.0]
### Added
- Refined `tools/c_stubber.js` MIPS assembly parsing with load/store opcode differentiation, pointer parameter inference (`void*`, `s32*`), 64-bit return detection (`s64`, `f64`), and indirect jump table switch statement recognition.
- Expanded unit tests in `tools/test_c_stubber.js` verifying pointer inference from dereferenced base addresses, 64-bit return registers (`$v0`, `$v1`), and indirect branches (`jr $t1`).

## [0.51.0]
### Added
- Expanded `tools/ai_loop.py` with multi-candidate temperature stepping (`0.2`, `0.4`, `0.7`), assembly diff penalty line scoring (`calculate_diff_score`), and best-candidate state retention/rollback.
- Implemented persistent learned rule caching in `build/decomp_rules.json` to store successful refactoring parameters and temperatures per function.
- Expanded unit test coverage in `tools/test_ai_loop.py` to validate candidate scoring, rule caching, and iterative convergence.

## [0.50.0]
### Added
- Enhanced `tools/ai_matcher.py` with structured assembly diff extraction (`generate_assembly_diff`, `--diff`, `--target-asm`), comparing compiled object disassembly with target MIPS assembly lines.
- Integrated structured assembly diff output into `tools/ai_loop.py` to pass normalized instruction diffs into LLM self-correction prompts for higher matching accuracy.
- Added test coverage in `tools/test_ai_loop.py` verifying structured assembly diff diagnostics through multi-step self-correction.

## [0.49.0]
### Added
- Refined C stub generation in `tools/c_stubber.js` with intelligent MIPS assembly pattern recognition to infer return types (`s32`, `f32`, `void`), argument registers (`$a0-$a3`, `$f12`, `$f14`), and stack frame dimensions (leaf vs non-leaf functions with `$sp` tracking).
- Added dedicated test suite `tools/test_c_stubber.js` validating assembly extraction, typed argument inferencing, float registers, and leaf/non-leaf categorization.

## [0.48.0]
### Added
- Expanded `NetplayManager.ts` with direct WebRTC DataChannel packet transmission (`sendDataPacket`) and subscription handlers (`onDataPacket`) to implement low-latency UDP message transport, addressing HTTP bottlenecking under high concurrent payload loads.
- Added unit tests in `web/tests/NetplayManager.spec.ts` to assert packet transmission states and event callback dispatches.

## [0.47.0]
### Added
- Expanded `tools/ai_loop.py` with multi-step iterative LLM self-correction: feeds compiler diagnostics and binary-diff output directly back into the LLM prompt over configurable retries (`--max-retries`).
- Added configurable `--api-url` argument and `LLM_API_URL` environment variable support to `tools/ai_loop.py` for local or proxy mock testing.
- Added comprehensive unit test coverage in `tools/test_ai_loop.py` for multi-step iterative self-correction with diagnostic error feedback.

## [0.46.0]
### Added
- Created `SystemTray.tsx` with floating status indicators, service monitoring (Next.js server, Netplay socket, AI matcher, PCM audio), and interactive controls to safely quit servers and restart all services.
- Created `AudioEngineControl.tsx` wiring PCM audio buffer streams (`decodePCMStream`), volume slider, mute toggling, and engine status indicators.
- Created `InputDiagnostics.tsx` wiring `InputManager` to interactive digital button toggles (A, B, Start), analog stick sliders (-128 to 127 clamped), and real-time 32-bit packed N64 bitmask display.
- Created `GraphicsPipelineControl.tsx` wiring `Fast3DTranslator` display list processing mocks, vertex cache inspection (32 vertices), and cache flushing.
- Created `ConsoleBridgeControl.tsx` wiring `GameCubeEmulator` ISO mounting (Mario Party 4-9), FST archive module extraction simulation, and hypervisor status.
- Created `CliTerminalModal.tsx` providing an interactive terminal modal to trigger `mparty_cli.py` routines (`test`, `run`, `dashboard`).
- Created `web/tests/system_tray.spec.ts` asserting tray toggle, server quit/restart flows, and subsystem component interactions.
### Changed
- Redesigned `web/src/app/page.tsx` into a consolidated, single-page dashboard grouped into 4 user-value tiers (Tier 1: Play & Connect, Tier 2: Progression & Hardware Subsystems, Tier 3: Graphics Middleware & Optical Expansion, Tier 4: Decompilation Studio & Assets).
- Updated `AudioManager.ts` with master volume control methods (`setMasterVolume`) and flexible Float32Array/ArrayBuffer stream decoding.
- Aligned `SaveStateControl.tsx` imported status message to "Imported Cross-Gen JSON".

## [0.45.0]
### Added
- Added `tests/Fast3DTranslator.spec.ts` test suite to assert boundary conditions and failure modes (vertex cache array bounds, null index pointers) within the Fast3D to WebGL middleware.
## [0.44.0]
### Added
- Added `tests/validatePayload.spec.ts` test suite to assert boundary conditions and failure modes (nulls, object validation, type mismatches) within the `/api/stream` JSON parsing layer.
## [0.43.0]
### Added
- Hardened `tools/test_ai_loop.py` to validate edge-cases in the AI compilation loop, including missing API keys and persistent matcher failures.
## [0.42.0]
### Added
- Integrated `tools/test_ai_loop.py` into the continuous integration testing pipeline via `tools/test_pipeline.py`.
- Added execution of `tools/test_validation_layer.py` into the continuous integration testing pipeline.
## [0.41.0]
### Added
- Hardened the `/api/stream` endpoint with boundary checks for `MAX_PAYLOAD_DATA_LENGTH` (1000 items) to prevent potential DoS through excessively large array payloads.
- Added strict `action` string allow-listing (`sync_input`, `ping`, `save_state`, `load_state`) to reject unmapped stream actions.
- Introduced `tests/stream_async.spec.ts` for rigorous validation edge cases.
## [0.40.0]
### Added
- Completed system load testing resilience evaluation. Added resilience proposal to `TODO.md` recommending migrating high-frequency stream requests away from HTTP routes to raw WebRTC data channels to prevent request timeouts under extreme simulation loads.
## [0.39.0]
### Added
- Added `tests/api_roms.spec.ts` test suite to assert the stability of the `/api/roms` endpoint mapping N64 and GameCube title metadata payloads correctly.
## [0.38.0]
### Added
- Completed WASM hypervisor refinement by fleshing out memory layer logic in `EmulationCore.ts` and `SaveStateManager.ts`.
- Implemented test cases for `EmulationCore` to ensure stability of the API.
## [0.37.0]
### Added
- Added `tests/NetplayManager.spec.ts` test suite to assert the rollback buffer limits and desync flag conditions under simulated latency.
- Validated `NetplayManager.ts` async handlers to ensure edge-case prediction frames are dropped properly to avoid memory leaks.
## [0.36.0]
### Added
- Added `tests/InputManager.spec.ts` test suite to specifically target analog joystick edge-cases (like out-of-bounds inputs or NaN crashes).
- Refactored `InputManager.ts` to implement resilient boundary clamping, keeping output inputs strictly signed 8-bit (-128 to +127).
## [0.35.0]
### Added
- Created `tools/test_validation_layer.py` test suite to specifically target `tools/verify_architecture.py` failure modes.
- Refactored `tools/verify_architecture.py` to handle edge-case failure modes gracefully (e.g., missing files, empty files, unreadable files, directories as files).
## [0.31.0]
### Added
- Implemented SHA-256 hash checking logic into `texture_converter.py` and `model_extractor.py` to cache file signatures and avoid redundant extractions during continuous AI decompilation loops.


## [0.29.0]
### Added
- Expanded `NetplayManager.ts` to implement `syncRemoteInputs()`, verifying predicted frames against arrived inputs to finalize the WebAssembly Netplay Sync Logic loop.
- Wired the `"Mock Client Desync"` button into `NetworkControl.tsx` to visualize state rollbacks.


## [0.28.0]
### Added
- Wired `AudioManager.decodePCMStream` into `EmulationCore.ts` to seamlessly intercept and extract simulated raw WebAssembly audio engine blocks via dummy PCM memory pointers.
- Refactored `Fast3DTranslator.ts` internal RSP geometry cache buffer initialization to pre-allocate `null` matrices natively on WebGL bounds binding to improve memory alignment.


## [0.27.0]
### Added
- Expanded `AudioManager.ts` with `decodePCMStream()` to parse arbitrary raw interleaved PCM data buffers generated by legacy console decoders (like MUSYX).
- Evaluated proper queue continuity to prevent WASM/JS event loop underruns.


## [0.26.0]
### Added
- Expanded the `DecompilationStatus.tsx` component to include a `Parse MIPS` button to trigger the manual Node.js `c_stubber.js` log extraction process.
- Implemented dummy visual log entries mapped to the UI for validating the extraction process state tracking.


## [0.25.3]
### Fixed
- Reverted ESLint integration to standard v8 `.eslintrc.json` configuration, resolving breaking build issues caused by hallucinated configuration schemas.


## [0.25.0]
### Added
- Expanded `NetplayManager.ts` to implement a rollback netcode buffer interface capable of receiving remote game states.
- Expanded the Next.js Network Control UI to include a visual 'Latency Config' slider to mock adjusting ping compensation dynamically.


## [0.24.0]
### Added
- Expanded `mparty_cli.py` with an interactive `dashboard` command parameter to visualize and monitor the mocked states of the Netplay server, Next.js frontend, and AI matching pipeline natively in the terminal.


## [0.23.1]
### Fixed
- Re-installed missing or hallucinated `package.json` and `package-lock.json` dependencies via `npm install next@latest react@latest...` to resolve CI build blockers stemming from non-existent Next.js versions.


## [0.23.0]
### Changed
- Updated `Makefile` CFLAGS to target `-O2` instead of `-O0`, bringing the build system's native optimization alignment in parity with `ai_matcher.py`.


## [0.22.1]
### Fixed
- Added robust local dictionary caching to `useDataFetch` hook to persist memory across unmounts without relying on component state.
- Fixed `ai_loop.py` execution directory context within Next.js `/api/ai` route by forcing `cwd` to the project root.


## [0.22.0]
### Added
- Refactored `AssetGallery.tsx` with a custom `useDataFetch` hook to handle the new `metadata` payload structure securely.
- Added artificial network latency handling and cached fallbacks to the Asset extraction UI payload requests.


## [0.21.0]
### Added
- Exposed an API route `/api/ai` in Next.js to trigger the `ai_loop.py` script securely from the web client.
- Added a "Run AI Loop" manual trigger button in `DecompilationStatus.tsx` to visualize the pipeline logs on the dashboard.


## [0.20.0]
### Added
- Expanded `ai_matcher.py` with mock `mips-linux-gnu-gcc` logic loops for test environments.
- Implemented `ai_loop.py` tests with mocked LLM HTTP calls for testing automated AI matching capabilities.


## [0.18.0]
### Added
- Implemented `predictInputState()` mock for GGPO-style rollback netcode in `NetplayManager.ts`.
- Exposed manual rollback trigger button in the `NetworkControl.tsx` host UI.


## [0.17.0]
### Added
- Integrated `GameCubeEmulator` instantiation inside `EmulationCore.ts` `loadRom` and `start` functions, depending on platform metadata.


## [0.14.0]
### Added
- Implemented WebGL translation mocks (`gSPProcessDisplayList`, `gSPVertex`, `gSP1Triangle`) and vertex caching inside `Fast3DTranslator.ts`.

## [0.13.0]
### Changed
- Redesigned and reorganized the Next.js dashboard UI to intuitively group and prioritize high-value features.

## [0.12.0]
### Added
- Wired WebRTC Netplay logic (`hostGame`, `joinGame`) to the `NetworkControl` dashboard component.

## [0.11.0]
### Added
- Implemented `exportSave()` and `importSave()` in `web/src/lib/SaveStateManager.ts` and wired to dashboard UI for universal cross-game state persistence.

## [0.10.0]
### Added
- Hardened `tools/generate_splat.py` with N64 header validation mocks.
- Made `tools/disassemble.py` robust against missing `splat64` dependencies.

## [0.9.0]
### Added
- Added GitHub Actions CI pipeline to automate Python and Playwright testing.

## [0.8.0]
### Added
- Expanded `run` command in `tools/mparty_cli.py` to dispatch data payloads over WebSockets.
- Connected `web/src/lib/NetplayManager.ts` to mock WebSocket stream reception.

## [0.7.0]
### Added
- Expanded `run` command in `tools/mparty_cli.py` to parse mock incoming network connection streams.

## [0.6.0]
### Added
- Added `run` command to `tools/mparty_cli.py` to initialize the mparty event loop and mock socket handling.

## [0.5.0]
### Added
- Added `web/src/lib/GameCubeEmulator.ts` for Dolphin WASM integration.
- Expanded `tools/iso_extractor.py` to support GCZ parsing mocks.

## [0.4.0]
### Added
- Added `tools/texture_converter.py`, `tools/model_extractor.py`, `tools/audio_decoder.py`, and `tools/iso_extractor.py` as scaffolding scripts for the asset extraction pipeline.

## [0.3.0]
### Added
- Integrated Next.js frontend dashboard with Playwright testing.
- Created mock manager classes for Emulation, Audio, Netplay, and Input.

## [0.2.0]
### Added
- Added `tools/verify_architecture.py` to strictly check for core project structure.
- Added `tools/generate_advanced_mock_rom.py` to dynamically construct valid MIPS N64 `.z64` testing artifacts to bypass legal storage constraints.
- Added `tools/test_pipeline.py` to automate integration testing of the decompilation toolchain.
- Added `tools/ai_matcher.py` to compile and binary-diff C files against target MIPS object code using `mips-linux-gnu-gcc`.
- Added `tools/ai_loop.py` to recursively iterate, match, and invoke an external LLM API for automated decompilation refactoring.
- Added `tools/mparty_cli.py` as a centralized command-line interface orchestrator for running testing, looping, and dev environments.

## [0.1.0] - 2026-06-26
### Added
- Initialized core documentation structure according to system directives (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
- Prepared directory for `tools/` implementation for ROM splitting and decompilation orchestration.
