// ex. /app/actions/get-subscribe-token.ts
'use server';

import { getInngestApp, userChannel, type UserChannel } from '@/inngest/orderLookup';
import { getSubscriptionToken, Realtime } from '@inngest/realtime';

export type HelloToken = Realtime.Token<UserChannel, ['ai']>;

// You must pass the correct InputData (at least email) to userChannel
export async function fetchRealtimeSubscriptionToken(): Promise<HelloToken> {
    const token = await getSubscriptionToken(getInngestApp(), {
        channel: userChannel('123'),
        topics: ['ai'],
    });
    return token;
}
