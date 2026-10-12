/**
 * @license
 * Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CommitmentForm } from './components/CommitmentForm.tsx';
import { AnalysisDisplay } from './components/AnalysisDisplay.tsx';
import { MakeIntegrationModal } from './components/MakeIntegrationModal.tsx';
import { CommitmentInput, AnalysisResult, SampleCase, AnalyzeResponse } from './types.ts';
import { ShieldCheck, ArrowRight, Github, Heart, Cpu, Sparkles } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState<CommitmentInput>({
    person: '',
    commitment: '',
    deadline: '',
    currentStatus: '',
    blocker: '',
    dependentTasks: '',
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lastInput, setLastInput] = useState<CommitmentInput | null>(null);
  const [riskScore, setRiskScore] = useState<number | undefined>(undefined);
  const [riskLevel, setRiskLevel] = useState<string | undefined>(undefined);
  const [commitmentId, setCommitmentId] = useState<string | undefined>(undefined);
  const [webhookStatus, setWebhookStatus] = useState<AnalyzeResponse['webhook'] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isMakeModalOpen, setIsMakeModalOpen] = useState<boolean>(false);

  const handleSelectCase = (sample: SampleCase) => {
    setSelectedCaseId(sample.id);
    setFormData(sample.data);
    setError(null);
  };

  const handleClear = () => {
    setSelectedCaseId(null);
    setFormData({
      person: '',
      commitment: '',
      deadline: '',
      currentStatus: '',
      blocker: '',
      dependentTasks: '',
    });
    setError(null);
    setAnalysis(null);
    setWebhookStatus(undefined);
  };

  const handleAnalyze = async (input: CommitmentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setAnalysis(data.analysis);
      setLastInput(data.input);
      setRiskScore(data.riskScore);
      setRiskLevel(data.riskLevel);
      setCommitmentId(data.commitmentId);
      setWebhookStatus(data.webhook);
    } catch (err: any) {
      console.error('Failed to analyze commitment:', err);
      setError(err?.message || 'Unable to connect to Gemma 4 recovery engine.');
      setAnalysis(null);
      setWebhookStatus(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar onOpenMakeGuide={() => setIsMakeModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-xs text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Hackathon Edition • Powered by Gemma 4 (gemma-4-26b-a4b-it)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Don't send reminders.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Recover commitments.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            When commitments stall, passive notifications fail. Commitment OS analyzes root blockers, calculates ripple impacts, and prescribes the{' '}
            <strong className="text-slate-200 font-semibold">smallest high-leverage micro-recovery action</strong>{' '}
            to unfreeze execution.
          </p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Presets (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <CommitmentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAnalyze}
              isLoading={isLoading}
              selectedCaseId={selectedCaseId}
              onSelectCase={handleSelectCase}
              onClear={handleClear}
            />
          </div>

          {/* Right Column: AI Recovery Results (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <AnalysisDisplay
              analysis={analysis}
              input={lastInput}
              riskScore={riskScore}
              riskLevel={riskLevel}
              commitmentId={commitmentId}
              webhook={webhookStatus}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Commitment OS</span>
            <span>— Open-source AI Commitment Recovery Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <button
              onClick={() => setIsMakeModalOpen(true)}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Make.com Webhook Spec
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400">Model: gemma-4-26b-a4b-it</span>
            <span>•</span>
            <span className="text-slate-400">Apache-2.0 License</span>
          </div>
        </div>
      </footer>

      {/* Make.com Integration Guide Modal */}
      <MakeIntegrationModal
        isOpen={isMakeModalOpen}
        onClose={() => setIsMakeModalOpen(false)}
      />
    </div>
  );
}
