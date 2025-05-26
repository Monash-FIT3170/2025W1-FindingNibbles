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
      const requestData: { occasion?: string; preferences?: string } = JSON.parse(body);
      const { occasion, preferences } = requestData;

      let parsedPreferences: string[] = [];
      if (preferences) {
        if (Array.isArray(preferences)) {
          parsedPreferences = preferences;
        } else if (typeof preferences === "string") {
          try {
            parsedPreferences = JSON.parse(preferences);
            if (!Array.isArray(parsedPreferences)) {
              parsedPreferences = [preferences];
            }
          } catch {
            parsedPreferences = [preferences];
          }
        }
      }


      let prompt = '';

      if (occasion) {
        prompt = `Suggest a dish suitable for a special occasion like ${occasion} in three sentences.`;
      } else if (parsedPreferences.length > 0) {
        prompt = `Suggest a dish that suits someone withone of the following dietary preferences: ${parsedPreferences.join(', ')} in a three sentences with mentioning which preference is used.`;
      } else {
        prompt = 'Suggest a dish to eat in three sentences.';
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
