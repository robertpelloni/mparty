# mparty

Scaffolding for an automated decompilation pipeline, aimed first at the
N64 Mario Party games. The original ambition (preserved in the transcript
that used to be this README) was: decompile every Mario Party version,
translate the merged result to TypeScript, and make every version
selectable in a browser app. The project's own `VISION.md` records the
pivot to the realistic version of that idea: decompilation tooling for the
ROMs plus, eventually, WASM emulator cores (Mupen64Plus/Dolphin via
Emscripten) wrapped in a TypeScript frontend. Neither the decompiled games
nor the web app exist.

## What is here (v0.1.0 scaffolding, one day of work, 2026-06-27)

- `tools/generate_splat.py` — generate a `splat.yaml` config from an N64
  ROM structure
- `tools/disassemble.py` — drive `splat`/`spimdisasm` to split a ROM into
  structured `asm/` + `src/` directories
- `tools/c_stubber.js` — parse MIPS assembly for `glabel` function labels
  and emit blank C stubs for matching work
- `Makefile` — the matching-build loop: compile `src/` + `asm/` with
  `mips-linux-gnu-gcc` and link toward a byte-identical `target_rom.z64`
- The standard doc set (`VISION.md`, `ROADMAP.md`, `TODO.md`, `HANDOFF.md`)

Per `HANDOFF.md`, the tools were validated by syntax checks and a dry-run
stub creation only. No ROM has been run through the pipeline in this repo
(no ROMs are — or could legally be — included), no function has been
matched, and the AI iteration loop for byte-matching C functions is a
listed next step, not an implementation.

## The transcript

The old README was the raw chat that produced this repo, including the
assistant's "brutally honest" explanation of why one-shot LLM decompilation
of the whole franchise is impossible (per-console toolchains, context
limits, proprietary asset formats) and the prompt templates for using an
LLM on isolated functions instead. It's preserved in git history and is
genuinely the best design document the project has.

## Status

Dormant after its single scaffolding day (merged Jules PR, 2026-06-27).
A starting skeleton for N64 decomp work — comparable in spirit to the
community's multi-year manual Mario Party decompilation efforts, at the
opposite end of the completeness scale.
