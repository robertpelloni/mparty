'use client';

import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function Model({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

export default function AssetViewer() {
  return (
    <div className="w-full max-w-4xl h-96 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative shadow-2xl mt-8">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model url="/models/dummy_geometry.obj" />
        </Suspense>
        <OrbitControls autoRotate enableZoom={true} enablePan={true} />
      </Canvas>
      <div className="absolute top-4 left-4 text-xs font-mono text-zinc-400 pointer-events-none bg-black/50 px-2 py-1 rounded">
        Asset Viewer: dummy_geometry.obj
      </div>
    </div>
  );
}
