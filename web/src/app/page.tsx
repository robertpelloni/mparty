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

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Emulator & Game Selection */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-lg font-semibold mb-2">Emulator Hub</h2>
              <p className="text-sm text-zinc-400">
                Select a game version to initialize the WebAssembly emulation core directly in your browser.
              </p>
            </div>
            <div className="p-6">
              <GameSelector />
            </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <h2 className="text-lg font-semibold mb-2">Extracted Asset Viewer</h2>
                <p className="text-sm text-zinc-400">Live WebGL rendering of 3D models extracted via the pipeline.</p>
             </div>
             <div className="p-6 flex justify-center">
                <AssetViewer />
             </div>
          </div>
        </div>

        {/* Right Column: Dashboard Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DecompilationStatus />
          <NetworkControl />
          <SaveStateControl />
        </div>

      </main>
    </div>
  );
}
