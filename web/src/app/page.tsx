import GameSelector from "../components/GameSelector";
import AssetViewer from "../components/AssetViewer";
import DecompilationStatus from "../components/DecompilationStatus";
import NetworkControl from "../components/NetworkControl";
import SaveStateControl from "../components/SaveStateControl";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            mparty WebEngine
          </h1>
          <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            v0.1.0-alpha
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10">

        {/* Section 1: Play & Connect (High Value) */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <h2 className="text-2xl font-bold text-zinc-100">Play & Connect</h2>
            <span className="text-sm text-zinc-500">Core Emulation & Multiplayer</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-full">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="text-lg font-semibold mb-2">Emulator Hub</h3>
                  <p className="text-sm text-zinc-400">Select a game version to initialize the WebAssembly core.</p>
                </div>
                <div className="p-6">
                  <GameSelector />
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <NetworkControl />
            </div>
          </div>
        </section>

        {/* Section 2: Progression (Mid Value) */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <h2 className="text-2xl font-bold text-zinc-100">Progression</h2>
            <span className="text-sm text-zinc-500">Cross-Generation State Persistence</span>
          </div>
          <div className="grid grid-cols-1">
            <SaveStateControl />
          </div>
        </section>

        {/* Section 3: Development Pipeline (Lower Value / Dev Tools) */}
        <section className="opacity-80 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <h2 className="text-2xl font-bold text-zinc-100">Development Pipeline</h2>
            <span className="text-sm text-zinc-500">Diagnostics & Extraction Tools</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <DecompilationStatus />
            </div>
            <div className="lg:col-span-6">
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-full">
                 <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <h3 className="text-lg font-semibold mb-2">Extracted Asset Viewer</h3>
                    <p className="text-sm text-zinc-400">Live WebGL rendering of 3D models.</p>
                 </div>
                 <div className="p-6 flex justify-center items-center h-[calc(100%-80px)]">
                    <AssetViewer />
                 </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
