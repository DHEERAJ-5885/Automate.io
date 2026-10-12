import React, { useState } from 'react';
import { X, Copy, Check, Workflow, Globe, ArrowRight, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

interface MakeIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MakeIntegrationModal: React.FC<MakeIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.run.app';
  const endpointUrl = `${origin}/api/analyze`;
  const healthUrl = `${origin}/api/health`;

  const samplePayload = {
    person: "Elena Rostova",
    commitment: "Ship Stripe payment elements upgrade for European merchant tier",
    deadline: "Tomorrow at 12:00 PM",
    currentStatus: "In progress, failing 2 edge tests on VAT currency rounding",
    blocker: "Ambiguity around Euro rounding rules in currency calculation spec",
    dependentTasks: "EU Merchant invoices rollout, Q4 billing cycle cutover"
  };

  const curlCommand = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
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
                Direct compatibility with your Google Sheets & Gmail alert scenarios
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
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>How It Fits Your Existing Make.com Workflow</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            In your Make.com scenario, insert an <strong>HTTP "Make a request"</strong> module right after your trigger (webhook, form, or schedule). Send the commitment fields to Commitment OS.
            Commitment OS executes <strong>Gemma 4</strong> and returns the structured recovery decision, enabling your downstream Google Sheets recorder and Gmail alert steps.
          </p>
        </div>

        {/* Endpoints */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available Server Endpoints
          </h3>
          
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mr-2">
                  POST
                </span>
                <span className="text-slate-200">{endpointUrl}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-sans">Commitment Recovery Analysis</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mr-2">
                  GET
                </span>
                <span className="text-slate-200">{healthUrl}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-sans">Service Health Check</span>
            </div>
          </div>
        </div>

        {/* Make.com HTTP Module Setup */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Make.com HTTP Module Settings
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">URL</span>
              <span className="font-mono text-indigo-300 break-all">{endpointUrl}</span>
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Method</span>
              <span className="font-semibold text-emerald-400">POST</span>
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Headers</span>
              <span className="font-mono text-slate-200">Content-Type: application/json</span>
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Parse response</span>
              <span className="font-semibold text-cyan-400">Yes (returns structured JSON)</span>
            </li>
          </ul>
        </div>

        {/* cURL Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>cURL Test Command</span>
            </span>
            <button
              onClick={handleCopyCurl}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer transition"
            >
              {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-x-auto text-[11px] font-mono text-slate-300">
            <pre>{curlCommand}</pre>
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
