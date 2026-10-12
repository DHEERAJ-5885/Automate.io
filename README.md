# Commitment OS — AI Commitment Recovery Engine

> **Don't just nag with reminders. Recover commitments before they fail.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Model](https://img.shields.io/badge/AI_Model-Gemma_4_(26B--A4B--IT)-purple.svg)](https://ai.google.dev/)
[![Stack](https://img.shields.io/badge/Stack-Node.js_•_Express_•_React_•_Vite-green.svg)](https://vitejs.dev/)

**Commitment OS** is an open-source commitment recovery system built for hackathons and production workflows. While existing productivity tools spam passive deadline notifications, Commitment OS diagnoses why a commitment is stalling, isolates the true root blocker, calculates downstream ripple effects, and prescribes the **smallest micro-recovery action** to unfreeze progress in under 15 minutes.

---

## 🚀 Key Features

1. **Gemma 4 Intelligence**: Evaluates commitments using Google's **Gemma 4** model (`gemma-4-26b-a4b-it`) via `@google/genai` TypeScript SDK.
2. **Actionable Micro-Unfreezing**: Replaces anxiety-inducing reminders with a single high-leverage 5–15 minute micro-step.
3. **Automated Make.com & Webhook Compatibility**: Includes a high-throughput, CORS-enabled `POST /api/analyze` endpoint ready to plug into Make.com, Zapier, Google Sheets, and Gmail alerts.
4. **Three Benchmark Presets**: One-click benchmark tests for `NORMAL`, `AT RISK`, and `BLOCKED` states.
5. **No Hallucinated Fallbacks**: Enforces strict input validation and server-side model error handling—never fabricates synthetic results when model calls fail.

---

## 🧠 Gemma 4 Model Details

- **Model Identifier**: `gemma-4-26b-a4b-it`
- **Model Family**: Gemma 4 (26B Parameter MoE Instruction-Tuned)
- **SDK**: `@google/genai` v2.4+
- **Telemetry Header**: User-Agent `aistudio-build`

Commitment OS configures Gemma 4 server-side with structured JSON output instructions, extracting status classifications, root causes, downstream impacts, and immediate recovery steps.

---

## 🔌 API Endpoints & Make.com Integration

### 1. Health Check
`GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Commitment OS — AI Commitment Recovery Engine",
  "model": "gemma-4-26b-a4b-it",
  "hasApiKey": true,
  "timestamp": "2026-10-12T06:33:40.000Z"
}
```

---

### 2. Commitment Recovery Analysis
`POST /api/analyze`

Accepts flexible field names so your Make.com scenario does not require custom data transformations:

#### Request Body
```json
{
  "person": "Elena Rostova",
  "commitment": "Ship Stripe payment elements upgrade for European merchant tier",
  "deadline": "Tomorrow at 12:00 PM",
  "currentStatus": "In progress, failing 2 edge tests on VAT currency rounding",
  "blocker": "Ambiguity around Euro rounding rules in currency calculation spec",
  "dependentTasks": "EU Merchant invoices rollout, Q4 billing cycle cutover"
}
```

*Required fields:* `commitment` (or `task`/`title`), `deadline` (or `dueDate`).

#### Response Body
```json
{
  "success": true,
  "input": {
    "person": "Elena Rostova",
    "commitment": "Ship Stripe payment elements upgrade for European merchant tier",
    "deadline": "Tomorrow at 12:00 PM",
    "currentStatus": "In progress, failing 2 edge tests on VAT currency rounding",
    "blocker": "Ambiguity around Euro rounding rules in currency calculation spec",
    "dependentTasks": "EU Merchant invoices rollout, Q4 billing cycle cutover"
  },
  "analysis": {
    "status": "AT RISK",
    "rootBlocker": "Unclear specification for Euro rounding in VAT tax calculations",
    "reasoning": "With only 24 hours left before the deadline, active test failures on financial calculations present severe regression danger.",
    "downstreamImpact": "Invoices for EU merchants cannot be finalized, blocking Q4 billing cycle cutover.",
    "smallestRecoveryAction": "Ping the product manager with the 2 failing edge cases to get approval for banker's rounding.",
    "revisedNextStep": "Implement the agreed rounding rule and rerun the staging integration test suite.",
    "urgency": "HIGH",
    "analyzedAt": "2026-10-12T06:33:45.000Z",
    "model": "gemma-4-26b-a4b-it"
  }
}
```

---

## 🛠️ Make.com Automation Setup

To connect Commitment OS to your existing Make.com scenario:

1. Add an **HTTP — Make a request** module in Make.com.
2. Configure:
   - **URL**: `https://<YOUR_APP_URL>/api/analyze`
   - **Method**: `POST`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body type**: `Raw`
   - **Content type**: `JSON (application/json)`
   - **Request content**:
     ```json
     {
       "person": "{{1.person_name}}",
       "commitment": "{{1.commitment}}",
       "deadline": "{{1.deadline}}",
       "currentStatus": "{{1.status}}",
       "blocker": "{{1.blockers}}",
       "dependentTasks": "{{1.dependent_tasks}}"
     }
     ```
   - **Parse response**: `Yes`
3. Map the returned `analysis.status`, `analysis.smallestRecoveryAction`, and `analysis.rootBlocker` to your downstream **Google Sheets** recorder or **Gmail** alert module!

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- A Google AI Studio API key with Gemma access

### 2. Installation
```bash
git clone https://github.com/your-username/commitment-os.git
cd commitment-os
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your API key in `.env`:
```env
GEMINI_API_KEY="your-google-ai-studio-api-key"
PORT=3000
GEMMA_MODEL="gemma-4-26b-a4b-it"
```

### 4. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Commitment OS includes automated end-to-end test suites that verify:
- Input validation (missing required fields)
- Live Gemma 4 API connectivity
- Response structure, enum normalization, and recovery action generation across NORMAL, AT RISK, and BLOCKED cases.

Run the test suite:
```bash
npm test
```

---

## 📁 Project Structure

```
├── .env.example              # Environment variables template (no secrets)
├── server.ts                 # Full-stack Express server + Vite middleware
├── server/
│   └── gemmaAnalyzer.ts      # Gemma 4 (@google/genai) commitment recovery engine
├── src/
│   ├── App.tsx               # Main application container
│   ├── types.ts              # TypeScript interfaces & types
│   ├── data/
│   │   └── sampleCases.ts    # NORMAL, AT RISK, BLOCKED benchmarks
│   └── components/
│       ├── Navbar.tsx        # Top navigation & API health indicator
│       ├── CommitmentForm.tsx# Input form & benchmark selector
│       ├── AnalysisDisplay.tsx# Recovery action, root blocker, and JSON inspector
│       └── MakeIntegrationModal.tsx # Make.com webhook guide & cURL tester
├── test/
│   └── analyze.test.ts       # Automated test suite
├── LICENSE                   # Apache-2.0 open-source license
└── README.md                 # Complete documentation
```

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.
