import { NextRequest } from 'next/server';
import { z } from 'zod';
import { inngest } from '../../../inngest/orderLookup';

export const runtime = 'nodejs';

const schema = z.object({
    email: z.email(),
    orderId: z.string().optional(),
    question: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.issues[0]?.message || 'Invalid input.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    console.log('result => ', result);

    // Trigger the Inngest function as a background job
    const event = await inngest.send({
        name: 'app/order.lookup',
        data: {
            email: result.data.email,
            orderId: result.data.orderId,
        },
    });
    // Return the event ID so the frontend can poll for status/result
    return new Response(JSON.stringify({ eventId: event.ids?.[0] }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
    });
}
