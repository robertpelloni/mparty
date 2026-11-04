import { NextResponse } from 'next/server';

export interface AssetMetadata {
  id: string;
  name: string;
  type: 'model' | 'texture';
  url: string;
  size: number;
}

const availableAssets: AssetMetadata[] = [
  { id: 'model_1', name: 'dummy_geometry.obj', type: 'model', url: '/models/dummy_geometry.obj', size: 100 },
  { id: 'texture_1', name: 'globe.svg', type: 'texture', url: '/globe.svg', size: 1035 },
  { id: 'texture_2', name: 'window.svg', type: 'texture', url: '/window.svg', size: 385 },
  { id: 'texture_3', name: 'file.svg', type: 'texture', url: '/file.svg', size: 391 },
];

export async function GET() {
  // Simulates scanning the /public/assets folder
  // Supervisor requested using "metadata" field instead of raw fallback buffers
  return NextResponse.json({
    success: true,
    metadata: availableAssets
  });
}
