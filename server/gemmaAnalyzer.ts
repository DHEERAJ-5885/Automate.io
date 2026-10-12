import { GoogleGenAI } from '@google/genai';
import { CommitmentInput, AnalysisResult, CommitmentStatus, UrgencyLevel } from '../src/types.ts';

const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

export async function analyzeCommitmentWithGemma(input: CommitmentInput): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.MY_GEMMA_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Google AI Studio provides this automatically at runtime.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are Commitment OS — an advanced AI Commitment Recovery Engine.
Your objective is NOT merely to send passive reminders, but to recover commitments that are at risk of failure by uncovering the root blocker, projecting downstream impact, and prescribing the SMALLEST possible immediate recovery action that unfreezes progress.

Analyze this commitment data thoroughly:
- Person / Owner: ${input.person || 'Unspecified'}
- Commitment: ${input.commitment}
- Deadline: ${input.deadline}
- Current Status: ${input.currentStatus || 'Not specified'}
- Stated Blocker: ${input.blocker || 'None stated'}
- Dependent Tasks / Downstream Stakeholders: ${input.dependentTasks || 'None specified'}

EVALUATION RULES:
1. "status" MUST be one of: "NORMAL", "AT RISK", or "BLOCKED".
   - BLOCKED: Progress cannot continue without an external decision, resource, or dependency resolution.
   - AT RISK: Progress is technically possible but timeline, complexity, or emerging bugs threaten the deadline.
   - NORMAL: On track, achievable within time, no significant blockers.
2. "rootBlocker": The true underlying cause, unmasked from the stated symptoms. If no blocker, state "No blockers identified".
3. "reasoning": 2-3 sentences explaining why this commitment is classified into this status, balancing urgency and feasibility.
4. "downstreamImpact": Concrete explanation of what or who breaks or stalls if this commitment fails or slips.
5. "smallestRecoveryAction": An ultra-concrete, low-friction micro-action (5 to 15 minutes) that the owner or teammate can do RIGHT NOW to break inertia (e.g., "Schedule a 10-minute huddle with X", "Post a 2-line blocker message in #eng-leads", "Submit draft PR with mock response").
6. "revisedNextStep": The operational next milestone after the smallest recovery action is done.
7. "urgency" MUST be one of: "LOW", "MEDIUM", "HIGH", or "CRITICAL".

You MUST reply ONLY with a single valid JSON object. Do not include introductory text, conversational chatter, or markdown formatting outside the JSON.
Required JSON format:
{
  "status": "NORMAL" | "AT RISK" | "BLOCKED",
  "rootBlocker": "...",
  "reasoning": "...",
  "downstreamImpact": "...",
  "smallestRecoveryAction": "...",
  "revisedNextStep": "...",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}`;

  let lastError: any = null;
  let text = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMMA_MODEL,
        contents: prompt,
      });
      text = response.text || '';
      if (text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      if (attempt < 3) {
        // Wait 1.5s then 3s before retrying
        await new Promise((res) => setTimeout(res, attempt * 1500));
      }
    }
  }

  if (!text) {
    throw new Error(
      `Gemma 4 model analysis failed after 3 attempts. ${
        lastError?.message ? `Details: ${lastError.message}` : 'Model returned empty response.'
      }`
    );
  }

  // Parse JSON cleanly even if wrapped in markdown code blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse structured JSON from Gemma 4 response. Raw output: ${text.slice(0, 300)}`);
  }

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error(`Invalid JSON returned by Gemma 4: ${(err as Error).message}. Raw output: ${text.slice(0, 300)}`);
  }

  // Validate and normalize status
  let status: CommitmentStatus = 'NORMAL';
  const rawStatus = String(parsed.status || '').toUpperCase().trim();
  if (rawStatus.includes('BLOCK')) {
    status = 'BLOCKED';
  } else if (rawStatus.includes('RISK')) {
    status = 'AT RISK';
  } else if (rawStatus.includes('NORM') || rawStatus.includes('TRACK')) {
    status = 'NORMAL';
  } else {
    status = 'AT RISK';
  }

  // Validate and normalize urgency
  let urgency: UrgencyLevel = 'MEDIUM';
  const rawUrgency = String(parsed.urgency || '').toUpperCase().trim();
  if (rawUrgency === 'CRITICAL' || rawUrgency === 'HIGH' || rawUrgency === 'LOW') {
    urgency = rawUrgency as UrgencyLevel;
  } else {
    urgency = status === 'BLOCKED' ? 'CRITICAL' : status === 'AT RISK' ? 'HIGH' : 'LOW';
  }

  const result: AnalysisResult = {
    status,
    rootBlocker: String(parsed.rootBlocker || input.blocker || 'None identified').trim(),
    reasoning: String(parsed.reasoning || '').trim(),
    downstreamImpact: String(parsed.downstreamImpact || 'Dependent tasks may be delayed.').trim(),
    smallestRecoveryAction: String(parsed.smallestRecoveryAction || '').trim(),
    revisedNextStep: String(parsed.revisedNextStep || '').trim(),
    urgency,
    analyzedAt: new Date().toISOString(),
    model: GEMMA_MODEL,
  };

  return result;
}
