import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Backend routes
import authRoutes from './backend/routes/authRoutes.js';
import aptitudeRoutes from './backend/routes/aptitudeRoutes.js';
import codingRoutes from './backend/routes/codingRoutes.js';
import progressRoutes from './backend/routes/progressRoutes.js';
import adaptiveRoutes from './backend/routes/adaptiveRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Catch unhandled errors gracefully to prevent container restart loops
process.on('uncaughtException', (err) => {
  console.error('[Process uncaughtException]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Process unhandledRejection]:', reason);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check (Instant 200 for cloud readiness & liveness probes)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini AI Status
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    available: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
  });
});

// Gemini AI Generation Endpoint
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  const { prompt, systemInstruction, temperature } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const temp = typeof temperature === 'number' ? temperature : 0.92;
    const defaultSysInstruction =
      systemInstruction ||
      'You are a premier technical assessment engineer and recruitment specialist. Your job is to generate unique, varied, non-repeating, and deeply domain-specific interview assessment questions strictly aligned with the candidate\'s resume background. Never output repeated questions or cliché tropes. Always return valid JSON with no markdown formatting.';

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let response;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: defaultSysInstruction,
            responseMimeType: 'application/json',
            temperature: temp,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Model] ${model} unavailable (${err?.message || err}). Trying next model...`);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No response from AI models');
    }

    const outputText = response.text || '';
    return res.json({ text: outputText });
  } catch (error: any) {
    console.error('[Gemini API Error]', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Error occurred while communicating with Gemini API',
    });
  }
});

// Mount Backend API Routes
app.use('/api/auth', authRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/interview', adaptiveRoutes);

// Database offline error fallback handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    (err.message && err.message.includes('buffering timed out'))
  ) {
    console.warn('[AI Studio] Database offline — returning fallback response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Database service is currently offline' });
  }
  next(err);
});

// Static Assets & Production Single Page Application Router
const distPath = path.resolve(__dirname, 'frontend', 'dist');
const indexPath = path.resolve(distPath, 'index.html');

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(indexPath);

  if (isProduction && fs.existsSync(indexPath)) {
    console.log(`📦 Serving production build from: ${distPath}`);
    app.use(express.static(distPath, { maxAge: '1d', index: false }));

    // Express 5 SPA catch-all fallback
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(indexPath);
      }
      next();
    });
  } else {
    console.log('⚡ Initializing Vite development server');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
      },
      appType: 'spa',
      root: path.resolve(__dirname, 'frontend'),
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Recruitment Simulator Server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Gemini AI configured: ${!!process.env.GEMINI_API_KEY}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
