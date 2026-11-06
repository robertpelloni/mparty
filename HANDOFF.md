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
- **Version:** v0.50.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Structured Assembly Diffing & AI Self-Correction Loop (`tools/ai_matcher.py` & `tools/ai_loop.py`):**
   - Added automated disassembly diffing (`generate_assembly_diff`, `--diff`, `--target-asm`) comparing compiled object code disassembly directly with expected target assembly.
   - Piped normalized instruction diffs into `tools/ai_loop.py` prompts, enabling iterative convergence to byte-matching output.
   - Added test coverage in `tools/test_ai_loop.py` asserting structured instruction diff diagnostics feedback.
2. **Intelligent C Stub Generation (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added MIPS assembly pattern recognition to extract function bodies, infer argument counts/types from registers (`$a0-$a3`, `$f12`, `$f14`), return types from `$v0` and `$f0`, and classify leaf vs non-leaf stack frames (`$sp` adjustment).
   - Added unit test suite `tools/test_c_stubber.js` ensuring accurate signature generation.
3. **Consolidated 4-Tier Dashboard UI (`web/src/app/page.tsx`):**
   - Tier 1: Play & Connect (`GameSelector`, `NetworkControl`).
   - Tier 2: Progression & Hardware Subsystems (`SaveStateControl`, `InputDiagnostics`, `AudioEngineControl`).
   - Tier 3: Graphics Middleware & Optical Expansion (`GraphicsPipelineControl`, `ConsoleBridgeControl`).
   - Tier 4: Decompilation Studio & Assets (`DecompilationStatus`, `AssetGallery`).
4. **System Tray Integration (`web/src/components/SystemTray.tsx`):**
   - Floating system tray in the bottom right monitoring background services (Next.js server, WebRTC netplay, AI matcher loop, Web Audio PCM stream) with safe server process shutdown and service restart controls.
5. **Subsystem Wiring & Controls:**
   - `AudioEngineControl.tsx`: Web Audio API PCM Float32 stream decoding and master gain control.
   - `InputDiagnostics.tsx`: Live Gamepad API polling with interactive button toggles and 32-bit packed bitmask display.
   - `GraphicsPipelineControl.tsx`: Fast3D microcode display list interception and 32-vertex cache monitor/flush.
   - `ConsoleBridgeControl.tsx`: Dolphin WASM ISO mounting and FST archive module extraction simulation.
   - `CliTerminalModal.tsx`: Embedded modal runner executing `tools/mparty_cli.py` routines.
6. **WebRTC DataChannel Streaming Resilience (`web/src/lib/NetplayManager.ts`):**
   - Direct WebRTC DataChannel packet transmission and reception (`sendDataPacket`, `onDataPacket`) to bypass HTTP streaming bottlenecks under high loads.

### Verification Status
- `python3 tools/verify_architecture.py`: **PASS**
- `python3 tools/test_pipeline.py`: **PASS** (all integration steps, validation layers, and AI loop tests pass)
- `node tools/test_c_stubber.js`: **PASS** (all 4 pattern recognition tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 5 tests pass)
- `cd web && npx playwright test`: **PASS** (all 31 E2E and unit tests pass)
