import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const runtime = 'nodejs';

export async function GET() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    try {
        const result = await generateText({
            model: openai('gpt-4o'),
            prompt: 'Say hello world',
        });
        return new Response(JSON.stringify({ ok: true, message: result.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'OpenAI API call failed.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
