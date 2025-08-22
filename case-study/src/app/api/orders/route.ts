export const runtime = "nodejs";
import { NextRequest } from 'next/server';
import db from '../../../../lib/db';

export async function GET(req: NextRequest) {
    // Example: get 10 orders
    const stmt = db.prepare('SELECT * FROM orders LIMIT 10');
    const orders = stmt.all();
    return Response.json({ orders });
}
