import React, { useState } from 'react';
import { Sparkles, Loader2, RotateCcw, AlertTriangle, ArrowRight, User, Calendar, Target, ShieldAlert, GitFork } from 'lucide-react';
import { CommitmentInput, SampleCase } from '../types.ts';
import { SAMPLE_CASES } from '../data/sampleCases.ts';

interface CommitmentFormProps {
  onSubmit: (input: CommitmentInput) => void;
  isLoading: boolean;
  selectedCaseId?: string | null;
  onSelectCase: (sample: SampleCase) => void;
  onClear: () => void;
  formData: CommitmentInput;
  setFormData: React.Dispatch<React.SetStateAction<CommitmentInput>>;
}

export const CommitmentForm: React.FC<CommitmentFormProps> = ({
  onSubmit,
  isLoading,
  selectedCaseId,
  onSelectCase,
  onClear,
  formData,
  setFormData,
}) => {
  const [errors, setErrors] = useState<{ commitment?: string; deadline?: string }>({});

  const validate = (): boolean => {
    const newErrors: { commitment?: string; deadline?: string } = {};
    if (!formData.commitment.trim()) {
      newErrors.commitment = 'Commitment deliverable is required';
    }
    if (!formData.deadline.trim()) {
      newErrors.deadline = 'Target deadline is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CommitmentInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-950/40">
      {/* Sample cases quick presets */}
      <div className="mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              ⚡ Quick Test Presets
            </span>
            <span className="text-[11px] text-slate-400">
              (Evaluate benchmark scenarios)
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Form</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_CASES.map((sample) => {
            const isSelected = selectedCaseId === sample.id;
            const badgeColor =
              sample.statusType === 'NORMAL'
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300 hover:border-emerald-600'
                : sample.statusType === 'AT RISK'
                ? 'bg-amber-950/70 border-amber-800/60 text-amber-300 hover:border-amber-600'
                : 'bg-rose-950/70 border-rose-800/60 text-rose-300 hover:border-rose-600';

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectCase(sample)}
                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${badgeColor} ${
                  isSelected ? 'ring-2 ring-indigo-500/80 shadow-md shadow-indigo-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span>{sample.label}</span>
                  <span className="text-[10px] uppercase font-bold opacity-75">{sample.statusType}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Person / Owner */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Person / Commitment Owner</span>
            </label>
            <input
              type="text"
              value={formData.person}
              onChange={(e) => handleChange('person', e.target.value)}
              placeholder="e.g. Alex Morgan or Core Platform Team"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              disabled={isLoading}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Target Deadline <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              placeholder="e.g. Tomorrow 5:00 PM or 2026-10-15"
              className={`w-full bg-slate-950/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition ${
                errors.deadline ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
              disabled={isLoading}
            />
            {errors.deadline && (
              <p className="text-xs text-rose-400 mt-1 flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{errors.deadline}</span>
              </p>
            )}
          </div>
        </div>

        {/* Commitment Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Target className="h-3.5 w-3.5 text-slate-400" />
            <span>Commitment Deliverable <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="text"
            value={formData.commitment}
            onChange={(e) => handleChange('commitment', e.target.value)}
            placeholder="e.g. Complete Stripe payment elements upgrade for European merchant tier"
            className={`w-full bg-slate-950/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition ${
              errors.commitment ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
            disabled={isLoading}
          />
          {errors.commitment && (
            <p className="text-xs text-rose-400 mt-1 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{errors.commitment}</span>
            </p>
          )}
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Current Progress & Status
          </label>
          <input
            type="text"
            value={formData.currentStatus}
            onChange={(e) => handleChange('currentStatus', e.target.value)}
            placeholder="e.g. Staging build failing 2 edge tests on VAT currency rounding"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stated Blocker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Stated Blocker or Impediment</span>
            </label>
            <textarea
              rows={2}
              value={formData.blocker}
              onChange={(e) => handleChange('blocker', e.target.value)}
              placeholder="e.g. Ambiguity around Euro rounding rules in currency calculation spec"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Dependent Tasks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <GitFork className="h-3.5 w-3.5 text-violet-400" />
              <span>Dependent Tasks & Downstream Stakes</span>
            </label>
            <textarea
              rows={2}
              value={formData.dependentTasks}
              onChange={(e) => handleChange('dependentTasks', e.target.value)}
              placeholder="e.g. EU Merchant invoices rollout, Q4 billing cycle cutover"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Gemma 4 is Analyzing Root Cause & Synthesizing Recovery...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>Recover Commitment with Gemma 4</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
