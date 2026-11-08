# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.71.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **COP0 Register Recognition & Subword MMIO Typing (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
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
