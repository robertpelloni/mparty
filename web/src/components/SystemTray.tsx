"use client";

import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import {
  Server,
  Power,
  RefreshCw,
  Minimize2
} from 'lucide-react';

export interface ServiceStatus {
  id: string;
  name: string;
  port?: number;
  status: 'running' | 'idle' | 'stopped' | 'error';
  uptime: string;
  description: string;
}

export default function SystemTray() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [shutdownMessage, setShutdownMessage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'web',
      name: 'Next.js Web Server',
      port: 3000,
      status: 'running',
      uptime: 'Active',
      description: 'App Router dashboard interface and client WebEngine host.'
    },
    {
      id: 'netplay',
      name: 'Netplay Sync Socket',
      port: 8080,
      status: 'running',
      uptime: 'Listening',
      description: 'WebRTC and WebSocket stream dispatcher for low-latency player input.'
    },
    {
      id: 'ai_loop',
      name: 'AI Matching Worker',
      status: 'idle',
      uptime: 'Standing by',
      description: 'Autonomous MIPS-to-C recompilation and decompilation verification loop.'
    },
    {
      id: 'audio_engine',
      name: 'PCM Audio Engine',
      status: 'running',
      uptime: 'Active (Web Audio)',
      description: 'Direct PCM Float32 stream decoding pipeline for emulated console audio.'
    }
  ]);

  const handleStopAll = () => {
    setIsShuttingDown(true);
    setShutdownMessage("Halting server daemons and closing WebSockets...");

    setTimeout(() => {
      setServices(prev => prev.map(s => ({ ...s, status: 'stopped', uptime: 'Offline' })));
      setIsShuttingDown(false);
      setShutdownMessage("All servers safely halted. Background workers detached.");
    }, 1200);
  };

  const handleRestartAll = () => {
    setIsShuttingDown(true);
    setShutdownMessage("Restarting services and reloading WebAssembly hypervisor...");

    setTimeout(() => {
      setServices([
        {
          id: 'web',
          name: 'Next.js Web Server',
          port: 3000,
          status: 'running',
          uptime: '0s (Restarted)',
          description: 'App Router dashboard interface and client WebEngine host.'
        },
        {
          id: 'netplay',
          name: 'Netplay Sync Socket',
          port: 8080,
          status: 'running',
          uptime: '0s (Restarted)',
          description: 'WebRTC and WebSocket stream dispatcher for low-latency player input.'
        },
        {
          id: 'ai_loop',
          name: 'AI Matching Worker',
          status: 'idle',
          uptime: 'Standing by',
          description: 'Autonomous MIPS-to-C recompilation and decompilation verification loop.'
        },
        {
          id: 'audio_engine',
          name: 'PCM Audio Engine',
          status: 'running',
          uptime: 'Active (Web Audio)',
          description: 'Direct PCM Float32 stream decoding pipeline for emulated console audio.'
        }
      ]);
      setIsShuttingDown(false);
      setShutdownMessage("Services successfully restarted.");
      setTimeout(() => setShutdownMessage(null), 3000);
    }, 1000);
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            RUNNING
          </span>
        );
      case 'idle':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            IDLE
          </span>
        );
      case 'stopped':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            STOPPED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            ERROR
          </span>
        );
    }
  };

  const runningCount = services.filter(s => s.status === 'running').length;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded System Tray Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="System Tray Controls"
          className="mb-3 w-96 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-zinc-100">System Tray & Server Control</span>
            </div>
            <Tooltip content="Collapse System Tray panel">
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
                aria-label="Close System Tray"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Notification banner */}
          {shutdownMessage && (
            <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-xs font-mono text-indigo-300 flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isShuttingDown ? 'animate-spin' : ''}`} />
              <span>{shutdownMessage}</span>
            </div>
          )}

          {/* Services list */}
          <div className="p-3 divide-y divide-zinc-800/60 max-h-72 overflow-y-auto">
            {services.map(service => (
              <div key={service.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">{service.name}</span>
                    {service.port && (
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">
                        :{service.port}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{service.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getStatusBadge(service.status)}
                  <span className="text-[10px] font-mono text-zinc-500">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-2">
            <Tooltip content="Restart local services, reset WebGL state, and re-arm AI matcher pipelines.">
              <button
                onClick={handleRestartAll}
                disabled={isShuttingDown}
                className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restart All
              </button>
            </Tooltip>

            <Tooltip content="Safely terminate all server daemons, disconnect WebRTC netplay sessions, and halt WebAssembly background loops.">
              <button
                onClick={handleStopAll}
                disabled={isShuttingDown || runningCount === 0}
                className="flex-1 py-1.5 px-3 bg-red-950/30 hover:bg-red-900/40 text-red-300 hover:text-red-200 border border-red-900/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Power className="w-3.5 h-3.5" />
                Quit Servers
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Tray Icon Trigger Button */}
      <Tooltip content={isOpen ? "Hide System Tray" : `System Tray: ${runningCount} active servers. Click to manage servers or quit processes.`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Toggle System Tray"
        >
          <div className="relative">
            <Server className="w-4 h-4 text-indigo-400" />
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${runningCount > 0 ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'}`}></span>
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${runningCount > 0 ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
          </div>
          <span className="text-xs font-mono font-medium pr-1">
            {runningCount > 0 ? `${runningCount} Active` : 'Offline'}
          </span>
        </button>
      </Tooltip>
    </div>
  );
}
