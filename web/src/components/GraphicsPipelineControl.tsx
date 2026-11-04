"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Box, Layers, RefreshCw, Sparkles, Activity } from 'lucide-react';

export default function GraphicsPipelineControl() {
  const [cacheSize] = useState(32);
  const [status, setStatus] = useState("Fast3D Ready (32-Vtx Cache)");
  const [lastOpcode, setLastOpcode] = useState("G_ENDDL");
  const [renderedTriangles, setRenderedTriangles] = useState(0);

  const handleTestDisplayList = () => {
    // Simulate executing Fast3D display list decoding
    setLastOpcode("G_VTX -> G_TRI1 -> G_ENDDL");
    setRenderedTriangles(prev => prev + 1);
    setStatus("Processed F3DEX2 Display List (0x80200000)");
  };

  const handleFlushCache = () => {
    setLastOpcode("G_ENDDL (Cache Flushed)");
    setStatus("Pre-allocated 32-Vertex WebGL Cache Cleared");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Fast3D Graphics Middleware
        </h2>
        <Tooltip content="Translates N64 RSP microcode commands (e.g., G_VTX, G_TRI1) into native WebGL and Three.js draw calls, managing a fixed 32-vertex cache.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Sparkles className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Tooltip content="Execute mock F3DEX2 display list processing loop via Fast3DTranslator.gSPProcessDisplayList().">
            <button
              onClick={handleTestDisplayList}
              className="py-3 px-4 bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-lg text-xs font-semibold text-zinc-200 hover:text-purple-300 flex items-center justify-center gap-2 transition-all"
            >
              <Box className="w-4 h-4 text-purple-400" />
              Decode Display List
            </button>
          </Tooltip>

          <Tooltip content="Reset the internal 32-vertex RSP vertex cache and rebind WebGL depth testing buffers.">
            <button
              onClick={handleFlushCache}
              className="py-3 px-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Flush Vertex Cache
            </button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-500">RSP Cache Size:</span>
            <span className="font-mono text-purple-400 font-bold">{cacheSize} Vertices</span>
          </div>
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-500">Triangles Drawn:</span>
            <span className="font-mono text-purple-400 font-bold">{renderedTriangles}</span>
          </div>
        </div>

        <div className="p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            Translator Status:
          </span>
          <span className="font-mono text-zinc-300">{status}</span>
        </div>
      </div>
    </div>
  );
}
