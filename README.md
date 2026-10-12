# Commitment OS — AI Commitment Recovery Engine

> **Don't just nag with reminders. Recover commitments before they fail.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Model](https://img.shields.io/badge/AI_Model-Gemma_4_(26B--A4B--IT)-purple.svg)](https://ai.google.dev/)
[![Stack](https://img.shields.io/badge/Stack-Node.js_•_Express_•_React_19_•_Vite-green.svg)](https://vitejs.dev/)
[![Deployment](https://img.shields.io/badge/Deploy-Render_•_Docker_•_Node-46E3B7.svg)](https://render.com/)

**Commitment OS** is a commitment recovery and unfreezing system designed for engineering teams and hackathon demonstration. While traditional productivity tools spam passive deadline notifications, Commitment OS analyzes the underlying constraints causing stall, isolates the root blocker, calculates downstream ripple effects, and prescribes the **smallest micro-recovery action** (5–15 minutes) to break inertia.

It seamlessly connects directly into **Make.com**, auto-dispatching AI-evaluated deliverables straight to **Google Sheets** and **Gmail** alert pipelines without requiring manual curl commands or developer terminals.

---

## 🏗️ Architecture & Workflow

```
┌─────────────────────────┐
│   Website User Form     │ (Web browser: enters owner, deliverable, deadline, blockers)
└────────────┬────────────┘
             │ HTTP POST /api/analyze
             ▼
┌─────────────────────────┐
│  Express Server Engine  │ (Node.js runtime, validation, duplicate-submission guard)
└────────────┬────────────┘
             │ Prompt synthesis
             ▼
┌─────────────────────────┐
│     Gemma 4 (26B)       │ (gemma-4-26b-a4b-it via @google/genai SDK)
│   AI Recovery Engine    │ ➔ Diagnoses root blocker, downstream impact, recovery action
└────────────┬────────────┘
             │ Structured Recovery Result + Risk Metrics
             ▼
┌─────────────────────────┐
│ Make.com Dispatcher     │ (Checks process.env.MAKE_WEBHOOK_URL)
└────────────┬────────────┘
             │ HTTP POST (timeout 8s, retry-resilient, sanitized)
             ▼
┌─────────────────────────┐
│    Make.com Scenario    │
├─────────────────────────┤
│ 1. Webhook Trigger      │
│ 2. Google Sheets Record │ ➔ Appends audit row (Commitment ID, Risk Score, Recovery Plan)
│ 3. Gmail Alert Module   │ ➔ Sends targeted escalation email to stakeholder
└─────────────────────────┘
```

---

## 🚀 Key Features

1. **Gemma 4 Intelligence**: Evaluates commitments using Google's **Gemma 4** model (`gemma-4-26b-a4b-it`) via the `@google/genai` TypeScript SDK.
2. **Actionable Micro-Unfreezing**: Replaces anxiety-inducing reminders with a single high-leverage 5–15 minute micro-step.
3. **Automated Make.com Webhook Integration**: A user submits on the web interface, and the backend automatically analyzes and forwards the full evaluation to Make.com without touching a terminal.
4. **Honest Automation Reporting**: The UI clearly displays whether the webhook succeeded, failed, or ran in standalone mode—never falsely claiming spreadsheet or email delivery unless verified.
5. **Three Benchmark Presets**: One-click benchmark tests for `NORMAL`, `AT RISK`, and `BLOCKED` states.
6. **Fault Tolerance & Circular Recursion Guards**: Webhook failures never crash the AI analysis. Requests originating from Make.com or flagged with `x-skip-webhook` skip re-triggering to prevent infinite loops.

---

## 🔌 API Reference

### 1. Health Check
`GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Commitment OS — AI Commitment Recovery Engine",
  "model": "gemma-4-26b-a4b-it",
  "hasApiKey": true,
  "hasMakeWebhook": true,
  "timestamp": "2026-10-12T09:00:41.590Z"
}
```

---

### 2. Commitment Recovery Analysis & Webhook Dispatch
`POST /api/analyze`

#### Request Body
```json
{
  "person": "Nadia Al-Mansoor",
  "commitment": "Deploy zero-downtime database migration for enterprise billing",
  "deadline": "Today at 5:00 PM",
  "currentStatus": "Blocked on connection pool starvation in replica cluster",
  "blocker": "Database connection pool exhausted under read load",
  "dependentTasks": "Q4 billing cycle run, executive revenue report"
}
```

*Required fields:* `commitment` (or `task`/`title`), `deadline` (or `dueDate`).

#### Response Body
```json
{
  "success": true,
  "commitmentId": "cmt_1791795676440_7loxp6",
  "riskLevel": "CRITICAL",
  "riskScore": 100,
  "input": {
    "person": "Nadia Al-Mansoor",
    "commitment": "Deploy zero-downtime database migration for enterprise billing",
    "deadline": "Today at 5:00 PM",
    "currentStatus": "Blocked on connection pool starvation in replica cluster",
    "blocker": "Database connection pool exhausted under read load",
    "dependentTasks": "Q4 billing cycle run, executive revenue report"
  },
  "analysis": {
    "status": "BLOCKED",
    "rootBlocker": "Insufficient connection pool capacity in replica cluster under read-heavy workloads",
    "reasoning": "The deployment cannot proceed because the database cannot handle the existing read load, leading to connection starvation.",
    "downstreamImpact": "Stalls the Q4 billing cycle run and delays delivery of the executive revenue report.",
    "smallestRecoveryAction": "Post a 3-line alert in #sre-oncall with the connection error log and replica cluster ID to request an immediate capacity bump.",
    "revisedNextStep": "Verify connection pool headroom and re-initiate migration deployment.",
    "urgency": "CRITICAL",
    "analyzedAt": "2026-10-12T09:01:16.440Z",
    "model": "gemma-4-26b-a4b-it"
  },
  "webhook": {
    "attempted": true,
    "success": true,
    "commitmentId": "cmt_1791795676440_7loxp6",
    "statusCode": 200,
    "dispatchedAt": "2026-10-12T09:01:16.440Z",
    "message": "Successfully dispatched payload to Make.com webhook (Status 200)."
  }
}
```

---

## 📦 Canonical Payload Sent to Make.com Webhook

When `MAKE_WEBHOOK_URL` is configured, the server transmits this standardized JSON payload to your Make.com Custom Webhook:

```json
{
  "commitmentId": "cmt_1791795676440_7loxp6",
  "createdAt": "2026-10-12T09:01:16.440Z",
  "person": "Nadia Al-Mansoor",
  "commitment": "Deploy zero-downtime database migration for enterprise billing",
  "deadline": "Today at 5:00 PM",
  "currentStatus": "Blocked on connection pool starvation in replica cluster",
  "blocker": "Database connection pool exhausted under read load",
  "dependentTasks": "Q4 billing cycle run, executive revenue report",
  "riskLevel": "CRITICAL",
  "riskScore": 100,
  "rootCause": "Insufficient connection pool capacity in replica cluster under read-heavy workloads",
  "impact": "Stalls the Q4 billing cycle run and delays delivery of the executive revenue report.",
  "recoveryPlan": "Post a 3-line alert in #sre-oncall with the connection error log and replica cluster ID to request an immediate capacity bump.",
  "revisedNextStep": "Verify connection pool headroom and re-initiate migration deployment.",
  "urgency": "CRITICAL",
  "analysis": { ... }
}
```

---

## 🛠️ Make.com Scenario Configuration

Your Make.com scenario can be configured in two ways:

### Recommended: Direct Webhook Stream (No Redundant API Call)
1. **Custom Webhook**: Receives the payload directly from Commitment OS.
2. **Google Sheets (Add a Row)**:
   - Map `commitmentId` ➔ Column A
   - Map `person` ➔ Column B
   - Map `commitment` ➔ Column C
   - Map `riskLevel` & `riskScore` ➔ Column D & E
   - Map `recoveryPlan` ➔ Column F
3. **Router**:
   - Filter `riskLevel = CRITICAL` or `riskLevel = HIGH`
4. **Gmail (Send an Email)**:
   - Subject: `🚨 Commitment Recovery Alert: {{commitment}} ({{riskLevel}} Risk)`
   - Body: `Immediate Recovery Action: {{recoveryPlan}}`

*(Because Commitment OS already ran Gemma 4 and attached the complete recovery plan, your Make.com scenario does not need an HTTP module to call `/api/analyze` a second time!)*

---

## 🚀 Render Deployment Guide

### 1. Environment Variables in Render Dashboard
Navigate to your Web Service on [Render](https://dashboard.render.com/) ➔ **Environment**:

| Key | Value / Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio API key | **Yes** |
| `MAKE_WEBHOOK_URL` | Your Make.com Custom Webhook URL (e.g. `https://hook.eu1.make.com/...`) | **Yes** (for automation) |
| `GEMMA_MODEL` | `gemma-4-26b-a4b-it` (default) | Optional |
| `PORT` | `3000` (or leave default) | Optional |
| `NODE_ENV` | `production` | Recommended |

### 2. Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## 🧪 Automated Testing

Commitment OS includes automated end-to-end and unit test suites:

```bash
# Run both integration and Gemma 4 test suites
npm test

# Run webhook & payload integration tests only
npm run test:integration

# Run live Gemma 4 model evaluation tests only
npm run test:analyze
```

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.
