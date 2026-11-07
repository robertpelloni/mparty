# Session Handoff & Memory

## Summary of Accomplishments (Phase 1)
All foundational scaffolding for the Mario Party WebEngine has been completed.
- Python tools are built for splitting (`splat64`), disassembling (`spimdisasm`), and C stub generation.
- An autonomous AI matching loop (`ai_loop.py` & `ai_matcher.py`) has been written and successfully test-driven against mock N64 ROMs.
- The `test_pipeline.py` ensures CI validation without relying on tracked binaries.
- The Web frontend (Next.js/TypeScript) is fully structured. Emscripten WASM cores (`EmulationCore.ts`) connect to browser APIs via `InputManager.ts` (Keyboard/Gamepad -> 32-bit packets), `AudioManager.ts` (PCM float streams), and `Fast3DTranslator.ts` (N64 microcode -> WebGL).
- "Aggressive Ideas" from `IDEAS.md` have been fulfilled:
  - Added `AssetViewer.tsx` (using `@react-three/fiber`) to render extracted 3D models.
  - Upgraded `SaveStateManager.ts` to support universal JSON schemas for cross-generation save data transfers.
  - Upgraded `NetplayManager.ts` to support mock rollback netcode states and frames.

## Blockers
Phase 2 (Live Decompilation) cannot begin until an actual target ROM is provided.

### Current Version
- **Version:** v0.60.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Stack Arguments & Unsigned Type Inference (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Detects stack-passed arguments beyond `$a3` (e.g. `s32 a4 /* from stack */` loaded from caller frames via `$sp`).
   - Infers unsigned integer types (`u32`) for return values and parameters from operations like `divu`, `multu`, `sltu`, `lbu`, `lhu`.
   - Adds robust error recovery for malformed/empty assembly blocks.
   - Verified by unit tests in `tools/test_c_stubber.js` (12/12 tests passing).
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
- `python3 tools/verify_architecture.py`: **PASS**
- `python3 tools/test_pipeline.py`: **PASS** (all 8 integration steps, validation layers, AI loop, C stubber unit tests, prototype header assertions, and live mock disassembly/stubbing pass)
- `node tools/test_c_stubber.js`: **PASS** (all 12 pattern recognition, stack args, unsigned types, struct inference, float64, MMIO, and GLOBAL_ASM tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 6 tests pass)
- `cd web && npx playwright test`: **PASS** (all 32 E2E and unit tests pass)
