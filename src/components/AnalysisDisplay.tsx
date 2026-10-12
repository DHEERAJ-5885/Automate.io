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
  Workflow,
  ShieldAlert,
  Info,
  Radio,
} from 'lucide-react';
import { AnalysisResult, CommitmentInput, WebhookStatus } from '../types.ts';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  input: CommitmentInput | null;
  riskScore?: number;
  riskLevel?: string;
  commitmentId?: string;
  webhook?: WebhookStatus;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  analysis,
  input,
  riskScore,
  riskLevel,
  commitmentId,
  webhook,
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

  const canonicalPayload = analysis && input ? {
    commitmentId: commitmentId || `cmt_${Date.now()}`,
    createdAt: analysis.analyzedAt,
    person: input.person,
    commitment: input.commitment,
    deadline: input.deadline,
    currentStatus: input.currentStatus,
    blocker: input.blocker,
    dependentTasks: input.dependentTasks,
    riskLevel: riskLevel || (analysis.status === 'BLOCKED' ? 'CRITICAL' : analysis.status === 'AT RISK' ? 'HIGH' : 'LOW'),
    riskScore: riskScore ?? (analysis.status === 'BLOCKED' ? 90 : analysis.status === 'AT RISK' ? 65 : 20),
    rootCause: analysis.rootBlocker,
    impact: analysis.downstreamImpact,
    recoveryPlan: analysis.smallestRecoveryAction,
    revisedNextStep: analysis.revisedNextStep,
    urgency: analysis.urgency,
    analysis,
    webhookStatus: webhook || { attempted: false, success: false, message: 'Unconfigured' },
  } : null;

  const handleCopyJson = () => {
    if (!canonicalPayload) return;
    navigator.clipboard.writeText(JSON.stringify(canonicalPayload, null, 2));
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
            Gemma 4 Deep Commitment Analysis & Automation Dispatch
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Extracting root constraints, calculating risk score, synthesizing micro-recovery action, and preparing Make.com webhook dispatch...
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
              Note: Commitment OS preserves system reliability and does not fabricate fake outputs. Check GEMINI_API_KEY environment variable.
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
          Awaiting Commitment Submission
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Submit your commitment deliverable or pick a benchmark preset to generate a Gemma 4 diagnosis and trigger the Make.com recovery workflow.
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

  const calculatedRiskScore = riskScore ?? (analysis.status === 'BLOCKED' ? 90 : analysis.status === 'AT RISK' ? 65 : 20);
  const calculatedRiskLevel = riskLevel ?? (analysis.status === 'BLOCKED' ? 'CRITICAL' : analysis.status === 'AT RISK' ? 'HIGH' : 'LOW');

  return (
    <div className="space-y-4">
      {/* Top Banner: Status, Urgency, Risk Score, Model */}
      <div className={`rounded-2xl border p-5 ${statusStyles.bg} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-950/40 border border-white/10">
              <StatusIcon className={`h-6 w-6 ${statusStyles.accent}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Status:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusStyles.badge}`}>
                  {analysis.status}
                </span>

                {/* Risk Score Pill */}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                  Risk Score: <strong className="text-cyan-300">{calculatedRiskScore}/100</strong> ({calculatedRiskLevel})
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
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

      {/* MAKE.COM AUTOMATION STATUS BANNER */}
      {webhook && (
        <div
          className={`rounded-xl border p-4 text-xs transition-all ${
            webhook.attempted && webhook.success
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              : webhook.attempted && !webhook.success
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-white/10 shrink-0 mt-0.5">
              <Workflow
                className={`h-4 w-4 ${
                  webhook.attempted && webhook.success
                    ? 'text-emerald-400'
                    : webhook.attempted
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <span>
                    {webhook.attempted && webhook.success
                      ? '⚡ Make.com Webhook Dispatched'
                      : webhook.attempted
                      ? '⚠️ Make.com Webhook Notice'
                      : 'ℹ️ Make.com Automation Standalone Mode'}
                  </span>
                  {webhook.statusCode && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      HTTP {webhook.statusCode}
                    </span>
                  )}
                </span>
                {commitmentId && (
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {commitmentId}
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {webhook.message}
                {webhook.error && <span className="block text-rose-300 mt-0.5">Detail: {webhook.error}</span>}
              </p>
              {webhook.attempted && webhook.success && (
                <p className="text-[10px] text-emerald-400/90 pt-0.5 flex items-center space-x-1">
                  <Check className="h-3 w-3" />
                  <span>Real payload delivered to Make.com scenario → Google Sheets & Gmail pipelines active.</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
            <span>Diagnosed Root Blocker (Underlying Constraint)</span>
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
              <span>{showJson ? 'Hide Make.com JSON' : 'Inspect Make.com Webhook Payload'}</span>
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

        {showJson && canonicalPayload && (
          <div className="mt-2.5 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed shadow-inner">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-sans font-semibold">
              Canonical Payload Format Sent To Make.com Webhook
            </div>
            <pre>{JSON.stringify(canonicalPayload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
