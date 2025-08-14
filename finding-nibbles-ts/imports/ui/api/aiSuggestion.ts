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
      const requestData: { occasion?: string; preferences?: string; prompt?: string; type?: string } = JSON.parse(body);
      const { occasion, preferences, prompt, type } = requestData;

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


      let aiPrompt = '';

      if (prompt && type === 'recommendations') {
        // Use the custom prompt for recommendations
        aiPrompt = prompt;
      } else if (occasion) {
        aiPrompt = `Suggest a dish suitable for a special occasion like ${occasion} in three sentences and bold the dish.`;
      } else if (parsedPreferences.length > 0) {
        aiPrompt = `Suggest a dish that suits someone withone of the following dietary preferences: ${parsedPreferences.join(', ')} in a three sentences with mentioning which preference is used.`;
      } else {
        aiPrompt = 'Suggest a dish to eat in three sentences and bold the dish.';
      }

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: aiPrompt }],
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
