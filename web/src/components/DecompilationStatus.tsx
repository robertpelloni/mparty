"use client";

import React from 'react';
import { Tooltip } from './Tooltip';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DecompilationStatus() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Decompilation Pipeline
        </h2>
        <Tooltip content="The current status of the automated MIPS-to-C matching loop. Requires a valid ROM to begin active processing.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <AlertCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-1">Functions Matched</div>
          <div className="text-2xl font-mono font-bold text-green-400 flex items-center gap-2">
            0 <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-1">Pending C Stubs</div>
          <div className="text-2xl font-mono font-bold text-amber-400">12,408</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-1">AI Loop Status</div>
          <div className="text-lg font-bold text-zinc-500">IDLE (Waiting for ROM)</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Recent AI Matching Logs</h3>
        <div className="bg-black rounded border border-zinc-800 p-3 font-mono text-xs text-zinc-500 h-32 overflow-y-auto">
          <div>[system] Pipeline initialized.</div>
          <div>[splat64] Awaiting target ROM insertion in /tests/roms/</div>
          <div>[ai_loop] Standing by...</div>
        </div>
      </div>
    </div>
  );
}
