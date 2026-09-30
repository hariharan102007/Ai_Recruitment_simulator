export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    available: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    platform: 'vercel',
  });
}
