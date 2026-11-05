"use client";

import React from 'react';
import { Tooltip } from './Tooltip';
import { Save, Download, CloudUpload, Gamepad2 } from 'lucide-react';

export default function SaveStateControl() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Save className="w-5 h-5 text-emerald-500" />
          Cross-Gen Save States
        </h2>
        <Tooltip content="Manage Universal JSON Save States. This extracts logic like coins, stars, and boards from the raw emulator memory and persists it across different Mario Party versions.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Gamepad2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg transition-all group">
          <Download className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mb-2" />
          <span className="font-semibold text-sm">Save State</span>
          <span className="text-xs text-zinc-500 mt-1">Extract Universal JSON</span>
        </button>

        <button className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg transition-all group">
          <CloudUpload className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mb-2" />
          <span className="font-semibold text-sm">Load State</span>
          <span className="text-xs text-zinc-500 mt-1">Inject Universal JSON</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
        <span className="text-zinc-500">Current Local Storage:</span>
        <span className="font-mono text-zinc-300">0 KB (Empty)</span>
      </div>
    </div>
  );
}
