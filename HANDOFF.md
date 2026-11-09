# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.95.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Floating-Point Trivial Leaf Return Synthesis (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added floating-point return expression synthesis (`return f12;`, `return 0.0f;`, `return 0.0;`) for trivial float and double leaf functions in `tools/c_stubber.js`.
   - Added Unit Test 31 in `tools/test_c_stubber.js` (31/31 tests passing).
2. **Function Closing Directive Recognition (`tools/disassemble.py` & `tools/c_stubber.js`):**
   - Added support for `.end <func>` and `glabel_end <func>` closing directives in `tools/disassemble.py` and `tools/c_stubber.js`.
   - Prevents non-code trailing module data/directives from bleeding into function bodies during non-matching function splitting.
   - Added Unit Test 30 in `tools/test_c_stubber.js` and test in `tools/test_disassemble.py` (all tests passing).
2. **TLS Relocation Recognition in C Stubber (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added recognition for MIPS TLS relocations (`%dtprel_hi`, `%dtprel_lo`, `%tprel_hi`, `%tprel_lo`) in `tools/c_stubber.js`.
   - Implemented `tlsSymbols` tracking and `Thread-Local Symbols: ...` comment annotation in generated C stubs.
   - Added Unit Test 29 in `tools/test_c_stubber.js` (29/29 tests passing).
2. **Automated Splat Option Parsing in Disassembler (`tools/disassemble.py` & `tools/test_disassemble.py`):**
   - Automated `asm_path` and `non_matchings_path` parsing directly from splat configuration YAML in `tools/disassemble.py`, removing manual path arguments across multi-title splat profiles.
   - Added unit tests in `tools/test_disassemble.py` (5/5 tests passing).
2. **Trivial Leaf Function Synthesis (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented trivial leaf function detection and direct C stub body synthesis in `tools/c_stubber.js` (e.g. `return a0;`, `return 42;`, `return 0;`).
   - Added Unit Test 28 in `tools/test_c_stubber.js` (28/28 tests passing).
2. **Pointer Return Type Inferencing (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented pointer return type inference (`void*`) in `tools/c_stubber.js` when `$v0` is loaded or calculated from pointer arguments or symbol addresses.
   - Added `return NULL;` fallback code generation for pointer return signatures in `#ifdef NON_MATCHING` C stubs.
   - Added Unit Test 27 in `tools/test_c_stubber.js` (27/27 tests passing).
2. **Function Symbol Directive Recognition (`tools/c_stubber.js` & `tools/disassemble.py`):**
   - Expanded function symbol scanning to support `.globl` and `.ent` directives in addition to `.global` and `glabel`.
   - Added Unit Test 26 in `tools/test_c_stubber.js` and updated `tools/test_disassemble.py` (all tests passing).
2. **Const Qualifier Inferencing on Read-Only Pointers (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented `const` qualifier inferencing on pointer parameters in `tools/c_stubber.js`, qualifying read-only memory references (`const void*`, `const u8*`, `const f32*`, `const void* /* struct */`) when no memory store operations target the base register.
   - Added Unit Test 25 in `tools/test_c_stubber.js` (25/25 tests passing).
2. **Float & Double Pointer Parameter Inferencing (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Refined parameter inferencing for single-precision and double-precision floating-point pointers (`f32*`, `f64*`) based on `lwc1`/`swc1` and `ldc1`/`sdc1` memory operations.
   - Added Unit Test 24 in `tools/test_c_stubber.js` (24/24 tests passing).
2. **Resilient Non-Matching Error Handling & Diagnostics (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Enhanced `tools/c_stubber.js` with function-level try-catch error recovery for non-matching assembly stubs.
   - Added detailed warning tracking (`stats.warnings`) and comment annotations (`Parse Warnings: ...`), ensuring robust `#pragma GLOBAL_ASM` generation even on malformed inputs.
   - Added Unit Test 23 in `tools/test_c_stubber.js` (23/23 tests passing).
2. **Unaligned Memory Access Handling in C Stubber (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added recognition for MIPS unaligned memory access instructions (`lwl`, `lwr`, `ldl`, `ldr`, `swl`, `swr`, `sdl`, `sdr`).
   - Implemented `hasUnalignedAccess` tracking to document `Features: Unaligned Memory Access (lwl/lwr/swl/swr)` in generated C stub comments.
   - Added Unit Test 22 in `tools/test_c_stubber.js` (22/22 tests passing).
2. **Position-Independent Code (PIC) Relocations in C Stubber (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented `%got(symbol)` and `%call16(symbol)` pattern parsing in `tools/c_stubber.js`.
   - Added `calledFunctions` tracking to emit `External Calls: ...` annotations in generated C stub comments.
   - Added Unit Test 21 in `tools/test_c_stubber.js`.
2. **Disassembly Directory Customization & Unit Testing (`tools/disassemble.py` & `tools/test_disassemble.py`):**
   - Added `--asm-dir` and `--nonmatchings-dir` arguments to `tools/disassemble.py`.
   - Created `tools/test_disassemble.py` verifying multi-function modular extraction.
   - Integrated into `tools/test_pipeline.py` and registered in `tools/verify_architecture.py`.
2. **Rodata Relocation Refinement & Float Constant Recognition (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented `rodataFloats` tracking to detect floating-point constants loaded via `lwc1`/`ldc1` from `%lo(symbol)`.
   - Filtered out symbols with store operations from `rodataSymbols` to strictly isolate read-only memory from mutable global data.
   - Added Unit Test 20 in `tools/test_c_stubber.js`.
2. **Centralized CLI Mario Party 4 Integration (`tools/mparty_cli.py` & `tools/test_mparty_cli.py`):**
   - Added `mp4` to `tools/mparty_cli.py` (`GAME_NAMES`, `GAME_CYCLE`, and `--game` argument parser).
   - Updated unit tests in `tools/test_mparty_cli.py` asserting title cycling and execution with `mp4`.
2. **Decompilation Studio Mario Party 4 Target Selection (`DecompilationStatus.tsx` & `/api/ai`):**
   - Added `mp4` to `DecompilationStatus.tsx` target selector, rendering GameCube build target and metrics.
   - Updated `web/src/app/api/ai/route.ts` to allow `mp4` title parameter forwarding to `ai_loop.py`.
   - Added Playwright test in `web/tests/decompilation_status.spec.ts` asserting MP4 target switching.
2. **Granular MMIO Sub-Register Mapping (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Expanded `MMIO_REGISTER_MAP` with sub-registers for Audio (`AI_LEN_REG`, `AI_STATUS_REG`, `AI_DACRATE_REG`, `AI_BITRATE_REG`), Video (`VI_ORIGIN_REG`, `VI_WIDTH_REG`, `VI_INTR_REG`), and Serial (`SI_PIF_ADDR_RD64B_REG`, `SI_STATUS_REG`) hardware interfaces.
   - Added immediate offset resolution in `analyzeAsmBody` to detect sub-registers accessed via non-zero offsets from base register pointers.
   - Added Unit Test 19 in `tools/test_c_stubber.js` validating sub-register resolution.
2. **Validation Layer Splat Config Failure Testing (`tools/test_validation_layer.py`):**
   - Added `setup_missing_splat_config()` and `teardown_missing_splat_config()` in `tools/test_validation_layer.py`.
   - Verified that `tools/verify_architecture.py` detects missing baseline configurations (`splat.yaml`) with code 1.
2. **Multi-Title Non-Matching Prefixes in C Stubber (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added configurable `nonmatchingsPrefix` support and `--nonmatchings-prefix` CLI option to `tools/c_stubber.js`.
   - Verified custom non-matching path routing in `#pragma GLOBAL_ASM` output via Test 18 in `tools/test_c_stubber.js`.
2. **Frontend UI Refinements & Formatting (`web/src/components/NetworkControl.tsx`):**
   - Cleaned up JSX formatting and handler indentation in `web/src/components/NetworkControl.tsx`.
   - Verified Next.js build compilation and Playwright E2E browser tests pass cleanly.
2. **Documentation Governance & README Consolidation (`README.md`):**
   - Cleaned up `README.md` into a production-ready architectural guide covering the full decompilation toolchain, 4-tier single-page web hypervisor frontend, system tray daemon management, and quickstart commands.
2. **Mario Party 4 GameCube Decompilation Scaffolding (`tools/generate_splat.py` & `splat.mp4.yaml`):**
   - Added `mp4` profile for Mario Party 4 with GameCube DOL memory configurations (`0x80003100` main DOL, `0x80200000` overlays).
   - Generated baseline `splat.mp4.yaml` and registered it in `tools/verify_architecture.py` and `Makefile`.
   - Expanded unit tests in `tools/test_generate_splat.py` to validate `mp4` configuration and auto-detection.
2. **CLI Dashboard Dynamic Cycling & Status Overrides (`tools/mparty_cli.py` & `tools/test_mparty_cli.py`):**
   - Added title profile cycling (`cycle_target_game`) in `tools/mparty_cli.py` to rotate between `mp1` -> `mp2` -> `mp3` -> `mp1`.
   - Enhanced `render_dashboard_header` with configurable service status parameter overrides (`decomp`, `web`, `netplay`).
   - Added Unit Tests in `tools/test_mparty_cli.py` (`test_cycle_target_game`, `test_render_dashboard_header_custom_statuses`).
2. **Toolchain Resolution & Pipeline Normalization (`tools/ai_matcher.py` & `tools/test_pipeline.py`):**
   - Replaced subshell toolchain binary checks (`os.system("which ...")`) in `tools/ai_matcher.py` with standard Python `shutil.which` for compiler (`mips-linux-gnu-gcc`), objcopy, and objdump resolution.
   - Cleaned up and normalized step numbering comments in `tools/test_pipeline.py` sequentially (Steps 1 through 11).
2. **COP0 Register Recognition & Subword MMIO Typing (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Implemented MIPS System Control Coprocessor 0 (COP0) register tracking (`Status`, `Cause`, `Count`, `Compare`, `EPC`, etc.) via `mfc0`/`mtc0` opcodes.
   - Added fine-grained subword pointer type inferencing (`u8*`, `s8*`, `u16*`, `s16*`) based on byte/halfword memory operations.
   - Added volatile pointer qualifiers (`volatile u32*`) when base pointer registers map to hardware MMIO address ranges.
   - Expanded unit tests in `tools/test_c_stubber.js` to 17 tests (all passing).
2. **Baseline Splat Configurations for Mario Party 1-3 (`splat.*.yaml` & `Makefile`):**
   - Generated baseline `splat.yaml`, `splat.mp1.yaml`, `splat.mp2.yaml`, and `splat.mp3.yaml` configurations targeting Mario Party 1, 2, and 3.
   - Added `splat-configs` target in `Makefile` to batch generate all splat configurations.
   - Registered splat configurations in `tools/verify_architecture.py`.
   - Added baseline configuration structure assertions in `tools/test_generate_splat.py`.
2. **Architecture Verification Expansion (`tools/verify_architecture.py` & `tools/test_validation_layer.py`):**
   - Expanded `tools/verify_architecture.py` assertions across all toolchain scripts (`ai_matcher.py`, `ai_loop.py`, `mparty_cli.py`), test harness suites (`test_ai_matcher.py`, `test_generate_splat.py`, `test_mparty_cli.py`, `test_pipeline.py`), and web directory scaffolding (`web`, `web/src`, `web/tests`).
   - Verified architecture and validation layer tests (5/5 tests passing).
2. **AI Matcher Assembly Normalization (`tools/ai_matcher.py` & `tools/test_ai_matcher.py`):**
   - Implemented `normalize_instruction` in `tools/ai_matcher.py` to strip variable addresses, hexadecimal opcode dumps, and comments from objdump disassembly output.
   - Enhanced `generate_assembly_diff` to highlight true MIPS instruction differences in LLM feedback loops.
   - Created `tools/test_ai_matcher.py` and integrated into `tools/test_pipeline.py`.
2. **Multi-Title Targeting in Centralized CLI (`tools/mparty_cli.py` & `tools/test_mparty_cli.py`):**
   - Added `--game` / `-g` option to `tools/mparty_cli.py` for targeting Mario Party 1, 2, or 3.
   - Added title-aware interactive dashboard header displaying active profile details.
   - Created `tools/test_mparty_cli.py` and integrated into `tools/test_pipeline.py`.
2. **Multi-Title Decompilation Target Selection (`DecompilationStatus.tsx` & `/api/ai`):**
   - Added game selector dropdown in `DecompilationStatus.tsx` supporting MP1, MP2, and MP3, updating function counts and build target names dynamically.
   - Connected `/api/ai` endpoint to pass the selected target game's nonmatching directory (`--nonmatchings-dir asm/nonmatchings/<game>`) to `ai_loop.py`.
   - Verified via Playwright tests in `web/tests/decompilation_status.spec.ts`.
2. **AI Loop Non-Matching Target Resolution (`tools/ai_loop.py` & `tools/test_ai_loop.py`):**
   - Implemented `locate_target_asm` and `locate_target_bin` in `tools/ai_loop.py` to recursively discover target assembly and expected binary files across modular `asm/nonmatchings/` and `build/expected/` directories.
   - Added `--nonmatchings-dir` CLI option.
2. **Modular Non-Matching Extraction & Granular Stubbing (`tools/disassemble.py` & `tools/c_stubber.js`):**
   - Enhanced `tools/disassemble.py` to recursively scan subdirectories under `asm/` and extract non-matching functions into `asm/nonmatchings/`.
   - Added `--process-nonmatchings` flag in `tools/c_stubber.js` for modular per-function stub generation.
2. **Multi-Title Splat Configurations for Mario Party 1-3 (`tools/generate_splat.py` & `tools/test_generate_splat.py`):**
   - Implemented title presets for Mario Party 1 (`mp1`), Mario Party 2 (`mp2`), and Mario Party 3 (`mp3`) configuring distinct asm, src, asset, and overlay segment paths.
   - Added `--game` / `-g` CLI option with automated filename detection fallback.
   - Created `tools/test_generate_splat.py` and integrated into `tools/test_pipeline.py`.
2. **Global Pointer Relocations & Symbol Access Tracking (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Parses `%gp_rel` relocations to recognize small data/BSS variables accessed via `$gp`.
   - Distinguishes and separates global data reads from global data writes across load/store instructions.
   - Emits annotated `Global Reads:` and `Global Writes:` listings in generated C function comments.
2. **Batch Processing Statistics & Report Generation (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Tracks summary statistics during directory-wide stubbing: processed files, total functions typed, skipped files, warnings, and errors.
   - Emits summary reports to stdout and serializes structured JSON to `build/stubber_report.json`.
2. **Stack Arguments & Unsigned Type Inference (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Detects stack-passed arguments beyond `$a3` (e.g. `s32 a4 /* from stack */` loaded from caller frames via `$sp`).
   - Infers unsigned integer types (`u32`) for return values and parameters from operations like `divu`, `multu`, `sltu`, `lbu`, `lhu`.
   - Adds robust error recovery for malformed/empty assembly blocks.
2. **Memory-Mapped I/O & Rodata Relocations (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Detects memory-mapped I/O (MMIO) register addresses (`0xA4000000`-`0xA4800000`) for N64 hardware interfaces (`SP`, `MI`, `VI`, `AI`, `PI`, `RI`, `SI`).
   - Parses `.rodata` symbol references and jump table target labels through `%hi` and `%lo` relocation pairs.
   - Annotates detected hardware MMIO registers and `.rodata` symbols in generated C function comments.
2. **Double-Precision Float & 64-Bit Integer Inferencing (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Distinguishes double-precision float parameters (`f64 f12`, `f64 f14`) from single-precision floats (`f32`) based on opcode suffixes (`.d`, `ldc1`, `sdc1`).
   - Supports 64-bit integer argument pair detection (`s64 a0`) across `$a0-$a1` when doubleword memory instructions (`ld`, `sd`) are present.
   - Annotates loop structures (`hasLoop`) tracking backward branching instructions (`bne`, `beq`, `bgez`) in generated C comments.
2. **Advanced Struct Offset Inferencing & Callee-Saved Registers (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Infers struct pointer parameters (`void* arg /* struct */`) when base registers show multiple distinct offset accesses.
   - Preserves and documents callee-saved registers (`$s0-$s7`, `$fp`) in generated C stub comments.
   - Detects boolean return semantics when registers are set via `slt`/`slti`/`sltu` instructions.
2. **Symbol Discovery & Prototype Header Generation (`tools/generate_splat.py` & `include/functions.h`):**
   - Automatically injects `non_matchings_path: asm/nonmatchings` configurations into `splat.yaml`.
   - Generates `include/functions.h` prototypes during splat config creation to support typed C stub compiling.
   - Asserted and cleaned up in `tools/test_pipeline.py`.
3. **Interactive Decompilation Pipeline UI & Stub Inspector (`web/src/components/DecompilationStatus.tsx`):**
   - Added interactive C stub inspector previewing generated typed C stubs and `#pragma GLOBAL_ASM` wrappers.
   - Added "Process Nonmatchings" button to trigger modular function extraction directly from the UI, updating metrics dynamically.
   - Added automated Playwright test suite `web/tests/decompilation_status.spec.ts`.
4. **End-to-End Disassembly & Intelligent Stubbing Pipeline (`tools/test_pipeline.py`):**
   - Wired live execution of `tools/disassemble.py`, `asm/nonmatchings/` modular function extraction, and typed C stub generation (`tools/c_stubber.js`) directly into the automated integration test pipeline.
   - Added automated execution of `node tools/test_c_stubber.js` inside `tools/test_pipeline.py`.
5. **Non-Matching Section Extraction & GLOBAL_ASM Stubs (`tools/disassemble.py` & `tools/c_stubber.js`):**
   - Automatically splits function definitions from unified assembly modules into modular files located in `asm/nonmatchings/<module>/<func>.s`.
   - Generates `#pragma GLOBAL_ASM` bindings inside C files wrapped in `#ifdef NON_MATCHING` blocks, preserving byte-matching parity for unfinished functions while allowing decompilation in progress.
6. **Multi-Candidate Scoring & Rule Caching (`tools/ai_loop.py` & `tools/test_ai_loop.py`):**
   - Implemented temperature stepping (`0.2`, `0.4`, `0.7`) across retry iterations.
   - Added diff penalty scoring (`calculate_diff_score`) to retain the best candidate and roll back if subsequent attempts diverge.
   - Implemented persistent caching of matched decompilation rules in `build/decomp_rules.json`.
7. **Consolidated 4-Tier Dashboard UI (`web/src/app/page.tsx`):**
   - Tier 1: Play & Connect (`GameSelector`, `NetworkControl`).
   - Tier 2: Progression & Hardware Subsystems (`SaveStateControl`, `InputDiagnostics`, `AudioEngineControl`).
   - Tier 3: Graphics Middleware & Optical Expansion (`GraphicsPipelineControl`, `ConsoleBridgeControl`).
   - Tier 4: Decompilation Studio & Assets (`DecompilationStatus`, `AssetGallery`).

### Verification Status
- `python3 tools/verify_architecture.py`: **PASS** (all 17 required files and 4 directories verified)
- `python3 tools/test_validation_layer.py`: **PASS** (5/5 tests pass)
- `python3 tools/test_pipeline.py`: **PASS** (all 11 integration steps: architecture, validation layers, AI loop, AI matcher, C stubber unit tests, multi-title splat tests, centralized CLI tests, prototype header assertions, and live mock disassembly/stubbing pass)
- `python3 tools/test_ai_matcher.py`: **PASS** (all 3 unit tests pass)
- `python3 tools/test_generate_splat.py`: **PASS** (all 3 multi-title test suites pass)
- `python3 tools/test_mparty_cli.py`: **PASS** (all 3 CLI test suites pass)
- `node tools/test_c_stubber.js`: **PASS** (all 15 pattern recognition, recursive non-matching stubbing, gp relocations, batch statistics, stack args, unsigned types, struct inference, float64, MMIO, and GLOBAL_ASM tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 7 tests pass)
- Next.js build & Playwright integration suites: **PASS**
