import { Inngest } from "inngest";
import db from "../../lib/db";

export const inngest = new Inngest({ id: "order-lookup" });

export const orderLookup = inngest.createFunction(
  { id: "order-lookup-fn" },
  { event: "app/order.lookup" },
  async ({ event }) => {
    const { email, orderId } = event.data;
    let sql = 'SELECT * FROM orders WHERE customerEmail = ?';
    const params: string[] = [email];
    if (orderId) {
      sql += ' AND orderPublicId = ?';
      params.push(orderId);
    }
    const orders = db.prepare(sql).all(...params);
    return { orders };
  }
);
