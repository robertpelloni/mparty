# mparty

Decompilation tooling for Mario Party (Nintendo 64, MIPS): a
splat-based pipeline that splits a ROM into sections, disassembles it,
and generates C stubs and prototype headers for matching decompilation,
with a web UI for inspecting the results. The long-term ambition is a
browser-playable version; what exists today is the tooling, not a game.

**Version:** 0.60.0

## What's in it

- **Pipeline** — `splat.yaml` + `Makefile` (splat ROM splitting),
  `tools/disassemble.py`, `tools/generate_splat.py`,
  `tools/mparty_cli.py`
- **C stub generator** — `tools/c_stubber.js` (~19 KB): generates C
  stubs from disassembly, with MMIO memory mapping, rodata
  relocations, stack arguments, unsigned types, f64/s64 argument
  handling, struct-offset inference, and callee-saved register
  tracking (v0.55–v0.60)
- **AI-assisted matching** — `tools/ai_loop.py`, `tools/ai_matcher.py`
  — LLM-assisted function matching loop
- **Mock ROM testing** — `tools/mock_rom.py`,
  `tools/generate_advanced_mock_rom.py`, `mock_mario_party.ld` — the
  pipeline is tested against a synthetic mock ROM, not a real game
  dump; no ROM is included in this repo
- **Web UI** (`web/`) — Next.js app: interactive C stub inspector and
  non-matching controls
- **Extractors (stubs)** — `tools/iso_extractor.py`,
  `tools/model_extractor.py`, `tools/texture_converter.py`,
  `tools/audio_decoder.py` — small placeholder scripts, not finished
  tooling
- **Tests** — `tools/test_pipeline.py`, `test_c_stubber.js`,
  `test_ai_loop.py`, `test_validation_layer.py`

## Status

Active tooling development through November 2026 (last commit
2026-11-07). Honest scope: this is a decompilation *workbench* for one
N64 title. No game is playable from this repo, no ROM is provided,
and the multi-version browser port described in the project's early
planning notes is not what this code does — merging every Mario Party
version (MIPS, PowerPC, ARM, ARM64) into one web app remains a
concept, not an implemented system.
