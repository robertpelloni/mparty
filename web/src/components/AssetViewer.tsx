'use client';

import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function Model({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

interface AssetViewerProps {
  url?: string;
  type?: 'model' | 'texture';
  name?: string;
}

export default function AssetViewer({ url = "/models/dummy_geometry.obj", type = 'model', name = "dummy_geometry.obj" }: AssetViewerProps) {

  if (type === 'texture') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
        <img
          src={url}
          alt={name}
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900 relative shadow-2xl">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model url={url} />
        </Suspense>
        <OrbitControls autoRotate enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}
