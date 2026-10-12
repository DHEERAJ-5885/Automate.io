import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CommitmentInput } from './src/types.ts';
import { analyzeCommitmentWithGemma } from './server/gemmaAnalyzer.ts';
import { dispatchToMakeWebhook, calculateRiskMetrics } from './server/makeWebhook.ts';
import { CommitmentInput } from './src/types.ts';
import { analyzeCommitmentWithGemma } from './server/gemmaAnalyzer.ts';
import { dispatchToMakeWebhook, calculateRiskMetrics } from './server/makeWebhook.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

// Middleware
app.use(express.json());

// Enable CORS for external tools like Make.com, Zapier, cURL
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-skip-webhook');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.MY_GEMMA_API_KEY);
  const hasMakeWebhook = Boolean(process.env.MAKE_WEBHOOK_URL && process.env.MAKE_WEBHOOK_URL.trim());

  res.json({
    status: 'healthy',
    service: 'Commitment OS — AI Commitment Recovery Engine',
    model: GEMMA_MODEL,
    hasApiKey,
    hasMakeWebhook,
    timestamp: new Date().toISOString(),
  });
});

// Commitment analysis endpoint for Make.com and web UI
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // Support flexible naming conventions for Make.com / Webhook integration
    const person = String(body.person || body.name || body.person_name || body.personName || '').trim();
    const commitment = String(body.commitment || body.task || body.commitmentDescription || body.title || '').trim();
    const deadline = String(body.deadline || body.dueDate || body.due_date || '').trim();
    const currentStatus = String(body.currentStatus || body.status || body.current_status || '').trim();
    const blocker = String(body.blocker || body.blockers || body.rootBlocker || '').trim();
    const dependentTasks = String(body.dependentTasks || body.dependencies || body.dependent_tasks || '').trim();

    // Strict input validation
    const missingFields: string[] = [];
    if (!commitment) missingFields.push('commitment');
    if (!deadline) missingFields.push('deadline');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required field(s): ${missingFields.join(', ')}. Please provide at least 'commitment' and 'deadline'.`,
      });
    }

    const input: CommitmentInput = {
      person: person || 'Unassigned',
      commitment,
      deadline,
      currentStatus: currentStatus || 'In progress',
      blocker: blocker || 'None reported',
      dependentTasks: dependentTasks || 'None specified',
    };

    // Analyze using Gemma 4 model
    const analysis = await analyzeCommitmentWithGemma(input);

    // Compute standardized risk metrics
    const { riskScore, riskLevel } = calculateRiskMetrics(analysis.status, analysis.urgency);
    const commitmentId = String(body.commitmentId || `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

    // Prevent circular recursion if call originated from Make.com or explicitly asks to skip webhook
    const userAgent = String(req.headers['user-agent'] || '');
    const skipHeader = req.headers['x-skip-webhook'] === 'true';
    const skipBody = body.skipWebhook === true;
    const isFromMake = userAgent.toLowerCase().includes('make/') || userAgent.toLowerCase().includes('integromat');

    let webhookResult = undefined;
    if (!skipHeader && !skipBody && !isFromMake) {
      webhookResult = await dispatchToMakeWebhook(input, analysis, commitmentId);
    } else {
      webhookResult = {
        attempted: false,
        success: false,
        message: 'Skipped webhook dispatch to prevent duplicate or circular automation execution.',
      };
    }

    return res.status(200).json({
      success: true,
      commitmentId,
      riskLevel,
      riskScore,
      input,
      analysis,
      webhook: webhookResult,
    });
  } catch (error: any) {
    console.error('Error analyzing commitment with Gemma 4:', error);
    const errorMessage = error?.message || 'Internal error occurred during commitment analysis.';
    return res.status(500).json({
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
    // In production serve dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Commitment OS server running on http://0.0.0.0:${PORT}`);
    console.log(`Using AI Model: ${GEMMA_MODEL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
