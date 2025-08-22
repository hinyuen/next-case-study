import { Inngest } from 'inngest';
import db from '../../lib/db';
import { realtimeMiddleware, channel, topic } from '@inngest/realtime';
import { z } from 'zod';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
export const inngest = new Inngest({ id: 'order-lookup', middleware: [realtimeMiddleware()] });

// Define the input type for order lookup
export type InputData = {
    email: string;
    orderId?: string;
    question?: string;
    userId?: string;
};

// create a channel for each user, given a user ID. A channel is a namespace for one or more topics of streams.

const _userChannel = channel((id: string) => `user:${id}`).addTopic(
    topic('ai').schema(
        z.object({
            response: z.string(),
            success: z.number().transform(Boolean),
        })
    )
);

export const userChannel = _userChannel;
export type UserChannel = typeof userChannel;

export const orderLookup = inngest.createFunction(
    { id: 'order-lookup-fn' },
    { event: 'app/order.lookup' },
    async ({ event, publish, step }) => {
        console.log('called');
        const { email, orderId, question } = event.data;
        let sql = 'SELECT * FROM orders WHERE customerEmail = ?';
        const params: string[] = [email];
        if (orderId) {
            sql += ' AND orderPublicId = ?';
            params.push(orderId);
        }
        const orders = db.prepare(sql).all(...params);

        // Stream the AI response
        const stream = streamText({
            model: openai('gpt-5-nano'),
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful support agent. Here is the order data:\n${JSON.stringify(
                        orders[0]
                    )}\n\nInstructions:\nPlease make your response readable, if have any time value please format into YYYY-MM-DD \n- Cite the platformOrderId in your answer.\n- Include the latest known status if present.\n- Avoid giving definitive delivery dates.\n- Make your response human-quality and friendly.`,
                },
                {
                    role: 'user',
                    content: JSON.stringify(question) || 'No question provided.',
                },
            ],
        });
        // let streamedText = '';
        let chunkIndex = 0;
        for await (const chunk of stream.textStream) {
            // Publish only the new chunk for smooth streaming
            await step.run(`publish:user:123:${chunkIndex++}`, async () => {
                await publish(
                    userChannel('123').ai({
                        response: chunk,
                        success: 1,
                    })
                );
            });
            // streamedText += chunk;
        }
    }
);

export const getInngestApp = () => {
    return inngest;
};
