# CHANGELOG

## [0.13.0]
### Changed
- Redesigned and reorganized the Next.js dashboard UI to intuitively group and prioritize high-value features.

## [0.12.0]
### Added
- Wired WebRTC Netplay logic (`hostGame`, `joinGame`) to the `NetworkControl` dashboard component.

## [0.11.0]
### Added
- Implemented `exportSave()` and `importSave()` in `web/src/lib/SaveStateManager.ts` and wired to dashboard UI for universal cross-game state persistence.

## [0.10.0]
### Added
- Hardened `tools/generate_splat.py` with N64 header validation mocks.
- Made `tools/disassemble.py` robust against missing `splat64` dependencies.

## [0.9.0]
### Added
- Added GitHub Actions CI pipeline to automate Python and Playwright testing.

## [0.8.0]
### Added
- Expanded `run` command in `tools/mparty_cli.py` to dispatch data payloads over WebSockets.
- Connected `web/src/lib/NetplayManager.ts` to mock WebSocket stream reception.

## [0.7.0]
### Added
- Expanded `run` command in `tools/mparty_cli.py` to parse mock incoming network connection streams.

## [0.6.0]
### Added
- Added `run` command to `tools/mparty_cli.py` to initialize the mparty event loop and mock socket handling.

## [0.5.0]
### Added
- Added `web/src/lib/GameCubeEmulator.ts` for Dolphin WASM integration.
- Expanded `tools/iso_extractor.py` to support GCZ parsing mocks.

## [0.4.0]
### Added
- Added `tools/texture_converter.py`, `tools/model_extractor.py`, `tools/audio_decoder.py`, and `tools/iso_extractor.py` as scaffolding scripts for the asset extraction pipeline.

## [0.3.0]
### Added
- Integrated Next.js frontend dashboard with Playwright testing.
- Created mock manager classes for Emulation, Audio, Netplay, and Input.

## [0.2.0]
### Added
- Added `tools/verify_architecture.py` to strictly check for core project structure.
- Added `tools/generate_advanced_mock_rom.py` to dynamically construct valid MIPS N64 `.z64` testing artifacts to bypass legal storage constraints.
- Added `tools/test_pipeline.py` to automate integration testing of the decompilation toolchain.
- Added `tools/ai_matcher.py` to compile and binary-diff C files against target MIPS object code using `mips-linux-gnu-gcc`.
- Added `tools/ai_loop.py` to recursively iterate, match, and invoke an external LLM API for automated decompilation refactoring.
- Added `tools/mparty_cli.py` as a centralized command-line interface orchestrator for running testing, looping, and dev environments.

## [0.1.0] - 2026-06-26
### Added
- Initialized core documentation structure according to system directives (`VISION.md`, `ROADMAP.md`, `TODO.md`, `MEMORY.md`, `DEPLOY.md`, `IDEAS.md`, `CHANGELOG.md`, `VERSION.md`).
- Prepared directory for `tools/` implementation for ROM splitting and decompilation orchestration.