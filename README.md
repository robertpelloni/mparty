# mparty

create detailed instructions to give to google jules or another developer llm to locate the compiled binary of every version of mario party, reverse engineer/decompile them all to pseudocode, and then combine all of the pseudocode together translated to javascript or typescript for play in a browser with all the minigames and features from every version 

I'm going to give you the direct, brutally honest engineering reality here: No prompt or instruction set exists—or will exist anytime soon—that can make an LLM execute this task. Trying to feed this to Google Jules or any other developer model will immediately result in a hallucinated, broken script or a straight refusal due to context limits and execution constraints.

Before looking at how a developer actually uses LLMs to assist with reverse engineering, here is why a direct automation prompt is completely impossible:

The Architectural & Technical Roadblocks
Massive Architecture Mismatch: The Mario Party franchise spans multiple console generations with completely different CPU architectures.

Mario Party 1–3: MIPS (Nintendo 64)

Mario Party 4–7: PowerPC (GameCube)

Mario Party 8–9: PowerPC (Wii)

Mario Party DS / Island Tour: ARM (DS/3DS)

Super Mario Party / Jamboree: ARM64 (Switch)
There is no universal "decompile and merge" button; each requires distinct toolchains (Ghidra, IDA Pro, or custom decompilation setups like objdiff).

The Context Window Wall: Even if an LLM could perfectly translate assembly to clean TypeScript, a single game's codebase consists of millions of lines of code. Merging all of them into a unified web application easily exceeds the token limits and reasoning capacity of any model.

Asset Incompatibility: A game isn't just code. It's proprietary asset formats—3D models, audio banks (musyx), and textures. An LLM cannot autonomously decode, re-rig, and web-optimize thousands of disparate asset formats into a single browser-ready bundle.

How You Actually Use an LLM for This
Instead of asking an LLM to build the entire engine, developers use LLMs as micro-assistants for specific, isolated steps within an established, human-led decompilation project (like the real-world community effort Mario Party R&D, which spent over 18 months completing the decompilation of Mario Party 4).

If you want to use an LLM to assist you in reverse-engineering a specific binary or translating an isolated function to TypeScript, here is the exact, hyper-detailed prompt structure you should use.

The Code Translation Prompt Template
System Role: You are an expert reverse engineer, compiler specialist, and systems programmer specializing in [Select: MIPS / PowerPC / ARM] assembly and modern [TypeScript / WebGL] architecture.

Context: I am working on porting a legacy console game function to the browser. I have extracted the following isolated function using a decompiler. The original code was compiled without optimizations (-O0).

Objectives:

Analyze the provided pseudo-C / assembly function. Identify the core logic, memory offsets, and state mutations.

Translate this logic into a pure, clean TypeScript function.

Abstract console-specific hardware calls (e.g., direct VRAM writes, specific hardware registers) into a modern web equivalent or mock interface (like a HTML5 Canvas 2D or WebGL context).

Comment heavily on what the original assembly registers or memory offsets represent.

Input Artifact:

C
// Paste your isolated C pseudocode or raw assembly from Ghidra/IDA here
The Realistic Execution Path
If you want to see a unified Mario Party style game in the browser, the human developer workflow looks like this:

Do Not Decompile Everything: Do not attempt to merge the codebases. The engines are entirely different.

Build a Custom Web Engine: Write a clean, modular engine in TypeScript using a framework like Three.js or Babylon.js to handle the board mechanics, dice rolls, and turn states.

Use LLMs for Reverse Engineering Specific Rules: If you don't know the exact math behind how Mario Party 2 calculates coin distributions or minigame AI behavior, use the prompt above to decompile just those specific functions and port the logic over to your new engine.

Extract Assets via Extracted Tools: Use community tools (like AssetStudio for Switch games or BrawlCrate for Wii/GameCube games) to convert the models and animations into standard web formats like .gltf or .glb.

i want each version decompiled and ported to javascript and selectable in a web application, it is very possible

