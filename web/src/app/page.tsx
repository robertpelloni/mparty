"use client";

import React, { useState } from 'react';
import GameSelector from "../components/GameSelector";
import AssetGallery from "../components/AssetGallery";
import DecompilationStatus from "../components/DecompilationStatus";
import NetworkControl from "../components/NetworkControl";
import SaveStateControl from "../components/SaveStateControl";
import AudioEngineControl from "../components/AudioEngineControl";
import InputDiagnostics from "../components/InputDiagnostics";
import GraphicsPipelineControl from "../components/GraphicsPipelineControl";
import ConsoleBridgeControl from "../components/ConsoleBridgeControl";
import SystemTray from "../components/SystemTray";
import CliTerminalModal from "../components/CliTerminalModal";
import { Tooltip } from "../components/Tooltip";
import {
  Gamepad2,
  Terminal,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 relative">
      {/* Top Universal Navigation Bar */}
      <header className="border-b border-zinc-800 bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                mparty WebEngine
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono -mt-0.5">Automated Cross-Console Reverse-Engineering & WebAssembly Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip content="Launch the interactive terminal to run mparty_cli.py test suites, event loop listeners, and CLI dashboard modes.">
              <button
                onClick={() => setIsTerminalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                CLI Terminal
              </button>
            </Tooltip>

            <Tooltip content="Current Mario Party WebEngine Platform Release Version. Build targets N64 MIPS opcodes and GameCube Dolphin WASM.">
              <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                v1.0.6
              </div>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Single-Page Unified Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10">

        {/* ======================================================== */}
        {/* TIER 1: HIGH-VALUE USER FEATURES (Play, Netplay & Input) */}
        {/* ======================================================== */}
        <section aria-labelledby="tier1-heading">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <div>
              <h2 id="tier1-heading" className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-indigo-400" />
                Play & Connect
              </h2>
              <p className="text-xs text-zinc-400">Core WebAssembly Emulation, Low-Latency WebRTC Netcode & Realtime Input Bridge</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              Tier 1 • High Priority
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary WASM Game Canvas */}
            <div className="lg:col-span-8">
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">WebAssembly Emulation Hub</h3>
                    <p className="text-xs text-zinc-400">Select a legacy console release to boot into browser RDRAM memory.</p>
                  </div>
                  <Tooltip content="Hardware-accelerated WebGL viewport rendered via Emscripten and Fast3D translation layers.">
                    <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                      WebGL 2.0 / WASM
                    </span>
                  </Tooltip>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <GameSelector />
                </div>
              </div>
            </div>

            {/* Multiplayer & Netplay Control */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <NetworkControl />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* TIER 2: PROGRESSION & HARDWARE SUBSYSTEMS                 */}
        {/* ======================================================== */}
        <section aria-labelledby="tier2-heading">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <div>
              <h2 id="tier2-heading" className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-emerald-400" />
                Progression & Engine Subsystems
              </h2>
              <p className="text-xs text-zinc-400">Cross-Generation State Persistence, Realtime Controller Mapping & Web Audio Streams</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Tier 2 • Subsystems
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cross-Gen Save States */}
            <div className="flex flex-col">
              <SaveStateControl />
            </div>

            {/* Controller / Input Diagnostics */}
            <div className="flex flex-col">
              <InputDiagnostics />
            </div>

            {/* Audio Engine (PCM) */}
            <div className="flex flex-col">
              <AudioEngineControl />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* TIER 3: GRAPHICS TRANSLATION & OPTICAL DISC EXPANSION     */}
        {/* ======================================================== */}
        <section aria-labelledby="tier3-heading">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <div>
              <h2 id="tier3-heading" className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-6 h-6 text-purple-400" />
                Graphics Pipeline & Multi-Console Expansion
              </h2>
              <p className="text-xs text-zinc-400">Fast3D Display List Parsing & Dolphin GameCube/Wii ISO Hypervisor Integration</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
              Tier 3 • Middleware
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GraphicsPipelineControl />
            <ConsoleBridgeControl />
          </div>
        </section>

        {/* ======================================================== */}
        {/* TIER 4: DECOMPILATION PIPELINE & ASSET STUDIO (Dev Tools) */}
        {/* ======================================================== */}
        <section aria-labelledby="tier4-heading">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <div>
              <h2 id="tier4-heading" className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-400" />
                Decompilation Studio & Asset Inspection
              </h2>
              <p className="text-xs text-zinc-400">Autonomous AI Matcher Loops, MIPS Disassembly & Extracted 3D Models / Textures</p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
              Tier 4 • Dev Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <DecompilationStatus />
            </div>
            <div className="lg:col-span-6">
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">Extracted Asset Gallery</h3>
                    <p className="text-xs text-zinc-400">Inspect extracted Wavefront .obj geometry and converted PNG textures.</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                    Three.js / Canvas
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center items-center">
                  <AssetGallery />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating System Tray & Server Control */}
      <SystemTray />

      {/* Interactive Terminal Modal for mparty_cli.py */}
      <CliTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </div>
  );
}
