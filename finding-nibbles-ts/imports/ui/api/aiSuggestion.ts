import 'dotenv/config';
import { WebApp } from 'meteor/webapp';
import { parse } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import { VertexAI } from '@google-cloud/vertexai';



const project = process.env.PROJECT_ID || 'findingnibbles-460212';
const location = process.env.LOCATION || 'us-central1';

console.log("PROJECT_ID:", process.env.PROJECT_ID ?? 'Not set');

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
      const requestData: { cuisine?: string; occasion?: string } = JSON.parse(body);
      const { occasion } = requestData;

      let prompt = '';

      if (occasion) {
        prompt = `Suggest a dish suitable for a special occasion like ${occasion} in three sentences.`;
      }
       else {
        prompt = 'Suggest a random creative international dish in three sentences.';
      }

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
