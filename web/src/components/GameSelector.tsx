"use client";

import React, { useState, useEffect, useRef } from 'react';
import { EmulationCore, RomMetadata } from '../lib/EmulationCore';

export default function GameSelector() {
  const [availableGames, setAvailableGames] = useState<RomMetadata[]>([]);
  const [selectedGame, setSelectedGame] = useState<RomMetadata | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const coreRef = useRef<EmulationCore | null>(null);

  useEffect(() => {
    // Initialize the emulation core bound to our canvas
    coreRef.current = new EmulationCore('emulator-canvas');

    // Fetch available ROMs dynamically from our API
    fetch('/api/roms')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableGames(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch ROMs:", err))
      .finally(() => setIsLoading(false));

    return () => {
      coreRef.current?.stop();
    };
  }, []);

  const handlePlay = async (game: RomMetadata) => {
    setSelectedGame(game);
    setIsPlaying(true);

    if (coreRef.current && coreRef.current.initializeContext()) {
      // In a real environment, we'd fetch the ROM from IndexedDB or the server
      const dummyBuffer = new ArrayBuffer(game.fileSize);
      await coreRef.current.loadRom(dummyBuffer, game);
      coreRef.current.start();
    }
  };

  const handleStop = () => {
    coreRef.current?.stop();
    setIsPlaying(false);
    setSelectedGame(null);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8">
      {/* Selection UI */}
      {isLoading ? (
        <div className="text-center text-zinc-500 py-12">Loading available games...</div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isPlaying ? 'opacity-50 pointer-events-none' : ''}`}>
          {availableGames.map((game) => (
            <div
              key={game.id}
            className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-500 transition-colors flex flex-col items-center gap-4 bg-white dark:bg-zinc-900"
          >
            <h3 className="font-bold text-lg">{game.title}</h3>
            <span className="text-sm text-zinc-500">{game.platform}</span>
              <button
                onClick={() => handlePlay(game)}
                disabled={isPlaying}
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-zinc-400"
              >
                Play
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emulation Viewport */}
      <div className={`w-full bg-black rounded-lg overflow-hidden border border-zinc-800 shadow-2xl transition-all ${isPlaying ? 'opacity-100 h-[600px]' : 'opacity-0 h-0 border-transparent'}`}>
        <div className="p-4 bg-zinc-900 flex justify-between items-center border-b border-zinc-800">
          <span className="text-white font-semibold">
            {selectedGame ? `Running: ${selectedGame.title} (${selectedGame.platform})` : 'Emulator Idle'}
          </span>
          <button
            onClick={handleStop}
            className="text-red-500 hover:text-red-400 font-medium text-sm"
          >
            Power Off
          </button>
        </div>

        {/* The canvas target for the WASM context */}
        <div className="w-full h-full flex items-center justify-center bg-zinc-950 pb-16">
          <canvas
            id="emulator-canvas"
            className="max-w-full max-h-full aspect-video bg-zinc-900"
            width={640}
            height={480}
          />
        </div>
      </div>
    </div>
  );
}
