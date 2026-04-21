import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompt';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const body = await request.json();
  const { dish, servings = 4, dietary_filters = [] } = body as {
    dish: string;
    servings: number;
    dietary_filters: string[];
  };

  if (!dish || typeof dish !== 'string' || dish.trim().length < 2) {
    return Response.json({ error: 'Invalid dish name' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          temperature: 0.3,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [
            {
              role: 'user',
              content: buildUserPrompt(dish.trim(), servings, dietary_filters),
            },
          ],
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(
              encoder.encode(
                `event: delta\ndata: ${JSON.stringify({ text })}\n\n`
              )
            );
          }
        }

        const cleaned = fullText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const recipe = JSON.parse(cleaned);
        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ recipe })}\n\n`
          )
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message })}\n\n`
          )
        );
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
