// ex. /app/actions/get-subscribe-token.ts
'use server';

import { getInngestApp, userChannel, type UserChannel, type InputData } from '@/inngest/orderLookup';
import { getSubscriptionToken, Realtime } from '@inngest/realtime';

export type HelloToken = Realtime.Token<UserChannel, ['ai']>;

// You must pass the correct InputData (at least email) to userChannel
export async function fetchRealtimeSubscriptionToken(input: InputData): Promise<HelloToken> {
    const token = await getSubscriptionToken(getInngestApp(), {
        channel: userChannel(input),
        topics: ['ai'],
    });
    return token;
}
