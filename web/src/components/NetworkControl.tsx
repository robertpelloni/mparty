"use client";

import React, { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { Network, Wifi, Globe, Copy, Check } from 'lucide-react';
import { NetplayManager } from '../lib/NetplayManager';

export default function NetworkControl() {
  const [isHosting, setIsHosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>("Offline");
  const [netplay, setNetplay] = useState<NetplayManager | null>(null);

  useEffect(() => {
    setNetplay(new NetplayManager());
    return () => netplay?.disconnect();
  }, []);

  const mockInviteCode = "MPARTY-8F2A-99B1";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startHosting = async () => {
    if (!netplay) return;
    try {
      setStatus("Initializing Host...");
      // In a real app we would exchange SDP via signaling server.
      await netplay.hostGame();
      setIsHosting(true);
      setStatus("Hosting WebRTC Lobby");
    } catch (e) {
      console.error(e);
      setStatus("Failed to Host");
    }
  };

  const joinSession = async () => {
     if (!netplay) return;
     try {
       setStatus("Attempting Peer Connection...");
       // Mock an empty object just to test frontend UI logic
       await netplay.joinGame({ type: 'offer', sdp: '' } as any);
       setStatus("Connected via DataChannel");
     } catch(e) {
       console.log("Mock join error handled:", e);
       setStatus("Joined Mock Lobby");
     }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-500" />
          WebRTC Netplay
        </h2>
        <Tooltip content="Peer-to-peer rollback netcode. Allows you to play emulated local-multiplayer games over the internet with zero server latency.">
          <button className="text-zinc-500 hover:text-zinc-300">
            <Globe className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {!isHosting ? (
          <>
            <button
              onClick={startHosting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Wifi className="w-4 h-4" /> Host Public Lobby
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or join existing</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Invite Code"
                className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button onClick={joinSession} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors">
                Join
              </button>
            </div>

            <div className="text-center text-xs text-zinc-500 mt-2">
              Status: {status}
            </div>
          </>
        ) : (
          <div className="bg-black border border-zinc-800 rounded-lg p-4 text-center space-y-3">
            <div className="inline-block animate-pulse bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              Lobby Active
            </div>
            <p className="text-sm text-zinc-400">Share this code with your friends to let them join your emulator session.</p>
            <div className="flex items-center justify-center gap-2 bg-zinc-900 py-2 rounded font-mono text-lg tracking-widest border border-zinc-800">
              {mockInviteCode}
              <Tooltip content="Copy Invite Code">
                <button onClick={handleCopy} className="text-zinc-500 hover:text-white transition-colors ml-2">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </Tooltip>
            </div>
            <button
              onClick={() => setIsHosting(false)}
              className="mt-4 text-sm text-red-400 hover:text-red-300 underline"
            >
              Close Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
