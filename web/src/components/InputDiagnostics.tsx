"use client";

import React, { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { Gamepad, Crosshair } from 'lucide-react';
import { InputManager } from '../lib/InputManager';

export default function InputDiagnostics() {
  const [inputManager] = useState(() => new InputManager());
  const [packedBitmask, setPackedBitmask] = useState<string>("0x00000000");
  const [simulatedA, setSimulatedA] = useState(false);
  const [simulatedB, setSimulatedB] = useState(false);
  const [simulatedStart, setSimulatedStart] = useState(false);
  const [analogX, setAnalogX] = useState(0);
  const [analogY, setAnalogY] = useState(0);

  useEffect(() => {
    const updateBits = () => {
      // Direct inspection of packed state
      (inputManager as any).state.a = simulatedA;
      (inputManager as any).state.b = simulatedB;
      (inputManager as any).state.start = simulatedStart;
      (inputManager as any).state.joyX = analogX;
      (inputManager as any).state.joyY = analogY;

      const packed = inputManager.getPackedN64State();
      setPackedBitmask("0x" + (packed >>> 0).toString(16).padStart(8, '0').toUpperCase());
    };

    updateBits();
  }, [inputManager, simulatedA, simulatedB, simulatedStart, analogX, analogY]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gamepad className="w-5 h-5 text-amber-500" />
          Controller & Input Diagnostics
        </h2>
        <Tooltip content="Live 32-bit packed N64/GameCube controller bitmask bridge. Converts physical Gamepad API buttons and analog axes into clamped (-128 to 127) signed byte offsets for WASM execution loops.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Crosshair className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {/* Buttons toggle matrix */}
        <div className="grid grid-cols-3 gap-2">
          <Tooltip content="Toggle digital A button bit (Bit 0 in low byte)">
            <button
              onClick={() => setSimulatedA(!simulatedA)}
              className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                simulatedA
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Button A : {simulatedA ? 'ON' : 'OFF'}
            </button>
          </Tooltip>

          <Tooltip content="Toggle digital B button bit (Bit 1 in low byte)">
            <button
              onClick={() => setSimulatedB(!simulatedB)}
              className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                simulatedB
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Button B : {simulatedB ? 'ON' : 'OFF'}
            </button>
          </Tooltip>

          <Tooltip content="Toggle Start button bit (Bit 3 in low byte)">
            <button
              onClick={() => setSimulatedStart(!simulatedStart)}
              className={`py-2 px-3 rounded text-xs font-semibold border transition-all ${
                simulatedStart
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Start : {simulatedStart ? 'ON' : 'OFF'}
            </button>
          </Tooltip>
        </div>

        {/* Joystick sliders */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>JoyStick X</span>
              <span className="font-mono text-amber-400">{analogX}</span>
            </div>
            <input
              type="range"
              min="-128"
              max="127"
              value={analogX}
              onChange={(e) => setAnalogX(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>JoyStick Y</span>
              <span className="font-mono text-amber-400">{analogY}</span>
            </div>
            <input
              type="range"
              min="-128"
              max="127"
              value={analogY}
              onChange={(e) => setAnalogY(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Packed Bitmask Output Display */}
        <div className="p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
          <span className="text-zinc-500">32-bit Packed N64 Bitmask:</span>
          <span className="font-mono text-amber-400 font-bold tracking-wider">{packedBitmask}</span>
        </div>
      </div>
    </div>
  );
}
