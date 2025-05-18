import { WebApp } from 'meteor/webapp';
import { parse } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize VertexAI for Gemini model
const project = process.env.PROJECT_ID || 'findingnibbles-460212';
const location = process.env.LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
});

WebApp.rawHandlers.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
  const { pathname } = parse(req.url || '', true);
  if (pathname !== '/api/aiSuggestion') return next();

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const requestData: { cuisine?: string } = JSON.parse(body);
      const { cuisine } = requestData;

      const prompt = cuisine
        ? `Suggest a creative and popular dish from ${cuisine} cuisine.`
        : 'Suggest a random creative international dish.';

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const suggestion = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion generated.';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ suggestion }));
    } catch (error) {
      console.error('Vertex AI Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate dish suggestion.' }));
    }
  });
});
