import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowUpRight,
  Copy,
  Check,
  Flame,
  Code2,
  Clock,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AnalysisResult, CommitmentInput } from '../types.ts';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  input: CommitmentInput | null;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  analysis,
  input,
  isLoading,
  error,
}) => {
  const [copiedAction, setCopiedAction] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleCopyAction = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.smallestRecoveryAction);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  const handleCopyJson = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(JSON.stringify({ input, analysis }, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
          <Zap className="h-8 w-8 animate-pulse text-indigo-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-slate-100">
            Gemma 4 Deep Commitment Analysis
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Extracting root constraints, evaluating ripple effects on downstream dependencies, and synthesizing the highest-leverage micro-recovery action...
          </p>
        </div>
        <div className="flex justify-center items-center space-x-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping delay-75" />
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping delay-150" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/30 border border-rose-800/60 rounded-2xl p-6 text-rose-200">
        <div className="flex items-start space-x-3">
          <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-300">Analysis Error Encountered</h3>
            <p className="text-xs text-rose-200/90 leading-relaxed">{error}</p>
            <p className="text-[11px] text-rose-300/70 pt-1">
              Note: Commitment OS does not fabricate synthetic results when model execution fails. Please verify your GEMINI_API_KEY environment variable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          Awaiting Commitment Analysis
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Select one of the benchmark presets above or fill out the commitment details to generate root-cause recovery actions powered by Gemma 4.
        </p>
      </div>
    );
  }

  // Visual cues based on status
  const statusStyles = {
    NORMAL: {
      bg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      accent: 'text-emerald-400',
    },
    'AT RISK': {
      bg: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
      accent: 'text-amber-400',
    },
    BLOCKED: {
      bg: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: XCircle,
      accent: 'text-rose-400',
    },
  }[analysis.status];

  const StatusIcon = statusStyles.icon;

  const urgencyColors = {
    LOW: 'bg-slate-800 text-slate-300 border-slate-700',
    MEDIUM: 'bg-blue-950/80 text-blue-300 border-blue-800',
    HIGH: 'bg-amber-950/80 text-amber-300 border-amber-800',
    CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-800',
  }[analysis.urgency];

  return (
    <div className="space-y-4">
      {/* Top Banner: Status, Urgency, Model */}
      <div className={`rounded-2xl border p-5 ${statusStyles.bg} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10">
              <StatusIcon className={`h-6 w-6 ${statusStyles.accent}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Status Evaluation:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusStyles.badge}`}>
                  {analysis.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {input?.commitment || 'Commitment Assessment'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            {/* Urgency Badge */}
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${urgencyColors}`}>
              <Flame className="h-3 w-3" />
              <span>Urgency: {analysis.urgency}</span>
            </div>

            {/* Model identifier */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
              <Cpu className="h-3 w-3 text-violet-400" />
              <span className="font-mono text-violet-300 text-[11px]">{analysis.model}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE: The Smallest Recovery Action (Hero Card) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 p-6 shadow-xl shadow-indigo-950/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Recommended Smallest Recovery Action (Micro-Unfreezer)
            </span>
          </div>

          <button
            onClick={handleCopyAction}
            className="inline-flex items-center space-x-1 text-xs text-indigo-300 hover:text-white px-2.5 py-1 rounded-md bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-800/60 transition cursor-pointer"
            title="Copy action to clipboard"
          >
            {copiedAction ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug my-2 pl-1">
          "{analysis.smallestRecoveryAction}"
        </p>

        <p className="text-xs text-slate-400 pl-1">
          💡 Designed to be executed in under 15 minutes to break inertia, clarify blockers, or unblock team members without waiting for scheduled meetings.
        </p>
      </div>

      {/* Two-column analysis cards: Revised Next Step & Root Blocker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revised Next Step */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
            <span>Revised Next Operational Step</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {analysis.revisedNextStep || 'Proceed with current trajectory once immediate action completes.'}
          </p>
        </div>

        {/* Root Blocker */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Diagnosed Root Blocker</span>
          </div>
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            {analysis.rootBlocker}
          </p>
        </div>
      </div>

      {/* Reasoning & Downstream Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reasoning */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Gemma 4 Diagnostic Reasoning
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {analysis.reasoning}
          </p>
        </div>

        {/* Downstream Impact */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Projected Downstream Ripple Effect
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {analysis.downstreamImpact}
          </p>
        </div>
      </div>

      {/* Metadata & Make.com Payload Inspector */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Analyzed at {new Date(analysis.analyzedAt).toLocaleTimeString()}</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showJson ? 'Hide JSON Output' : 'View Make.com JSON'}</span>
            </button>
            {showJson && (
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {showJson && (
          <div className="mt-2.5 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed shadow-inner">
            <pre>{JSON.stringify({ success: true, input, analysis }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
