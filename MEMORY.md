# MEMORY

## Internal Architectural Observations
- **N64 Decompilation Philosophy**: Native porting to JS directly fails due to hardcoded memory mapping (`*(volatile u32*)0xBF000000`) and the synchronous nature of the N64 architecture conflicting with the asynchronous JS event loop.
- **Tools Focus**: Our immediate architectural focus must be creating tools to split and process standard N64 ROMs (`splat.yaml` configuration, `spimdisasm` integration).
- **Target Web Paradigm**: A unified web application must rely on a hypervisor structure (TypeScript managing a WASM-compiled C/C++ emulator core).

## Design Preferences
- Heavy commenting inside infrastructure scripts to explain the "why" and handle edge cases natively.
- Clean directory structures: separating `tools/` from target `src/`, `asm/`, and `assets/`.