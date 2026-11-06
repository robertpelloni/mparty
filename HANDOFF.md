# HANDOFF

## Session Summary & Context Handoff

### Project Overview
The `mparty` repository is an automated pipeline and web hypervisor designed to decompile, build, and emulate N64 / GameCube games (specifically Mario Party) directly in the browser via WebAssembly, modern TypeScript, and Three.js.

### Current Version
- **Version:** v0.49.0 (tracked in `VERSION.md`)

### Recent Milestones & Changes
1. **Consolidated 4-Tier Dashboard UI (`web/src/app/page.tsx`):**
   - Tier 1: Play & Connect (`GameSelector`, `NetworkControl`).
   - Tier 2: Progression & Hardware Subsystems (`SaveStateControl`, `InputDiagnostics`, `AudioEngineControl`).
   - Tier 3: Graphics Middleware & Optical Expansion (`GraphicsPipelineControl`, `ConsoleBridgeControl`).
   - Tier 4: Decompilation Studio & Assets (`DecompilationStatus`, `AssetGallery`).
2. **System Tray Integration (`web/src/components/SystemTray.tsx`):**
   - Floating system tray in the bottom right monitoring background services (Next.js server, WebRTC netplay, AI matcher loop, Web Audio PCM stream) with safe server process shutdown and service restart controls.
3. **Subsystem Wiring & Controls:**
   - `AudioEngineControl.tsx`: Web Audio API PCM Float32 stream decoding and master gain control.
   - `InputDiagnostics.tsx`: Live Gamepad API polling with interactive button toggles and 32-bit packed bitmask display.
   - `GraphicsPipelineControl.tsx`: Fast3D microcode display list interception and 32-vertex cache monitor/flush.
   - `ConsoleBridgeControl.tsx`: Dolphin WASM ISO mounting and FST archive module extraction simulation.
   - `CliTerminalModal.tsx`: Embedded modal runner executing `tools/mparty_cli.py` routines.
4. **Intelligent C Stub Generation (`tools/c_stubber.js` & `tools/test_c_stubber.js`):**
   - Added MIPS assembly pattern recognition to extract function bodies, infer argument counts/types from registers (`$a0-$a3`, `$f12`, `$f14`), return types from `$v0` and `$f0`, and classify leaf vs non-leaf stack frames (`$sp` adjustment).
   - Added unit test suite `tools/test_c_stubber.js` ensuring accurate signature generation.
5. **AI Loop Multi-Step Iterative Self-Correction (`tools/ai_loop.py` & `tools/test_ai_loop.py`):**
   - Iterative feedback loop feeding compilation and binary-diff diagnostics directly back into subsequent LLM prompts up to configurable `--max-retries`.
6. **WebRTC DataChannel Streaming Resilience (`web/src/lib/NetplayManager.ts`):**
   - Direct WebRTC DataChannel packet transmission and reception (`sendDataPacket`, `onDataPacket`) to bypass HTTP streaming bottlenecks under high loads.

### Verification Status
- `python3 tools/verify_architecture.py`: **PASS**
- `python3 tools/test_pipeline.py`: **PASS** (all integration steps, validation layers, and AI loop tests pass)
- `node tools/test_c_stubber.js`: **PASS** (all 4 pattern recognition tests pass)
- `tools/test_ai_loop.py`: **PASS** (all 4 tests pass)
- `cd web && npx playwright test`: **PASS** (all 31 E2E and unit tests pass)
