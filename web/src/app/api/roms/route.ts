import { NextResponse } from 'next/server';
import { RomMetadata } from '../../../lib/EmulationCore';

const availableRoms: RomMetadata[] = [
  { id: 'mp1', title: 'Mario Party 1', platform: 'N64', fileSize: 4194304 },
  { id: 'mp2', title: 'Mario Party 2', platform: 'N64', fileSize: 8388608 },
  { id: 'mp3', title: 'Mario Party 3', platform: 'N64', fileSize: 8388608 },
  { id: 'mp4', title: 'Mario Party 4', platform: 'GameCube', fileSize: 1459978240 },
  { id: 'mp5', title: 'Mario Party 5', platform: 'GameCube', fileSize: 1459978240 },
  { id: 'mp8', title: 'Mario Party 8', platform: 'Wii', fileSize: 4699979776 },
];

export async function GET() {
  // Simulates fetching ROM metadata from a central database or scanning the filesystem
  return NextResponse.json({
    success: true,
    data: availableRoms
  });
}
