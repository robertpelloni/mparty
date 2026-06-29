import GameSelector from "../components/GameSelector";
import AssetViewer from "../components/AssetViewer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex w-full flex-col items-center py-16 px-8 sm:px-16">
        <div className="mb-12 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Mario Party Web Engine
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Select a game version below to initialize the WebAssembly emulation core directly in your browser.
          </p>
        </div>

        <GameSelector />

        <div className="mt-16 w-full max-w-4xl">
           <h2 className="text-2xl font-bold mb-4 text-center">Extracted Asset Viewer Preview</h2>
           <p className="text-center text-zinc-500 mb-6">Demonstrating live web rendering of 3D models extracted via the pipeline.</p>
           <AssetViewer />
        </div>
      </main>
    </div>
  );
}
