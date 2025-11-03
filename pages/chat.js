import { parseUserMessage } from '../lib/parser';
import { checkSafety } from '../lib/safety';
import { searchByFeatures, getByModelBrand } from '../lib/catalog';


const OpenAI = require('openai');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'missing message' });

  const safety = checkSafety(message);
  if (!safety.safe) {
    return res.status(200).json({ type: 'refusal', reason: safety.reason, text: 'Sorry, I can\'t assist with that request.' });
  }

  const intent = parseUserMessage(message);

  if (intent.type === 'compare' && intent.compare) {
    const [a, b] = intent.compare;
    const matches = [...getByModelBrand(a), ...getByModelBrand(b)];
    if (matches.length < 2) {
      return res.json({ type: 'error', text: `I couldn't find both models to compare. I found: ${matches.map(m=>m.model).join(', ')}` });
    }
    const unique = Array.from(new Set(matches.map(m=>m.id))).map(id=>matches.find(x=>x.id===id));
    const pair = unique.slice(0,2);
    const comp = pair.map(p => ({ id: p.id, brand: p.brand, model: p.model, price: p.price, camera: p.camera, battery: p.battery, ram: p.ram, storage: p.storage, notes: p.notes }));
    return res.json({ type: 'comparison', items: comp, text: `Comparing ${comp[0].brand} ${comp[0].model} and ${comp[1].brand} ${comp[1].model}` });
  }

  if (intent.type === 'detail' && intent.keyword) {
    const found = getByModelBrand(intent.keyword);
    if (!found.length) return res.json({ type: 'not_found', text: `Couldn't find details for "${intent.keyword}".` });
    const item = found[0];
    return res.json({ type: 'detail', item });
  }

  const results = searchByFeatures({ keyword: intent.keyword || null, brand: intent.brand || null, maxPrice: intent.budget || null, limit: Number(process.env.MAX_RESULTS||6) });

  const explanation = `I found ${results.length} phones matching your query. Showing top ${results.length}.`;

  if (process.env.OPENAI_API_KEY && results.length) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const system = `You are an assistant that writes concise, factual product recommendation text. Do NOT invent specs. Use only the 'products' JSON provided in the user message.`;
      const userContent = `Products: ${JSON.stringify(results.slice(0,3))}\n\nUser query: ${message}`;
      const resp = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }], max_tokens: 300 });
      const llmText = resp.choices?.[0]?.message?.content?.trim();
      return res.json({ type: 'search', items: results, text: llmText || explanation });
    } catch (err) {
      console.error('LLM error', err.message || err);
      return res.json({ type: 'search', items: results, text: explanation });
    }
  }

  return res.json({ type: 'search', items: results, text: explanation });
}
