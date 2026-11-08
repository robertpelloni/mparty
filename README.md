# Mario Party Decompilation & Web Hypervisor Engine (`mparty`)

An automated reverse-engineering toolchain and browser emulation hypervisor designed to decompile, build, and run Nintendo 64 and GameCube titles (Mario Party series) in modern WebAssembly and TypeScript.

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                 Modern UI / Frontend (Next.js / TS)         |
|         - Consolidated Single-Page Dashboard                |
|         - Game Selection (N64 / GameCube / Wii)             |
|         - Universal Save State Manager (IndexedDB)          |
|         - WebRTC Rollback Netplay (GGPO-style)              |
|         - Floating System Tray Daemon & Server Controls     |
+-------------------------------------------------------------+
                              |
         +--------------------+--------------------+
         |                                         |
         v                                         v
+------------------------+                +------------------------+
|   N64 WASM Core        |                |  GameCube/Wii WASM     |
|   (Fast3D WebGL Bridge)|                |  (Dolphin WASM Core)   |
+------------------------+                +------------------------+
         |                                         |
         v                                         v
 [Mario Party 1-3 ROMs]                   [Mario Party 4-9 ISOs]
```

### Core Components

1. **Decompilation & Disassembly Toolchain (`tools/`)**:
   - `tools/generate_splat.py`: Multi-title ROM splitting configuration generator (`splat.yaml`, `splat.mp1.yaml`, `splat.mp2.yaml`, `splat.mp3.yaml`, `splat.mp4.yaml`) with entry-point auto-discovery and prototype header generation (`include/functions.h`).
   - `tools/disassemble.py`: Splits N64/GameCube ROM segments and extracts modular non-matching functions into `asm/nonmatchings/<module>/<func>.s`.
   - `tools/c_stubber.js`: MIPS assembly pattern analyzer extracting typed C signatures, argument registers (`$a0-$a3`, `$f12`, `$f14`), stack parameters (`/* from stack */`), unsigned types (`u32`), subword pointers (`u8*`, `s8*`, `u16*`, `s16*`), volatile MMIO registers (`SP`, `MI`, `VI`, `AI`, `PI`, `RI`, `SI`), and COP0 coprocessor registers (`Status`, `Cause`, `Count`, `Compare`, `EPC`), guarded by `#pragma GLOBAL_ASM` fallbacks.
   - `tools/ai_matcher.py`: Compiles C code via `mips-linux-gnu-gcc` and extracts `.text` sections to compare SHA-256 hashes against target MIPS binaries, generating normalized assembly diffs for LLM prompt feedback.
   - `tools/ai_loop.py`: Continuous automated decompilation loop with multi-step iterative LLM self-correction, temperature stepping (`0.2`, `0.4`, `0.7`), candidate diff scoring, and rule caching in `build/decomp_rules.json`.
   - `tools/mparty_cli.py`: Centralized orchestrator unifying test execution, continuous AI loops, dev server, and terminal dashboard with title cycling (`cycle_target_game`).

2. **Web Hypervisor & Frontend (`web/`)**:
   - Next.js 14 (App Router, TypeScript, Tailwind CSS).
   - Single-page consolidated dashboard organized into 4 user-value tiers:
     - **Tier 1: Play & Connect**: `GameSelector`, `NetworkControl` (WebRTC GGPO-style rollback netplay).
     - **Tier 2: Progression & Subsystems**: `SaveStateControl` (cross-gen IndexedDB snapshots), `InputDiagnostics` (clamped 32-bit packed bitmasks), `AudioEngineControl` (raw PCM stream decoding via Web Audio API).
     - **Tier 3: Graphics Middleware & Optical Expansion**: `GraphicsPipelineControl` (Fast3D to WebGL microcode translation layer), `ConsoleBridgeControl` (Dolphin WASM GameCube/Wii ISO mounting).
     - **Tier 4: Decompilation Studio & Assets**: `DecompilationStatus` (live multi-title target selector, non-matching splitter, interactive C stub previewer), `AssetGallery` (Three.js 3D viewer & cached textures).
   - `SystemTray.tsx`: Persistent floating tray monitoring server daemons with one-click "Quit Servers" and "Restart All".

---

## Quickstart & Commands

### Prerequisites
- Python 3.10+
- Node.js 22 LTS
- (Optional for matching) `mips-linux-gnu-gcc`, `mips-linux-gnu-objcopy`, `mips-linux-gnu-objdump`

### Build Splat Configurations
```bash
make splat-configs
```

### Run Integration Test Pipeline
```bash
python3 tools/test_pipeline.py
```

### Run Python Unit Tests
```bash
python3 -m unittest discover -s tools
```

### Run Web Frontend & E2E Tests
```bash
cd web
npm install
npm run dev
npx playwright test
```

### Centralized CLI
```bash
# Run integration tests
python3 tools/mparty_cli.py test

# Launch terminal dashboard
python3 tools/mparty_cli.py dashboard --game mp1

# Start AI decompilation loop
python3 tools/mparty_cli.py loop --game mp1
```

---

## License & Governance
Documentation and architectural milestones are tracked under `VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, and `VERSION.md`.
