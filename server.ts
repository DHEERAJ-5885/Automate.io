
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CommitmentInput } from './src/types.ts';
import { analyzeCommitmentWithGemma } from './server/gemmaAnalyzer.ts';
import {
  dispatchToMakeWebhook,
  calculateRiskMetrics,
} from './server/makeWebhook.ts';
import { appendCommitmentToSheet } from './server/googleSheets.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-skip-webhook'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Commitment OS — AI Commitment Recovery Engine',
    model: GEMMA_MODEL,
    hasApiKey: Boolean(
      process.env.GEMINI_API_KEY || process.env.MY_GEMMA_API_KEY
    ),
    hasMakeWebhook: Boolean(process.env.MAKE_WEBHOOK_URL?.trim()),
    hasGoogleSheetsConfig: Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      process.env.GOOGLE_SPREADSHEET_ID
    ),
    timestamp: new Date().toISOString(),
  });
});

// Analyze and save commitment
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const person = String(
      body.person || body.name || body.person_name || body.personName || ''
    ).trim();

    const commitment = String(
      body.commitment ||
      body.task ||
      body.commitmentDescription ||
      body.title ||
      ''
    ).trim();

    const deadline = String(
      body.deadline || body.dueDate || body.due_date || ''
    ).trim();

    const currentStatus = String(
      body.currentStatus || body.status || body.current_status || ''
    ).trim();

    const blocker = String(
      body.blocker || body.blockers || body.rootBlocker || ''
    ).trim();

    const dependentTasks = String(
      body.dependentTasks ||
      body.dependencies ||
      body.dependent_tasks ||
      ''
    ).trim();

    const missingFields: string[] = [];
    if (!commitment) missingFields.push('commitment');
    if (!deadline) missingFields.push('deadline');

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required field(s): ${missingFields.join(', ')}.`,
      });
      return;
    }

    const input: CommitmentInput = {
      person: person || 'Unassigned',
      commitment,
      deadline,
      currentStatus: currentStatus || 'In progress',
      blocker: blocker || 'None reported',
      dependentTasks: dependentTasks || 'None specified',
    };

    // Analyze with Gemma
    const analysis = await analyzeCommitmentWithGemma(input);

    // Calculate risk
    const { riskScore, riskLevel } = calculateRiskMetrics(
      analysis.status,
      analysis.urgency
    );

    const commitmentId = String(
      body.commitmentId ||
      `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    );

    // Save directly to Google Sheets.
    // If saving fails, the request returns an error instead of
    // falsely reporting that the spreadsheet was updated.
    const sheetsResult = await appendCommitmentToSheet({
      commitmentId,
      person: input.person,
      commitment: input.commitment,
      deadline: input.deadline,
      progress: input.currentStatus,
      blocker: input.blocker,
      dependencies: input.dependentTasks,
      riskScore,
      riskLevel,
      analysis,
    });

    console.log(
      `Commitment ${commitmentId} saved to Google Sheets:`,
      sheetsResult
    );

    // Dispatch to Make.com when appropriate
    const userAgent = String(req.headers['user-agent'] || '');
    const skipHeader = req.headers['x-skip-webhook'] === 'true';
    const skipBody = body.skipWebhook === true;
    const isFromMake =
      userAgent.toLowerCase().includes('make/') ||
      userAgent.toLowerCase().includes('integromat');

    let webhookResult;

    if (!skipHeader && !skipBody && !isFromMake) {
      webhookResult = await dispatchToMakeWebhook(
        input,
        analysis,
        commitmentId
      );
    } else {
      webhookResult = {
        attempted: false,
        success: false,
        message: 'Webhook dispatch skipped.',
      };
    }

    res.status(200).json({
      success: true,
      commitmentId,
      riskLevel,
      riskScore,
      input,
      analysis,
      sheets: sheetsResult,
      webhook: webhookResult,
    });
  } catch (error: unknown) {
    console.error('Error processing commitment:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';

    res.status(500).json({
      success: false,
      error: errorMessage,
      model: GEMMA_MODEL,
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');

    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Commitment OS server running on port ${PORT}`);
    console.log(`Using AI Model: ${GEMMA_MODEL}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
