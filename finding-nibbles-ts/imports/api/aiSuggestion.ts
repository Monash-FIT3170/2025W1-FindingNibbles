import 'dotenv/config';
import { WebApp } from 'meteor/webapp';
import { parse } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import { VertexAI } from '@google-cloud/vertexai';
import { SearchHistory } from './searchHistory';
import { DishSwipes } from './dishSwipes';


const project = process.env.PROJECT_ID || 'sacred-vault-469801-f4';
const location = process.env.LOCATION || 'us-central1';

console.log("PROJECT_ID:", process.env.PROJECT_ID ?? 'Not set');

const vertexAI = new VertexAI({ project, location });

const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  generationConfig: {
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.8), // nudge randomness
    topP: 0.95,
    maxOutputTokens: 320,
  },
});

// Use shared collection handle to avoid duplicate collection definitions

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
      const { occasion, preferences, mode, feedback, diversity, avoid, diningMode, vibe, userId } = JSON.parse(body);
      const parsedPreferences = parsePreferences(preferences);

      // Fetch user feedback server-side if not provided
      let userFeedback = feedback;
      try {
        // Prefer explicit userId from request body; fall back to framework-provided context if available
        const resolvedUserId: string | undefined = userId || (req as any).userId;

        if (resolvedUserId) {
          // Read persisted likes/dislikes and searches directly from Mongo
          const [likesDocs, dislikesDocs, recentSwipesDocs, searches] = await Promise.all([
            DishSwipes.find({ userId: resolvedUserId, liked: true }, { sort: { createdAt: -1 }, limit: 100 }).fetchAsync(),
            DishSwipes.find({ userId: resolvedUserId, liked: false }, { sort: { createdAt: -1 }, limit: 100 }).fetchAsync(),
            DishSwipes.find({ userId: resolvedUserId }, { sort: { createdAt: -1 }, limit: 200 }).fetchAsync(),
            SearchHistory.find({ userId: resolvedUserId }, { sort: { timestamp: -1 }, limit: 50 }).fetchAsync(),
          ]);

          const likes = Array.from(new Set(likesDocs.map((d: any) => d.name)));
          const dislikes = Array.from(new Set(dislikesDocs.map((d: any) => d.name)));
          const recentSearches = Array.from(new Set(searches.map((s: any) => s.searchTerm)));

          if (!userFeedback) userFeedback = { likes, dislikes, recentSearches };

          // Build server-side avoid list from recent swipes (most recent first)
          const recentSwipeNames = Array.from(new Set(recentSwipesDocs.map((d: any) => d.name)));
          const incomingAvoid = Array.isArray(avoid) ? avoid : [];
          const mergedAvoid = Array.from(new Set([...incomingAvoid, ...recentSwipeNames])).slice(0, 100);
          (req as any)._serverAvoidList = mergedAvoid; // attach for later use in prompt context merge
        }
      } catch (e) {
        console.warn('Could not fetch user feedback inline, proceeding with provided params.');
      }

      // legacy prompt removed

      const constraints = [
        'Return ONLY valid JSON array of up to 5 items.',
        'Each item must have keys "name" and "description".',
        'No markdown, no code fences, no extra commentary.',
        'Do NOT include tokens, IDs, counters, tags, or suffixes in names; names must be plain dish names.',
        'Prefer variety: cuisines, cooking methods, proteins, and flavor profiles should vary.',
        'Avoid near-duplicates, generic names, or overused classics unless expressly aligned with likes.',
      ].join(' ');

      const systemPreamble = 'You are a culinary recommender system that personalizes dish suggestionsf for users based on their preferences and feedback.';

      const contextBlocks: string[] = [];
      const likesListAll = userFeedback?.likes || [];
      const dislikesListAll = userFeedback?.dislikes || [];
      const searchesListAll = userFeedback?.recentSearches || [];
      const likesList = likesListAll.slice(0, 30);
      const dislikesList = dislikesListAll.slice(0, 30);
      const searchesList = searchesListAll.slice(0, 20);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[aiSuggestion] Using feedback counts => likes:', likesListAll.length, 'dislikes:', dislikesListAll.length, 'searches:', searchesListAll.length);
      }
      if (likesList.length) contextBlocks.push(`User liked dishes: ${likesList.join(', ')}`);
      if (dislikesList.length) contextBlocks.push(`User disliked dishes: ${dislikesList.join(', ')}`);
      if (searchesList.length) contextBlocks.push(`Recent searches: ${searchesList.join(', ')}`);
      if (parsedPreferences.length) contextBlocks.push(`Explicit preferences: ${parsedPreferences.join(', ')}`);
      // Provide a machine-readable summary Gemini can easily parse
      const labeledFeedbackJson = JSON.stringify({ liked: likesList, disliked: dislikesList });
      contextBlocks.push(`User feedback (JSON): ${labeledFeedbackJson}`);
      // Merge client-provided avoid with server-side avoid built from recent swipes
      const avoidFromServer: string[] = Array.isArray((req as any)._serverAvoidList) ? (req as any)._serverAvoidList : [];
      const avoidList: string[] = Array.from(new Set([...(Array.isArray(avoid) ? avoid : []), ...avoidFromServer])).slice(0, 100);
      if (avoidList.length) contextBlocks.push(`Avoid recommending these dishes (already suggested/seen): ${avoidList.join(', ')}`);

      const modeLine = mode === 'tryNew'
        ? 'Emphasize novelty and diversity across cuisines, textures, and cooking methods. Avoid overfitting to prior likes; include at least one surprise pick.'
        : (mode === 'recommended'
          ? 'Emphasize alignment with liked dishes and adjacent cuisines; avoid items similar to dislikes.'
          : 'Craft a cohesive special-occasion menu tailored to the event.');

      const diversityValue = typeof diversity === 'number' ? Math.max(0, Math.min(100, diversity)) : undefined;
      let diversityLine = '';
      if (diversityValue !== undefined) {
        if (diversityValue <= 30) diversityLine = 'Diversity=LOW (0-30): Minimize novelty; prefer close neighbors to liked dishes and familiar cuisines.';
        else if (diversityValue <= 70) diversityLine = 'Diversity=MEDIUM (31-70): Balance alignment with 1-2 novel picks; include adjacent cuisines and styles.';
        else diversityLine = 'Diversity=HIGH (71-100): Maximize novelty and variety; include 2-3 surprising picks dissimilar to recent likes across multiple cuisines and methods.';
      }

      const diversityPolicy = diversityValue && diversityValue >= 60
        ? 'Ensure the list spans at least 3 distinct cuisines and varied cooking methods. Include at least one regional specialty.'
        : 'Ensure at least 2 distinct cuisines and avoid repeating the same core ingredient more than twice.';

      const occasionLine = mode === 'occasion' && occasion
        ? `Occasion: ${occasion}.`
        : '';
      const diningLine = mode === 'occasion' && diningMode
        ? `Dining mode: ${diningMode === 'out' ? 'Dining out' : 'At home'}.`
        : '';
      const vibeLine = mode === 'occasion' && vibe
        ? `Vibe preference: ${vibe}.`
        : '';

      const finalPrompt = [
        systemPreamble,
        modeLine,
        diversityLine,
        diversityPolicy,
        occasionLine,
        diningLine,
        vibeLine,
        constraints,
        ...contextBlocks,
        mode === 'occasion'
          ? 'Return JSON object with EXACT structure: {"centerpiece":{"name":"Dish Name","description":"Dish description"},"complements":[{"name":"Complement 1","description":"Description 1"},{"name":"Complement 2","description":"Description 2"}]}. The centerpiece is the main dish for the occasion. Complements are supporting dishes. All name and description fields are REQUIRED strings. Cohesive menu; respect dislikes; avoid repeats.'
          : 'Output example: [{"name":"Margherita Pizza","description":"A classic Neapolitan pizza..."}]. Prefer common but authentic dishes where appropriate.',
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
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (mode === 'occasion') {
          const centerpieceIn = parsed?.centerpiece;
          const complementsIn = Array.isArray(parsed?.complements) ? parsed.complements : [];
          const sanitize = (d: any) => {
            if (!d || typeof d.name !== 'string' || typeof d.description !== 'string') return null;
            const cleanedName = String(d.name).trim().replace(/\s*\d{2,}[a-z]{1,3}$/i, '');
            return { name: cleanedName, description: String(d.description).trim() };
          };
          const centerpiece = sanitize(centerpieceIn);
          const complements = complementsIn.map(sanitize).filter(Boolean).slice(0, 3);
          if (!centerpiece) {
            console.error('Invalid centerpiece received:', centerpieceIn);
            throw new Error(`Invalid centerpiece: ${JSON.stringify(centerpieceIn)}`);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ menu: { centerpiece, complements } }));
          return;
        }

        // Default modes: tryNew / recommended
        // Dedupe and shuffle to reduce repetition across calls
        const baseItems = (Array.isArray(parsed) ? parsed : [parsed])
          .filter((d: any) => d && typeof d.name === 'string' && typeof d.description === 'string')
          .map((d: any) => {
            const cleanedName = String(d.name).trim().replace(/\s*\d{2,}[a-z]{1,3}$/i, '');
            return { name: cleanedName, description: String(d.description).trim() };
          });

        const seen = new Set<string>();
        const deduped = baseItems.filter((d) => {
          const key = d.name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Fisher–Yates shuffle
        for (let i = deduped.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
        }

        const items = deduped.slice(0, 5);

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
