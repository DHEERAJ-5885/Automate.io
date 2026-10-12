/**
 * Commitment OS — Backend Make.com Webhook Dispatcher
 * Dispatches real commitment recovery evaluations to Make.com
 */

import { CommitmentInput, AnalysisResult, UrgencyLevel, CommitmentStatus } from '../src/types.ts';

export interface WebhookDispatchResult {
  attempted: boolean;
  success: boolean;
  commitmentId?: string;
  statusCode?: number;
  message: string;
  error?: string;
  dispatchedAt?: string;
}

export interface MakeWebhookPayload {
  // Identification & Timestamps
  commitmentId: string;
  createdAt: string;

  // Real user input fields
  person: string;
  commitment: string;
  deadline: string;
  currentStatus: string;
  blocker: string;
  dependentTasks: string;

  // Mapped risk metrics
  riskLevel: string;
  riskScore: number;
  rootCause: string;
  impact: string;
  recoveryPlan: string;
  revisedNextStep: string;
  urgency: UrgencyLevel;

  // Complete raw AI analysis object
  analysis: AnalysisResult;
}

/**
 * Calculates a standardized risk score (0-100) and risk level from status and urgency
 */
export function calculateRiskMetrics(status: CommitmentStatus, urgency: UrgencyLevel): { riskScore: number; riskLevel: string } {
  let baseScore = 20;
  if (status === 'BLOCKED') {
    baseScore = 90;
  } else if (status === 'AT RISK') {
    baseScore = 60;
  } else {
    baseScore = 15;
  }

  // Urgency modifier
  let urgencyModifier = 0;
  if (urgency === 'CRITICAL') urgencyModifier = 10;
  else if (urgency === 'HIGH') urgencyModifier = 5;
  else if (urgency === 'LOW') urgencyModifier = -5;

  const riskScore = Math.min(100, Math.max(0, baseScore + urgencyModifier));

  let riskLevel = 'LOW';
  if (riskScore >= 80) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 40) riskLevel = 'MEDIUM';

  return { riskScore, riskLevel };
}

/**
 * Formats user input and AI analysis into the canonical Make.com payload
 */
export function buildMakePayload(
  input: CommitmentInput,
  analysis: AnalysisResult,
  commitmentId?: string
): MakeWebhookPayload {
  const id = commitmentId || `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const { riskScore, riskLevel } = calculateRiskMetrics(analysis.status, analysis.urgency);

  return {
    commitmentId: id,
    createdAt: new Date().toISOString(),
    person: input.person,
    commitment: input.commitment,
    deadline: input.deadline,
    currentStatus: input.currentStatus,
    blocker: input.blocker,
    dependentTasks: input.dependentTasks,
    riskLevel,
    riskScore,
    rootCause: analysis.rootBlocker,
    impact: analysis.downstreamImpact,
    recoveryPlan: analysis.smallestRecoveryAction,
    revisedNextStep: analysis.revisedNextStep,
    urgency: analysis.urgency,
    analysis,
  };
}

/**
 * Dispatches the formatted payload to Make.com webhook if configured.
 * Safely handles network errors, timeouts, and non-2xx responses without exposing secret tokens.
 */
export async function dispatchToMakeWebhook(
  input: CommitmentInput,
  analysis: AnalysisResult,
  commitmentId?: string,
  customWebhookUrl?: string
): Promise<WebhookDispatchResult> {
  const webhookUrl = customWebhookUrl || process.env.MAKE_WEBHOOK_URL;

  // If no webhook URL is configured, report honestly without failing the AI analysis
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      attempted: false,
      success: false,
      message: 'MAKE_WEBHOOK_URL is not configured on the backend. Skipped automation trigger.',
    };
  }

  // Validate URL protocol
  try {
    const parsed = new URL(webhookUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        attempted: false,
        success: false,
        message: 'Invalid MAKE_WEBHOOK_URL protocol. Must be http or https.',
      };
    }
  } catch (err) {
    return {
      attempted: false,
      success: false,
      message: 'Invalid MAKE_WEBHOOK_URL format.',
    };
  }

  const payload = buildMakePayload(input, analysis, commitmentId);

  // Network timeout using AbortController (8 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Commitment-OS/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        attempted: true,
        success: true,
        commitmentId: payload.commitmentId,
        statusCode: response.status,
        dispatchedAt: payload.createdAt,
        message: `Successfully dispatched payload to Make.com webhook (Status ${response.status}).`,
      };
    } else {
      const errorText = await response.text().catch(() => '');
      const sanitizedSnippet = errorText.slice(0, 150).replace(/[<>{}]/g, '');
      return {
        attempted: true,
        success: false,
        commitmentId: payload.commitmentId,
        statusCode: response.status,
        message: `Make.com webhook responded with HTTP ${response.status}`,
        error: sanitizedSnippet || `HTTP error ${response.status}`,
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError' || err?.code === 'ABORT_ERR';
    const errorMessage = isTimeout
      ? 'Webhook request timed out after 8000ms.'
      : err?.message || 'Unknown network error dispatching to webhook.';

    console.warn(`[Make.com Webhook] Dispatch error: ${errorMessage}`);

    return {
      attempted: true,
      success: false,
      commitmentId: payload.commitmentId,
      message: 'Failed to communicate with Make.com webhook.',
      error: errorMessage,
    };
  }
}
