"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Disc, HardDrive, Cpu, Terminal, FileCode2 } from 'lucide-react';
import { GameCubeEmulator } from '../lib/GameCubeEmulator';

export default function ConsoleBridgeControl() {
  const [emulator] = useState(() => new GameCubeEmulator());
  const [selectedGame, setSelectedGame] = useState("mp4");
  const [status, setStatus] = useState("Dolphin WASM Container Idle");
  const [extractedModules, setExtractedModules] = useState<string[]>([
    "main.dol (Core Executable)",
    "rel_party.rel (Board Engine)",
    "stage01.szs (Yoshi's Island Archives)"
  ]);

  const handleMountISO = () => {
    emulator.loadISO(selectedGame);
    setStatus(`Mounted ISO: ${selectedGame.toUpperCase()} in Dolphin WASM Bridge`);
  };

  const handleSimulateExtraction = () => {
    setStatus("Extracted FST filesystem table: 3 modules, 14 sub-archives");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Disc className="w-5 h-5 text-cyan-500" />
          GameCube / Wii Hypervisor Bridge
        </h2>
        <Tooltip content="Multi-console expansion container. Mounts GameCube and Wii optical disc images (ISO/GCZ) into the Dolphin WebAssembly engine, parsing FST directory trees and .rel modules.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Cpu className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {/* ISO Selector row */}
        <div className="flex gap-2">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="mp4">Mario Party 4 (GameCube ISO)</option>
            <option value="mp5">Mario Party 5 (GameCube ISO)</option>
            <option value="mp6">Mario Party 6 (GameCube GCZ)</option>
            <option value="mp7">Mario Party 7 (GameCube ISO)</option>
            <option value="mp8">Mario Party 8 (Wii ISO)</option>
            <option value="mp9">Mario Party 9 (Wii WBFS)</option>
          </select>

          <Tooltip content="Mount the selected optical disc image into the Dolphin WebAssembly container context.">
            <button
              onClick={handleMountISO}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              Mount ISO
            </button>
          </Tooltip>
        </div>

        {/* Extracted Modules List */}
        <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-400">Parsed Optical Modules</span>
            <button
              onClick={handleSimulateExtraction}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <FileCode2 className="w-3 h-3" /> Re-scan FST
            </button>
          </div>
          <div className="space-y-1">
            {extractedModules.map((mod, i) => (
              <div key={i} className="text-[11px] font-mono text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded flex items-center justify-between">
                <span>{mod}</span>
                <span className="text-[10px] text-emerald-400">LOADED</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hypervisor status */}
        <div className="p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            Bridge Status:
          </span>
          <span className="font-mono text-zinc-300">{status}</span>
        </div>
      </div>
    </div>
  );
}
