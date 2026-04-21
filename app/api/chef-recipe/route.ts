import Anthropic from '@anthropic-ai/sdk';
import { CHEFS } from '@/lib/chefs-data';
import { buildUserPrompt } from '@/lib/prompt';

const SCHEMA_RULES = `
Your task is to generate a complete recipe in your distinctive culinary style. Respond with ONLY a single valid JSON object — no preamble, no explanation, no markdown fences. Directly parseable by JSON.parse().

Conform EXACTLY to this schema:

{
  "dish_name": string,
  "description": string,
  "prep_time": string,
  "cook_time": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "servings": integer,
  "ingredients": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "category": string,
      "estimated_cost_usd": number
    }
  ],
  "steps": [string],
  "tips": [string],
  "total_estimated_cost_usd": number
}

Rules:
- dish_name: Full name as YOU would present it.
- description: 2-3 sentences in your voice and perspective.
- prep_time / cook_time: e.g. "20 minutes", "1 hour 10 minutes".
- difficulty: Easy <30 min no technique; Medium 30-60 min or one technique; Hard >60 min or multiple.
- ingredients[].quantity: Number only, never string. Use 0.5 not "1/2".
- ingredients[].unit: One of: grams, ml, tsp, tbsp, cups, pcs, cloves, sprigs, slices, leaves.
- ingredients[].category: One of: Protein, Dairy, Produce, Pantry, Spices, Grains, Fats, Other.
- ingredients[].estimated_cost_usd: Realistic 2024 US retail price.
- steps: 6-20 steps, imperative voice, °F and °C, visual cues. Reflect YOUR specific technique.
- tips: 2-4 personal pro tips in your voice.
- total_estimated_cost_usd: Sum of ingredient costs.
Respond with ONLY the JSON object. No other text.`;

export async function POST(request: Request) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const body = await request.json();
  const { dish, chefId, servings = 4, dietary_filters = [] } = body as {
    dish: string;
    chefId: string;
    servings: number;
    dietary_filters: string[];
  };

  if (!dish || typeof dish !== 'string' || dish.trim().length < 2) {
    return Response.json({ error: 'Invalid dish name' }, { status: 400 });
  }

  const chef = CHEFS.find(c => c.id === chefId);
  if (!chef) {
    return Response.json({ error: 'Unknown chef' }, { status: 400 });
  }

  const systemPrompt = `You are ${chef.name}, ${chef.title} (${chef.nationality}).

WHO YOU ARE:
${chef.knownFor}

YOUR CULINARY PHILOSOPHY:
"${chef.philosophy}"

YOUR SIGNATURE DISHES (style reference):
${chef.signatureDishes.join(', ')}

Channel your specific techniques, flavor preferences, ingredient choices, and culinary worldview. If the dish is one you're known for, use your exact approach. For other dishes, interpret them through your distinctive lens.
${SCHEMA_RULES}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      try {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          temperature: 0.4,
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: buildUserPrompt(dish.trim(), servings, dietary_filters) }],
          stream: true,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ text })}\n\n`));
          }
        }

        const cleaned = fullText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const recipe = JSON.parse(cleaned);
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ recipe })}\n\n`));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
