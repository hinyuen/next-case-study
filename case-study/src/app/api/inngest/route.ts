import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { helloWorld } from '@/inngest/functions';
import { orderLookup } from '@/inngest/orderLookup';
export const runtime = 'nodejs';
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        orderLookup,
        /* your functions will be passed here later! */
    ],
});
