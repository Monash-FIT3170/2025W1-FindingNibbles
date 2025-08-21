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

function parsePreferences(preferences?: string | string[]): string[] {
  if (!preferences) return [];
  if (Array.isArray(preferences)) return preferences;

  try {
    const parsed = JSON.parse(preferences);
    return Array.isArray(parsed) ? parsed : [preferences];
  } catch {
    return [preferences];
  }
}


WebApp.connectHandlers.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
  const { pathname } = parse(req.url || '', true);
  if (pathname !== '/api/aiSuggestion') return next();

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { occasion, preferences } = JSON.parse(body);
      const parsedPreferences = parsePreferences(preferences);

      let prompt = '';
      if (occasion) {
        prompt = `Suggest a dish suitable for a special occasion like ${occasion} with only its name and description in json format with "name" and "description" fields.`;
      } else if (parsedPreferences.length > 0) {
        prompt = `Suggest a dish that suits someone with one of the following dietary preferences: ${parsedPreferences.join(', ')}. Respond with only its name and description in json format with "name" and "description" fields.`;
      } else {
        prompt = 'Suggest a japanese dish with only its name and description in json format with "name" and "description" fields.';
      }

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const rawText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion generated.';

      try {
        // Strip markdown-style code block if accidentally included
        const cleaned = rawText.replace(/```json|```/g, '').trim();

        const parsed = JSON.parse(cleaned); 

        res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
          dish: {
            name: parsed.name,
            description: parsed.description
          }
        }));

    } catch (error) {
      console.error('Vertex AI Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate dish suggestion.' }));
    }
  } catch (error) {
    console.error('Request Handler Error:', error);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid request body.' }));
  }
})});