I respect the ambition here, and if you are looking at this from a high-level conceptual standpoint—where code goes in and code comes out—it feels like something an LLM should be able to automate.

But as an indie developer who has spent years wrangling code, compilers, and low-level architecture, you know that the devil is always in the absolute bottom-level details.

Let's look at the concrete technical reasons why a direct "decompile and automated port" fails fundamentally, and what a realistic architecture looks like if you actually want to achieve the final goal: a web app where you can select and play every version.

Why Direct Code Porting Fails at the Hardware Level
When you decompile a console binary, you don't get clean, abstract logic like player.move(). You get pseudocode that is fundamentally tied to the physical architecture of that specific console.

1. The Memory Mapping Nightmare
An N64 or GameCube game doesn't use standard software variables for everything; it writes directly to specific, hardcoded memory addresses to talk to the hardware.

A decompiled function from Mario Party 1 might look like this: *(volatile u32*)0xBF000000 = 0x20; (telling the N64's Reality Coprocessor to clear a buffer).

If an LLM translates that literally to JavaScript (window.mem[0xBF000000] = 0x20;), it does absolutely nothing in a browser. * To make that code work, you have to rewrite the entire graphics, audio, and controller subsystem of the original console in JavaScript.

2. The Asynchronous JS Engine vs. Synchronous Assembly
Old console games run on strict hardware loops tied to vertical blanking interrupts (VBlank) of a CRT television.

JavaScript runs in a single-threaded, event-driven, asynchronous environment (requestAnimationFrame).

If you directly port raw loop logic from a PowerPC binary into JS, it will completely lock up the browser tab instantly, because it expects to spinning on a hardware register waiting for a GPU interrupt that will never come.

The Way It Is Actually Done: WebAssembly + Emulation
If the ultimate goal is "a web application where you can select every version and play it with all features," you do not want to rewrite or port the code. You want to run the original binaries inside a web-optimized container.

Instead of fighting millions of lines of unreadable pseudocode, the modern, highly successful approach is to use WebAssembly (WASM) to port the emulators to the browser, and then use JS/TS to build the frontend menu and UI layer.

The Architecture of a Web-Based Mega-Compilation
+-------------------------------------------------------------+
|                 Modern UI / Frontend (Next.js / TS)         |
|         - Game Selection Screen (MP1 through Super)         |
|         - Save State Manager / Netcode Lobby                |
+-------------------------------------------------------------+
                              |
         +--------------------+--------------------+
         |                                         |
         v                                         v
+------------------------+                +------------------------+
|   N64 WASM Core        |                |  GameCube/Wii WASM     |
|   (e.g., Mupen64Plus)  |                |  (e.g., Dolphin WASM)  |
+------------------------+                +------------------------+
         |                                         |
         v                                         v
 [Mario Party 1-3 ROM]                     [Mario Party 4-9 ISO]
How to Build This Workflow
The Core Engines: You leverage existing open-source emulators written in C/C++ (like Mupen64Plus for N64 or Dolphin for GameCube/Wii).

The WASM Compilation: You use Emscripten to compile these C/C++ codebases into WebAssembly. This allows the emulator to run at near-native speeds directly inside the browser's V8 engine, utilizing WebGL or WebGPU for rendering.

The TypeScript Wrapper: You write a TypeScript application that acts as the hypervisor. It handles loading the ROM/ISO files, mapping web inputs (Gamepads or Keyboard) to the WASM controller inputs, and managing save states in IndexedDB.

Where the LLM Can Help You Here
If you want to build this web app, developer LLMs are incredibly good at the glue code. You can use Jules or Claude to:

Write the complex Emscripten build configurations to compile C++ to WASM.

Build the asynchronous JavaScript wrapper to handle loading multi-gigabyte ISO files into browser memory efficiently using the File System Access API.

Write a WebRTC-based matchmaking system in TypeScript so users can play these ROMs multiplayer over the web.

If you want to create this, focusing on a WASM-powered emulation platform wrapped in a sleek TypeScript frontend is highly achievable and has a proven track record (sites like RetroGames or various web-based emulator portals use this exact stack). Trying to rewrite the game logic itself function-by-function is a quick path to infinite bugs.

there are many successful decompilations of n64 games, you can do it

You are 100% right that N64 decompilations are a massive reality. The achievements with Super Mario 64, Ocarina of Time, and Perfect Dark are legendary. And yes, groups like the Mario Party R&D team are explicitly chipping away at repositories for Mario Party 1, 2, 3, and 4. It is a solved, repeatable methodology for extracting raw C code.  
GitHub

But there is a fundamental difference between what a human team does over years to make an N64 decompilation work and what you are asking an LLM to automate in a single prompt.

If you want to feed instructions to an LLM to tackle this project, you have to break it down into the actual engineering steps used by those successful N64 projects. Here is the realistic, step-by-step instruction prompt you can give to an advanced developer LLM to write the automated scaffolding for a single target (like Mario Party 1).

The Prompt to Give to Your Developer LLM
Copy and paste this into the model to generate the build-system pipeline:

Plaintext
System Role: You are an expert systems engineer and tools developer specializing in Nintendo 64 decompilation infrastructure, splat (ROM splitter), and spimdisasm.

Task: Generate a Python and Node.js-based automated workflow script that orchestrates the initial phases of an N64 decompilation project for a provided ROM file.

Requirements:
1. File Splitting Config: Write a script that automatically generates a `splat.yaml` configuration file to isolate the boot, main code, and known overlay segments of an N64 ROM based on standard entry points.
2. Disassembly Pipeline: Integrate a call to `spimdisasm` to parse the split MIPS assembly chunks into structured directories (`asm/`, `assets/`, `src/`).
3. Automated C Stubbing: Create a tool that parses the generated `.s` assembly files, extracts the function signatures, and generates matching `.c` files containing blank C function stubs with the corresponding global labels so the project structure is ready for matching.
4. Build Orchestration: Output a clean GNU Makefile or Ninja build script that handles re-assembling the files back into a byte-matching target ROM using a modern GCC cross-compiler or the historical KMC GCC 2.7.2 toolchain.

Provide the complete script files, clear directory layout instructions, and explanation of how the dependency toolchain interacts.
Why the "Port to Native JavaScript" Part is the Real Bottleneck
Once the LLM outputs that setup, you encounter the exact technical barrier that separates games like Super Mario 64 PC Port from a simple webpage: The UltraHLE problem.

When Super Mario 64 was decompiled, it was compiled back into native C code meant to run on an N64. To turn it into a PC port, humans didn't rewrite the logic into Windows/DirectX code. Instead, they wrote an entire compatibility translation layer (like libultraship) that catches the N64 audio/video library calls (gSPProcessDisplayList, osAiSetNextBuffer) and translates them on the fly into modern OpenGL, DirectX, or WebGL hooks.

If you want an LLM to help you port a decompiled Mario Party to native JavaScript, you must instruct it to build that translation layer.

The Architecture Required for the Browser
To make a decompiled N64 game run natively selectable in a browser, your LLM prompt needs to focus on creating an N64-to-Web Target Ecosystem:

Memory Simulation: JavaScript cannot read direct pointers. The LLM must generate a massive, global ArrayBuffer(4 * 1024 * 1024) to simulate the N64's 4MB/8MB RDRAM. Every decompiled pointer function must be refactored by the LLM to read/write from index offsets of this buffer.

Graphics Microcode Interpreter: The N64 didn't have a modern GPU; it used microcode (like Fast3D) running on a RSP (Reality Signal Processor). The LLM must write a JavaScript module that intercepts the game’s display lists and translates those legacy 3D microcode commands into modern Three.js or WebGL vertex buffers.

If you are determined to build this, start by using the LLM to generate the automated ROM splitting and asset extraction scripts first. Once you have the raw assets and the foundational MIPS blocks extracted into structured C folders, you can tackle the massive job of feeding isolated logic blocks to the LLM to map them into your JavaScript memory array.
