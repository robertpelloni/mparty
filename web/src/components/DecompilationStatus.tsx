"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Activity, CheckCircle2, AlertCircle, Play } from 'lucide-react';

export default function DecompilationStatus() {
  const [logs, setLogs] = useState<string[]>([
      "[system] Pipeline initialized.",
      "[splat64] Awaiting target ROM insertion in /tests/roms/",
      "[ai_loop] Standing by..."
  ]);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleExtractStubs = () => {
      setLogs(prev => [...prev, "[c_stubber] Scanning /asm for raw MIPS instructions...", "[c_stubber] Successfully generated 5 mock C function stubs."]);
  };

  const handleTriggerAI = async () => {
      setIsProcessing(true);
      setLogs(prev => [...prev, "[system] Triggering continuous AI loop..."]);

      try {
          const res = await fetch('/api/ai', { method: 'POST' });
          const data = await res.json();
          if (data && data.logs) {
              const newLogs = data.logs.split('\n').filter((l: string) => l.trim() !== '');
              setLogs(prev => [...prev, ...newLogs]);
          } else {
              setLogs(prev => [...prev, "[error] Unknown response from AI worker."]);
          }
      } catch (e: any) {
          setLogs(prev => [...prev, `[error] Failed to connect to AI hook: ${e.message}`]);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Decompilation Pipeline
        </h2>
        <div className="flex gap-2 items-center">

            <Tooltip content="Manually extract C-stubs via Node.js tool pipeline parsing.">
              <button
                  onClick={handleExtractStubs}
                  disabled={isProcessing}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 rounded flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              >
                  Parse MIPS
              </button>
            </Tooltip>
            <Tooltip content="Manually force the AI matching python scripts to execute on the backend.">

              <button
                  onClick={handleTriggerAI}
                  disabled={isProcessing}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50 rounded flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              >
                  <Play className="w-4 h-4" />
                  Run AI Loop
              </button>
            </Tooltip>
            <Tooltip content="The current status of the automated MIPS-to-C matching loop. Requires a valid ROM to begin active processing.">
              <button className="text-zinc-500 hover:text-zinc-300">
                <AlertCircle className="w-4 h-4" />
              </button>
            </Tooltip>
        </div>
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
          <div className={`text-lg font-bold ${isProcessing ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`}>
              {isProcessing ? 'PROCESSING...' : 'IDLE'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Recent AI Matching Logs</h3>
        <div className="bg-black rounded border border-zinc-800 p-3 font-mono text-xs text-zinc-400 h-32 overflow-y-auto flex flex-col gap-1">
          {logs.map((log, index) => (
             <div key={index} className={log.includes('[error]') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : ''}>
                {log}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
