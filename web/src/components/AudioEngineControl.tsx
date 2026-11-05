"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Volume2, VolumeX, PlayCircle, Music, Radio, Activity } from 'lucide-react';
import { AudioManager } from '../lib/AudioManager';

export default function AudioEngineControl() {
  const [audioManager] = useState(() => new AudioManager());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Idle (PCM Ready)");

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMasterVolume(nextMute ? 0 : volume / 100);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (!isMuted) {
      audioManager.setMasterVolume(newVol / 100);
    }
  };

  const handleTestPcmStream = () => {
    // Generate 0.5s mock audio buffer (sine wave tone in PCM float format)
    const sampleRate = 44100;
    const duration = 0.5;
    const numSamples = sampleRate * duration;
    const pcmBuffer = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      pcmBuffer[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.2;
    }

    try {
      audioManager.decodePCMStream(pcmBuffer);
      setIsPlaying(true);
      setStatus("Streaming 440Hz PCM audio buffer");
      setTimeout(() => {
        setIsPlaying(false);
        setStatus("PCM stream dispatched (Buffer Queued)");
      }, 500);
    } catch (e: any) {
      console.error(e);
      setStatus("Error streaming PCM buffer");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Music className="w-5 h-5 text-pink-500" />
          Legacy Console Audio Engine
        </h2>
        <Tooltip content="Decodes legacy console audio banks (such as MUSYX .ctl/.tbl) into raw PCM float streams, feeding continuous audio buffers into the Web Audio API without underruns.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Radio className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {/* Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Master Output</span>
              <Tooltip content={isMuted ? "Unmute Audio" : "Mute Audio"}>
                <button
                  onClick={handleToggleMute}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <span className="font-mono text-xs text-pink-400 w-10 text-right">{isMuted ? 0 : volume}%</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">PCM Buffer Feed</span>
              <span className="text-[10px] font-mono text-zinc-500">44.1 kHz Float32</span>
            </div>
            <Tooltip content="Synthesize and inject a 500ms test PCM float buffer directly into the Web Audio playback queue via decodePCMStream().">
              <button
                onClick={handleTestPcmStream}
                className="w-full py-2 bg-pink-950/30 hover:bg-pink-900/40 border border-pink-900/50 text-pink-300 rounded font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <PlayCircle className={`w-4 h-4 ${isPlaying ? 'animate-spin text-pink-400' : ''}`} />
                Test PCM Audio Stream
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Engine status indicator */}
        <div className="p-3 bg-black border border-zinc-800 rounded text-xs flex justify-between items-center">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-pink-500" />
            Audio Engine Status:
          </span>
          <span className="font-mono text-zinc-300">{status}</span>
        </div>
      </div>
    </div>
  );
}
