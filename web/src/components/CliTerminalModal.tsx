"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Terminal, X } from 'lucide-react';

export default function CliTerminalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [output, setOutput] = useState<string[]>([
    "$ mparty_cli.py --help",
    "usage: mparty_cli.py [-h] {test,loop,match,dev,run,dashboard} ...",
    "",
    "Mario Party Decompilation Orchestrator",
    "Available commands: test, loop, match, dev, run, dashboard",
    "[ready] Interactive terminal orchestrator online."
  ]);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunCommand = (cmd: string) => {
    setIsRunning(true);
    setOutput(prev => [...prev, `$ mparty_cli.py ${cmd}`, `[running] Executing mparty_cli.py ${cmd}...`]);

    setTimeout(() => {
      if (cmd === 'test') {
        setOutput(prev => [
          ...prev,
          "Starting integration test pipeline...",
          "[OK] Step 'Verify Architecture' completed successfully.",
          "[OK] Step 'Test Validation Layer' completed successfully.",
          "[OK] Step 'Test AI Loop' completed successfully.",
          "[OK] Step 'Generate Mock ROM' completed successfully.",
          "Integration test pipeline completed successfully."
        ]);
      } else if (cmd === 'run') {
        setOutput(prev => [
          ...prev,
          "Initializing mparty event loop on port 8080...",
          "Parsed controller stream: Button A (0x8000)",
          "Dispatching payload to WebRTC data channels."
        ]);
      } else if (cmd === 'dashboard') {
        setOutput(prev => [
          ...prev,
          "============================================================",
          "   Mario Party Engine - Interactive CLI Dashboard",
          "============================================================",
          "[1] AI Decompilation Pipeline : ACTIVE",
          "[2] Next.js Web Frontend      : ONLINE (Port 3000)",
          "[3] Netplay Sync Server       : LISTENING (Port 8080)",
          "------------------------------------------------------------"
        ]);
      }
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Terminal Title Bar */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-zinc-100">Mparty CLI & Architecture Monitor</h3>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Close CLI terminal modal">
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
                aria-label="Close Terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Command Launcher Toolbar */}
        <div className="bg-zinc-950/80 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">Quick Run:</span>
          <button
            onClick={() => handleRunCommand('test')}
            disabled={isRunning}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono transition-colors disabled:opacity-50"
          >
            test
          </button>
          <button
            onClick={() => handleRunCommand('run')}
            disabled={isRunning}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono transition-colors disabled:opacity-50"
          >
            run
          </button>
          <button
            onClick={() => handleRunCommand('dashboard')}
            disabled={isRunning}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono transition-colors disabled:opacity-50"
          >
            dashboard
          </button>
          <button
            onClick={() => setOutput(["$ clear", "[ready] Interactive terminal orchestrator online."])}
            className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 font-mono"
          >
            Clear Log
          </button>
        </div>

        {/* Terminal output viewport */}
        <div className="flex-1 bg-black p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
          {output.map((line, i) => (
            <div key={i} className={line.startsWith('$') ? 'text-zinc-300 font-bold' : line.includes('[OK]') ? 'text-green-400' : line.includes('Error') ? 'text-red-400' : 'text-zinc-400'}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
