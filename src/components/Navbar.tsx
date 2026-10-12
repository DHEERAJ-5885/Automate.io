import React, { useEffect, useState } from 'react';
import { Cpu, Activity, Workflow, ShieldCheck, AlertCircle } from 'lucide-react';
import { HealthResponse } from '../types.ts';

interface NavbarProps {
  onOpenMakeGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMakeGuide }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (isMounted) {
          setHealth(data);
          setHealthLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">Commitment OS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Recovery Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI unfreezer & root-cause resolver for at-risk commitments
            </p>
          </div>
        </div>

        {/* Right side badges & CTA */}
        <div className="flex items-center space-x-3">
          {/* Gemma 4 badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-mono text-violet-300 font-medium">Gemma 4 (26B-A4B-IT)</span>
          </div>

          {/* Health indicator */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs"
            title={health ? `API Healthy • Model: ${health.model}` : 'Checking server health...'}
          >
            <Activity
              className={`h-3.5 w-3.5 ${
                healthLoading ? 'text-amber-400 animate-pulse' : health?.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            />
            <span className="text-slate-400 hidden sm:inline">API:</span>
            <span
              className={`font-medium ${
                healthLoading ? 'text-amber-300' : health?.status === 'healthy' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {healthLoading ? 'Connecting' : health?.status === 'healthy' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Make.com automation trigger button */}
          <button
            onClick={onOpenMakeGuide}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Workflow className="h-3.5 w-3.5" />
            <span>Make.com Webhook</span>
          </button>
        </div>
      </div>
    </header>
  );
};
