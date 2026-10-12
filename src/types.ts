export type CommitmentStatus = 'NORMAL' | 'AT RISK' | 'BLOCKED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CommitmentInput {
  person: string;
  commitment: string;
  deadline: string;
  currentStatus: string;
  blocker: string;
  dependentTasks: string;
}

export interface AnalysisResult {
  status: CommitmentStatus;
  rootBlocker: string;
  reasoning: string;
  downstreamImpact: string;
  smallestRecoveryAction: string;
  revisedNextStep: string;
  urgency: UrgencyLevel;
  analyzedAt: string;
  model: string;
}

export interface WebhookStatus {
  attempted: boolean;
  success: boolean;
  commitmentId?: string;
  statusCode?: number;
  message: string;
  error?: string;
  dispatchedAt?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  input: CommitmentInput;
  analysis: AnalysisResult;
  riskScore?: number;
  riskLevel?: string;
  commitmentId?: string;
  webhook?: WebhookStatus;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  model: string;
  hasApiKey?: boolean;
  hasMakeWebhook?: boolean;
  timestamp: string;
}

export interface SampleCase {
  id: string;
  label: string;
  statusType: CommitmentStatus;
  description: string;
  data: CommitmentInput;
}
