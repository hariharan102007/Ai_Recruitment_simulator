import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, temperature } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    const temp = typeof temperature === 'number' ? temperature : 0.92;
    const defaultSysInstruction =
      systemInstruction ||
      'You are a premier technical assessment engineer and recruitment specialist. Your job is to generate unique, varied, non-repeating, and deeply domain-specific interview assessment questions strictly aligned with the candidate\'s resume background. Never output repeated questions or cliché tropes. Always return valid JSON with no markdown formatting.';

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let response;
    let lastError = null;

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
      } catch (err) {
        lastError = err;
        console.warn(`[Vercel Gemini Model] ${model} unavailable:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('No response from AI models');
    }

    const outputText = response.text || '';
    return res.status(200).json({ text: outputText });
  } catch (error) {
    console.error('[Vercel Gemini API Error]', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Error occurred while communicating with Gemini API on Vercel',
    });
  }
}
