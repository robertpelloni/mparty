# TODO

## Short-term Tasks & Immediate Actions

- [x] Initialize Core Documentation (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
- [x] Create Python script (`tools/generate_splat.py`) for automated ROM splitting and generating `splat.yaml`.
- [x] Create Node/Python script (`tools/disassemble.py`) to orchestrate `spimdisasm` on split files.
- [x] Create Node script (`tools/c_stubber.js`) to generate matching `.c` stubs from `.s` assemblies.
- [x] Write a base `Makefile` for recompiling byte-matching ROMs.
- [x] Verify functionality of newly created tools via basic syntax checking and dry-runs.
- [x] Finalize initial repository structure with `HANDOFF.md` before concluding session.

## Current Session Tasks

- [x] Create `tools/verify_architecture.py`.
- [x] Create `tools/generate_advanced_mock_rom.py`.
- [x] Create `tools/test_pipeline.py`.
- [x] Create `tools/ai_matcher.py`.
- [x] Create `tools/ai_loop.py`.
- [x] Create `tools/mparty_cli.py`.

## Web Frontend Tasks

- [x] Setup Next.js frontend
- [x] Implement UI components
- [x] Implement Dashboard API
- [x] Configure Playwright tests

## Graphics & Asset Pipeline

- [x] Create `tools/texture_converter.py`.
- [x] Create `tools/model_extractor.py`.
- [x] Create `tools/audio_decoder.py`.
- [x] Create `tools/iso_extractor.py`.

## Engine Expansion

- [x] Expand `tools/iso_extractor.py` to parse GCZ format.
- [x] Create `web/src/lib/GameCubeEmulator.ts` for Dolphin WASM integration.

## Main Event Loop

- [x] Initialize the mparty event loop to handle incoming connections.

## Network Parsing

- [x] Expand the `mparty_cli.py` run loop to parse incoming network connection streams.