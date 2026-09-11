import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  productionBatches,
  productionOperations,
  orders,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { refreshBatchAndOrder } from "@/lib/server";

const STAGES = [
  "CUTTING",
  "SEWING",
  "MONOGRAMMING",
  "BUTTONHOLE",
  "BUTTON_TACKING",
  "IRONING",
  "PACKING",
  "DELIVERY",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const rows = orderId
      ? await db.select().from(productionBatches).where(eq(productionBatches.orderId, Number(orderId)))
      : await db.select().from(productionBatches);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** Start production: create a batch + the 7 Matesther stages */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.orderId) return NextResponse.json({ error: "Order is required" }, { status: 400 });
    if (!b.quantity || Number(b.quantity) <= 0)
      return NextResponse.json({ error: "Batch quantity is required" }, { status: 400 });

    const [order] = await db.select().from(orders).where(eq(orders.id, Number(b.orderId)));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const existing = await db
      .select()
      .from(productionBatches)
      .where(eq(productionBatches.orderId, Number(b.orderId)));
    const suffix = String.fromCharCode(65 + existing.length);
    const batchNumber = b.batchNumber || `B-${order.orderNumber.replace("ORD-", "")}-${suffix}`;

    const [batch] = await db
      .insert(productionBatches)
      .values({
        orderId: Number(b.orderId),
        orderItemId: b.orderItemId ? Number(b.orderItemId) : null,
        batchNumber,
        quantity: Number(b.quantity),
        status: "PENDING",
      })
      .returning();

    const firstQty = Number(b.quantity);
    for (let i = 0; i < STAGES.length; i++) {
      await db.insert(productionOperations).values({
        productionBatchId: batch.id,
        stage: STAGES[i],
        workerId: i === 0 && b.workerId ? Number(b.workerId) : null,
        quantityReceived: i === 0 ? firstQty : 0,
        quantityCompleted: 0,
        quantityRejected: 0,
        quantityRemaining: i === 0 ? firstQty : 0,
        status: "PENDING",
        expectedCompletionDate: b.expectedCompletionDate || order.dueDate || null,
        notes: null,
      });
    }
    await refreshBatchAndOrder(batch.id);
    return NextResponse.json(batch, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await db.delete(productionBatches).where(eq(productionBatches.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
