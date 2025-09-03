import 'dotenv/config';
import { WebApp } from 'meteor/webapp';
import { parse } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import { VertexAI } from '@google-cloud/vertexai';
import { Meteor } from 'meteor/meteor';


const project = process.env.PROJECT_ID || 'sacred-vault-469801-f4';
const location = process.env.LOCATION || 'us-central1';

console.log("PROJECT_ID:", process.env.PROJECT_ID ?? 'Not set');

const vertexAI = new VertexAI({ project, location });

const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  generationConfig: {
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.5),
    topP: 0.9,
    maxOutputTokens: 256,
  },
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
      const { occasion, preferences, mode, feedback, diversity, avoid } = JSON.parse(body);
      const parsedPreferences = parsePreferences(preferences);

      // Fetch user feedback server-side if not provided
      let userFeedback = feedback;
      try {
        if (!userFeedback && (req as any).userId) {
          userFeedback = await (Meteor as any).callAsync?.('dishes.getUserFeedback');
        }
      } catch (e) {
        console.warn('Could not fetch user feedback inline, proceeding with provided params.');
      }

      let legacyPrompt = '';
      if (occasion) {
        legacyPrompt = `Suggest a dish suitable for a special occasion like ${occasion} with only its name and description in json format with "name" and "description" fields.`;
      } else if (parsedPreferences.length > 0) {
        legacyPrompt = `Suggest a dish that suits someone with one of the following dietary preferences: ${parsedPreferences.join(', ')}. Respond with only its name and description in json format with "name" and "description" fields.`;
      } else {
        legacyPrompt = 'Suggest a new dish to recommend to a user to try out with only its name and description in json format with "name" and "description" fields.';
      }

      const constraints = [
        'Return ONLY valid JSON array of up to 5 items.',
        'Each item must have keys "name" and "description".',
        'No markdown, no code fences, no extra commentary.',
        'Do NOT include tokens, IDs, counters, tags, or suffixes in names; names must be plain dish names.',
      ].join(' ');

      const systemPreamble = 'You are a culinary recommender system that personalizes dish suggestions.';

      const contextBlocks: string[] = [];
      const likesList = userFeedback?.likes?.slice(0, 30) || [];
      const dislikesList = userFeedback?.dislikes?.slice(0, 30) || [];
      const searchesList = userFeedback?.recentSearches?.slice(0, 20) || [];
      if (likesList.length) contextBlocks.push(`User liked dishes: ${likesList.join(', ')}`);
      if (dislikesList.length) contextBlocks.push(`User disliked dishes: ${dislikesList.join(', ')}`);
      if (searchesList.length) contextBlocks.push(`Recent searches: ${searchesList.join(', ')}`);
      if (parsedPreferences.length) contextBlocks.push(`Explicit preferences: ${parsedPreferences.join(', ')}`);
      // Provide a machine-readable summary Gemini can easily parse
      const labeledFeedbackJson = JSON.stringify({ liked: likesList, disliked: dislikesList });
      contextBlocks.push(`User feedback (JSON): ${labeledFeedbackJson}`);
      const avoidList: string[] = Array.isArray(avoid) ? avoid.slice(0, 50) : [];
      if (avoidList.length) contextBlocks.push(`Avoid recommending these dishes (already suggested/seen): ${avoidList.join(', ')}`);

      const modeLine = mode === 'tryNew'
        ? 'Emphasize novelty and diversity across cuisines, textures, and cooking methods. Avoid overfitting to prior likes; include at least one surprise pick.'
        : 'Emphasize alignment with liked dishes and adjacent cuisines; avoid items similar to dislikes.';

      const diversityValue = typeof diversity === 'number' ? Math.max(0, Math.min(100, diversity)) : undefined;
      let diversityLine = '';
      if (diversityValue !== undefined) {
        if (diversityValue <= 30) diversityLine = 'Diversity=LOW (0-30): Minimize novelty; prefer close neighbors to liked dishes and familiar cuisines.';
        else if (diversityValue <= 70) diversityLine = 'Diversity=MEDIUM (31-70): Balance alignment with 1-2 novel picks; include adjacent cuisines and styles.';
        else diversityLine = 'Diversity=HIGH (71-100): Maximize novelty and variety; include 2-3 surprising picks dissimilar to recent likes across multiple cuisines and methods.';
      }

      const diversityPolicy = diversityValue && diversityValue >= 60
        ? 'Ensure the list spans at least 3 distinct cuisines and varied cooking methods.'
        : '';

      const finalPrompt = [
        systemPreamble,
        modeLine,
        diversityLine,
        diversityPolicy,
        constraints,
        ...contextBlocks,
        'Output example: [{"name":"Margherita Pizza","description":"A classic Neapolitan pizza..."}]',
      ].join('\n');

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: finalPrompt }],
          },
        ],
      });

      const rawText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion generated.';

      try {
        // Try parse as array; fallback to cleaned
        const tryParse = (s: string) => {
          const cleaned = s.replace(/```json|```/g, '').trim();
          const data = JSON.parse(cleaned);
          return Array.isArray(data) ? data : [data];
        };
        const items = tryParse(rawText)
          .filter((d: any) => d && typeof d.name === 'string' && typeof d.description === 'string')
          .map((d: any) => {
            // Sanitize accidental token artifacts like trailing "123ep" or similar
            const cleanedName = String(d.name).trim().replace(/\s*\d{2,}[a-z]{1,3}$/i, '');
            return { name: cleanedName, description: String(d.description).trim() };
          })
          .slice(0, 5);

        if (!items.length) throw new Error('No valid items');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ dishes: items }));

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
