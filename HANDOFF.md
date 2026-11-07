# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.56.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Symbol Discovery & Prototype Header Generation (`tools/generate_splat.py` & `include/functions.h`):**
   - Automatically injects `non_matchings_path: asm/nonmatchings` configurations into `splat.yaml`.
   - Generates `include/functions.h` prototypes during splat config creation to support typed C stub compiling.
   - Asserted and cleaned up in `tools/test_pipeline.py`.
2. **Interactive Decompilation Pipeline UI & Stub Inspector (`web/src/components/DecompilationStatus.tsx`):**
   - Added interactive C stub inspector previewing generated typed C stubs and `#pragma GLOBAL_ASM` wrappers.
   - Added "Process Nonmatchings" button to trigger modular function extraction directly from the UI, updating metrics dynamically.
   - Added automated Playwright test suite `web/tests/decompilation_status.spec.ts`.
3. **End-to-End Disassembly & Intelligent Stubbing Pipeline (`tools/test_pipeline.py`):**
   - Wired live execution of `tools/disassemble.py`, `asm/nonmatchings/` modular function extraction, and typed C stub generation (`tools/c_stubber.js`) directly into the automated integration test pipeline.
   - Added automated execution of `node tools/test_c_stubber.js` inside `tools/test_pipeline.py`.
4. **Non-Matching Section Extraction & GLOBAL_ASM Stubs (`tools/disassemble.py` & `tools/c_stubber.js`):**
   - Automatically splits function definitions from unified assembly modules into modular files located in `asm/nonmatchings/<module>/<func>.s`.
   - Generates `#pragma GLOBAL_ASM` bindings inside C files wrapped in `#ifdef NON_MATCHING` blocks, preserving byte-matching parity for unfinished functions while allowing decompilation in progress.
5. **Advanced C Stubber Heuristics & Control Flow (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Differentiated load vs store register operands to preserve argument detection on stores (`sw $a0, ...`).
   - Inferred pointer parameter types (`void*`) based on indexed memory dereferences.
   - Added support for 64-bit integer (`s64`) and floating point (`f64`) returns.
   - Added indirect jump table switch statement detection (`jr $tX`).
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
- `node tools/test_c_stubber.js`: **PASS** (all 7 pattern recognition & GLOBAL_ASM tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 6 tests pass)
- `cd web && npx playwright test`: **PASS** (all 32 E2E and unit tests pass)
