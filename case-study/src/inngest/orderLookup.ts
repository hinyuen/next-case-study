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

const _userChannel = channel((input: InputData) => `user:${input.email}`).addTopic(
    topic('ai').schema(
        z.object({
            response: z.string(),
            success: z.number().transform(Boolean),
        })
    )
);

export const userChannel = _userChannel;
export type UserChannel = typeof userChannel;

// we can also create global channels that do not require input
// const logsChannel = channel('logs').addTopic(topic('info').type<string>());

// inngest.createFunction({ id: 'some-task' }, { event: 'ai/ai.requested' }, async ({ event, step, publish }) => {
//     // Publish data to the given channel, on the given topic.
//     await publish(
//         userChannel(event.data.userId).ai({
//             response: 'an llm response here',
//             success: 1,
//         })
//     );

//     await publish(logsChannel().info('All went well'));
// });

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

        console.log('orders => ', orders);

        let aiPrompt = '';
        const systemPrompt =
            'Answer only using the provided orders/tracking data. If there is no exact match or it’s ambiguous, say so and suggest adding an order ID. Do not guess or invent dates or events.';
        if (!orders.length) {
            aiPrompt = `User question: ${
                question || 'Where is my order?'
            }\nNo matching order found for email: ${email}${orderId ? ` and orderId: ${orderId}` : ''}.`;
        } else if (orders.length > 1) {
            aiPrompt = `User question: ${
                question || 'Where is my order?'
            }\nMultiple plausible orders found for email: ${email}${
                orderId ? ` and orderId: ${orderId}` : ''
            }. Orders: ${JSON.stringify(orders, null, 2)}`;
        } else {
            aiPrompt = `User question: ${question || 'Where is my order?'}\nOrder data: ${JSON.stringify(
                orders[0],
                null,
                2
            )}`;
        }

        // Stream the AI response
        const stream = streamText({
            model: openai('gpt-4o'),
            prompt: `${systemPrompt}\n${aiPrompt}`,
        });
        let streamedText = '';
        let chunkIndex = 0;
        for await (const chunk of stream.textStream) {
            streamedText += chunk;
            const channelKey = JSON.stringify({ email, orderId, question });
            console.log('[Inngest publish] channel:', channelKey, 'streamedText:', streamedText);
            await step.run(`publish:user:${email}:${chunkIndex++}`, async () => {
                await publish(
                    userChannel({ email, orderId, question }).ai({
                        response: streamedText,
                        success: 1,
                    })
                );
            });
        }
    }
);

export const getInngestApp = () => {
    return inngest;
};
