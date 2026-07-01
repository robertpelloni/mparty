# CHANGELOG

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