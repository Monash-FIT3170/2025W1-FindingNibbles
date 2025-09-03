import 'dotenv/config';
import { WebApp } from 'meteor/webapp';
import { parse } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import fetch from 'node-fetch';
import { Meteor } from 'meteor/meteor';

async function querySDXL(data: any, token: string): Promise<string> {
  const response = await fetch(
    'https://router.huggingface.co/nscale/v1/images/generations',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face Error: ${errorText}`);
  }

  const result = await response.json() as { data?: Array<{ b64_json?: string }> };
  return result.data?.[0]?.b64_json || '';
}

WebApp.connectHandlers.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
  const { pathname } = parse(req.url || '', true);
  if (pathname !== '/api/generateImage') return next();

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { prompt } = JSON.parse(body);
      if (!prompt) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Prompt is required.' }));
        return;
      }

      // Prefer private settings, fall back to env, then public (not recommended)
      const hfToken = (Meteor.settings?.private as any)?.HuggingFaceAccessToken
        || process.env.HF_TOKEN
        || (Meteor.settings?.public as any)?.HuggingFaceAccessToken;

      if (!hfToken) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Hugging Face token not configured.' }));
        return;
      }

      const imageBase64 = await querySDXL({
        prompt,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        response_format: 'b64_json',
      }, hfToken);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ image: imageBase64 }));
    } catch (error) {
      console.error('Generate Image Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to generate image.' }));
    }
  });
});
