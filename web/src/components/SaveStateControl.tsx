"use client";

import React from 'react';
import { Tooltip } from './Tooltip';
import { Save, Download, CloudUpload, Gamepad2 } from 'lucide-react';

import { SaveStateManager } from '../lib/SaveStateManager';

export default function SaveStateControl() {
  const [status, setStatus] = React.useState<string>("0 KB (Empty)");
  const [saveManager, setSaveManager] = React.useState<SaveStateManager | null>(null);

  React.useEffect(() => {
    // SaveStateManager uses window.indexedDB, so it must be instantiated client-side
    setSaveManager(new SaveStateManager());
  }, []);

  const handleExport = async () => {
    if (!saveManager) return;
    try {
      // Mock gameId and dummy data for UI testing since we don't have a live core
      const dummyData = new Uint8Array([1, 2, 3, 4]);
      await saveManager.saveState('mparty1', dummyData);

      const json = await saveManager.exportSave('mparty1');
      if (json) {
        setStatus("Exported Universal JSON");
        console.log("Exported JSON:", json);
      } else {
        setStatus("Export failed (No data)");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error during export");
    }
  };

  const handleImport = async () => {
    if (!saveManager) return;
    try {
      // Create a mock json to import
      const mockJson = JSON.stringify({
        gameId: 'mparty1',
        timestamp: Date.now(),
        data: [5, 6, 7, 8],
        universalData: {
          globalCoins: 999,
          globalStars: 99,
          unlockedBoards: ['Peach\'s Birthday Cake'],
          unlockedMinigames: []
        }
      });
      const success = await saveManager.importSave('mparty1', mockJson);
      setStatus(success ? "Imported Universal JSON" : "Import Failed");
    } catch (e) {
      console.error(e);
      setStatus("Error during import");
    }
  };

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
        <Tooltip content="Extracts the current emulator state and translates into a universal JSON cross-gen format.">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg transition-all group w-full h-full"
          >
            <Download className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mb-2" />
            <span className="font-semibold text-sm">Save State</span>
            <span className="text-xs text-zinc-500 mt-1">Extract Universal JSON</span>
          </button>
        </Tooltip>

        <Tooltip content="Injects a universal JSON state from your local computer into the running emulator core memory.">
          <button
            onClick={handleImport}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg transition-all group w-full h-full"
          >
            <CloudUpload className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mb-2" />
            <span className="font-semibold text-sm">Load State</span>
            <span className="text-xs text-zinc-500 mt-1">Inject Universal JSON</span>
          </button>
        </Tooltip>
      </div>

      <div className="mt-4 p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
        <span className="text-zinc-500">Current Local Storage:</span>
        <span className="font-mono text-zinc-300">{status}</span>
      </div>
    </div>
  );
}
