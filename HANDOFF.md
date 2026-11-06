# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.51.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Multi-Candidate Scoring & Rule Caching (`tools/ai_loop.py` & `tools/test_ai_loop.py`):**
   - Implemented temperature stepping (`0.2`, `0.4`, `0.7`) across retry iterations.
   - Added diff penalty scoring (`calculate_diff_score`) to retain the best candidate and roll back if subsequent attempts diverge.
   - Implemented persistent caching of matched decompilation rules and parameters in `build/decomp_rules.json`.
   - Added test coverage in `tools/test_ai_loop.py` ensuring rules are saved and validated.
2. **Structured Assembly Diffing & AI Self-Correction Loop (`tools/ai_matcher.py` & `tools/ai_loop.py`):**
   - Added automated disassembly diffing (`generate_assembly_diff`, `--diff`, `--target-asm`) comparing compiled object code disassembly directly with expected target assembly.
   - Piped normalized instruction diffs into `tools/ai_loop.py` prompts, enabling iterative convergence to byte-matching output.
3. **Intelligent C Stub Generation (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added MIPS assembly pattern recognition to extract function bodies, infer argument counts/types from registers (`$a0-$a3`, `$f12`, `$f14`), return types from `$v0` and `$f0`, and classify leaf vs non-leaf stack frames (`$sp` adjustment).
4. **Consolidated 4-Tier Dashboard UI (`web/src/app/page.tsx`):**
   - Tier 1: Play & Connect (`GameSelector`, `NetworkControl`).
   - Tier 2: Progression & Hardware Subsystems (`SaveStateControl`, `InputDiagnostics`, `AudioEngineControl`).
   - Tier 3: Graphics Middleware & Optical Expansion (`GraphicsPipelineControl`, `ConsoleBridgeControl`).
   - Tier 4: Decompilation Studio & Assets (`DecompilationStatus`, `AssetGallery`).
5. **System Tray Integration (`web/src/components/SystemTray.tsx`):**
   - Floating system tray in the bottom right monitoring background services with safe server process shutdown and service restart controls.
6. **WebRTC DataChannel Streaming Resilience (`web/src/lib/NetplayManager.ts`):**
   - Direct WebRTC DataChannel packet transmission and reception (`sendDataPacket`, `onDataPacket`) to bypass HTTP streaming bottlenecks under high loads.

### Verification Status
- `python3 tools/verify_architecture.py`: **PASS**
- `python3 tools/test_pipeline.py`: **PASS** (all integration steps, validation layers, and AI loop tests pass)
- `node tools/test_c_stubber.js`: **PASS** (all 4 pattern recognition tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 6 tests pass)
- `cd web && npx playwright test`: **PASS** (all 31 E2E and unit tests pass)
