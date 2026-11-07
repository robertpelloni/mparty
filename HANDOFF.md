# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.55.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Interactive Decompilation Pipeline UI & Stub Inspector (`web/src/components/DecompilationStatus.tsx`):**
   - Added interactive C stub inspector previewing generated typed C stubs and `#pragma GLOBAL_ASM` wrappers.
   - Added "Process Nonmatchings" button to trigger modular function extraction directly from the UI, updating metrics dynamically.
   - Added automated Playwright test suite `web/tests/decompilation_status.spec.ts`.
2. **End-to-End Disassembly & Intelligent Stubbing Pipeline (`tools/test_pipeline.py`):**
   - Wired live execution of `tools/disassemble.py`, `asm/nonmatchings/` modular function extraction, and typed C stub generation (`tools/c_stubber.js`) directly into the automated integration test pipeline.
   - Added automated execution of `node tools/test_c_stubber.js` inside `tools/test_pipeline.py`.
3. **Non-Matching Section Extraction & GLOBAL_ASM Stubs (`tools/disassemble.py` & `tools/c_stubber.js`):**
   - Automatically splits function definitions from unified assembly modules into modular files located in `asm/nonmatchings/<module>/<func>.s`.
   - Generates `#pragma GLOBAL_ASM` bindings inside C files wrapped in `#ifdef NON_MATCHING` blocks, preserving byte-matching parity for unfinished functions while allowing decompilation in progress.
   - Verified by unit tests in `tools/test_c_stubber.js` (7/7 tests passing).
4. **Advanced C Stubber Heuristics & Control Flow (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Differentiated load vs store register operands to preserve argument detection on stores (`sw $a0, ...`).
   - Inferred pointer parameter types (`void*`) based on indexed memory dereferences.
   - Added support for 64-bit integer (`s64`) and floating point (`f64`) returns.
   - Added indirect jump table switch statement detection (`jr $tX`).
5. **Multi-Candidate Scoring & Rule Caching (`tools/ai_loop.py` & `tools/test_ai_loop.py`):**
   - Implemented temperature stepping (`0.2`, `0.4`, `0.7`) across retry iterations.
   - Added diff penalty scoring (`calculate_diff_score`) to retain the best candidate and roll back if subsequent attempts diverge.
   - Implemented persistent caching of matched decompilation rules in `build/decomp_rules.json`.
6. **Structured Assembly Diffing & AI Self-Correction Loop (`tools/ai_matcher.py` & `tools/ai_loop.py`):**
   - Added automated disassembly diffing (`generate_assembly_diff`, `--diff`, `--target-asm`) comparing compiled object code disassembly directly with expected target assembly.
   - Piped normalized instruction diffs into `tools/ai_loop.py` prompts, enabling iterative convergence to byte-matching output.
7. **Consolidated 4-Tier Dashboard UI (`web/src/app/page.tsx`):**
   - Tier 1: Play & Connect (`GameSelector`, `NetworkControl`).
   - Tier 2: Progression & Hardware Subsystems (`SaveStateControl`, `InputDiagnostics`, `AudioEngineControl`).
   - Tier 3: Graphics Middleware & Optical Expansion (`GraphicsPipelineControl`, `ConsoleBridgeControl`).
   - Tier 4: Decompilation Studio & Assets (`DecompilationStatus`, `AssetGallery`).
8. **System Tray Integration (`web/src/components/SystemTray.tsx`):**
   - Floating system tray in the bottom right monitoring background services with safe server process shutdown and service restart controls.

### Verification Status
- `python3 tools/verify_architecture.py`: **PASS**
- `python3 tools/test_pipeline.py`: **PASS** (all 8 integration steps, validation layers, AI loop, C stubber unit tests, and live mock disassembly/stubbing pass)
- `node tools/test_c_stubber.js`: **PASS** (all 7 pattern recognition & GLOBAL_ASM tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 6 tests pass)
- `cd web && npx playwright test`: **PASS** (all 32 E2E and unit tests pass)
