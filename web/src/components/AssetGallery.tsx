'use client';

import React, { useState, useEffect } from 'react';
import { Box, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AssetMetadata } from '../app/api/assets/route';
import AssetViewer from './AssetViewer';

// Mock hook based on Supervisor's instructions "useDataFetch"
function useDataFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                // Simulate network latency as requested
                await new Promise(resolve => setTimeout(resolve, 300));

                const res = await fetch(url);
                const json = await res.json();

                if (isMounted && json.success) {
                    // Expecting the new 'metadata' field logic here as hinted by the supervisor
                    setData(json.metadata || json.data);
                }
            } catch (err: any) {
                if (isMounted) setError(err);
                console.error(`Failed to fetch from ${url}`, err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();

        return () => { isMounted = false; };
    }, [url]);

    return { data, loading, error };
}

export default function AssetGallery() {
  const { data: assets, loading } = useDataFetch<AssetMetadata[]>('/api/assets');
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(null);

  useEffect(() => {
      if (assets && assets.length > 0 && !selectedAsset) {
          setSelectedAsset(assets[0]);
      }
  }, [assets, selectedAsset]);

  return (
    <div className="flex h-96 w-full border border-zinc-800 rounded-xl overflow-hidden bg-black shadow-inner">
      {/* Sidebar */}
      <aside className="w-48 bg-zinc-900 border-r border-zinc-800 overflow-y-auto flex-shrink-0">
        <div className="p-3 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Extracted Assets</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="flex flex-col">
            {assets?.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full flex items-center gap-2 p-3 text-left transition-colors border-b border-zinc-800/50 ${
                  selectedAsset?.id === asset.id
                    ? 'bg-blue-500/10 border-l-2 border-l-blue-500 text-blue-300'
                    : 'hover:bg-zinc-800 text-zinc-400 border-l-2 border-l-transparent'
                }`}
              >
                {asset.type === 'model' ? <Box className="w-4 h-4 flex-shrink-0" /> : <ImageIcon className="w-4 h-4 flex-shrink-0" />}
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium">
                  {asset.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Viewing Area */}
      <section className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">
        {selectedAsset ? (
          <>
            <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded px-2 py-1 flex justify-between items-center w-auto gap-4 pointer-events-none">
              <span className="font-mono text-xs font-bold text-white">{selectedAsset.name}</span>
              <span className="text-xs text-zinc-400 font-mono">
                {(selectedAsset.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex-1 w-full h-full">
              <AssetViewer
                url={selectedAsset.url}
                type={selectedAsset.type}
                name={selectedAsset.name}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Box className="w-10 h-10 opacity-30" />
            <p className="text-sm">Select an asset to view</p>
          </div>
        )}
      </section>
    </div>
  );
}
