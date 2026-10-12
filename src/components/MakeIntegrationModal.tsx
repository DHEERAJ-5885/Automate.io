import React, { useState } from 'react';
import { X, Copy, Check, Workflow, Globe, ArrowRight, ExternalLink, Terminal, ShieldCheck, Zap } from 'lucide-react';

interface MakeIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MakeIntegrationModal: React.FC<MakeIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://automate-io.onrender.com';
  const endpointUrl = `${origin}/api/analyze`;
  const healthUrl = `${origin}/api/health`;

  const canonicalMakePayload = {
    commitmentId: "cmt_1728719283_ab3x",
    createdAt: "2026-10-12T01:50:00.000Z",
    person: "Elena Rostova",
    commitment: "Ship Stripe payment elements upgrade for European merchant tier",
    deadline: "Tomorrow at 12:00 PM",
    currentStatus: "In progress, failing 2 edge tests on VAT currency rounding",
    blocker: "Ambiguity around Euro rounding rules in currency calculation spec",
    dependentTasks: "EU Merchant invoices rollout, Q4 billing cycle cutover",
    riskLevel: "HIGH",
    riskScore: 65,
    rootCause: "Unclear specification for Euro rounding in VAT tax calculations",
    impact: "EU merchant invoices cannot be finalized, blocking Q4 billing cycle cutover",
    recoveryPlan: "Ping the product manager with the 2 failing edge cases to get approval for banker's rounding",
    revisedNextStep: "Implement the agreed rounding rule and rerun the staging integration test suite",
    urgency: "HIGH",
    analysis: {
      status: "AT RISK",
      rootBlocker: "Unclear specification for Euro rounding in VAT tax calculations",
      smallestRecoveryAction: "Ping the product manager with the 2 failing edge cases to get approval for banker's rounding",
      urgency: "HIGH",
      model: "gemma-4-26b-a4b-it"
    }
  };

  const curlCommand = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "person": "Elena Rostova",
    "commitment": "Ship Stripe payment elements upgrade for European merchant tier",
    "deadline": "Tomorrow at 12:00 PM",
    "currentStatus": "In progress, failing 2 edge tests on VAT currency rounding",
    "blocker": "Ambiguity around Euro rounding rules in currency calculation spec",
    "dependentTasks": "EU Merchant invoices rollout, Q4 billing cycle cutover"
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(canonicalMakePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Make.com Webhook Integration Guide</h2>
              <p className="text-xs text-slate-400">
                End-to-end integration: Website Form → Gemma 4 → Make.com → Sheets & Gmail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workflow Overview */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>How The Seamless Hackathon Workflow Operates</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            1. <strong>User Submits Form:</strong> The user fills out a commitment deliverable on the web application.
          </p>
          <p className="text-slate-300 leading-relaxed">
            2. <strong>Server AI Analysis:</strong> The backend executes <strong>Gemma 4</strong> to calculate the root cause, downstream impact, risk score, and smallest recovery action.
          </p>
          <p className="text-slate-300 leading-relaxed">
            3. <strong>Automatic Webhook Trigger:</strong> If <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">MAKE_WEBHOOK_URL</code> is set in Render, the backend immediately POSTs the complete analysis to Make.com.
          </p>
          <p className="text-slate-300 leading-relaxed">
            4. <strong>Downstream Execution:</strong> Make.com captures the payload and automatically appends a row to <strong>Google Sheets</strong> and delivers alerts to <strong>Gmail</strong>.
          </p>
        </div>

        {/* Canonical Webhook Payload Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Payload Delivered to Make.com Webhook</span>
            </span>
            <button
              onClick={handleCopyPayload}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer transition"
            >
              {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPayload ? 'Copied' : 'Copy Payload JSON'}</span>
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-slate-300 max-h-48">
            <pre>{JSON.stringify(canonicalMakePayload, null, 2)}</pre>
          </div>
        </div>

        {/* Backend Environment Variable Setup */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Render Deployment Environment Variable
          </h3>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono text-slate-200">
              <span className="text-indigo-400">MAKE_WEBHOOK_URL</span> = https://hook.eu1.make.com/your-custom-webhook-id
            </div>
            <p className="text-slate-400 text-[11px] pt-1">
              Add this in your Render Dashboard under <strong>Environment</strong>. The backend automatically picks it up and fires whenever a commitment is analyzed.
            </p>
          </div>
        </div>

        {/* Available Endpoints */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Direct API Endpoints
          </h3>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mr-2">
                  POST
                </span>
                <span className="text-slate-200">{endpointUrl}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-sans">AI Recovery & Auto-Dispatch</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mr-2">
                  GET
                </span>
                <span className="text-slate-200">{healthUrl}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-sans">Service Health Check</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
