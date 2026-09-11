import { NextResponse } from "next/server";
import { db } from "@/db";
import { deliveries, orders, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const rows = await db.select().from(deliveries).orderBy(desc(deliveries.deliveryDate));
    const [orderRows, customerRows] = await Promise.all([
      db.select().from(orders),
      db.select().from(customers),
    ]);
    const oMap = new Map(orderRows.map((o) => [o.id, o]));
    const cMap = new Map(customerRows.map((c) => [c.id, c]));
    let data = rows.map((d) => {
      const o = oMap.get(d.orderId);
      return {
        ...d,
        orderNumber: o?.orderNumber ?? "—",
        customer: cMap.get(o?.customerId ?? -1)?.name ?? "—",
      };
    });
    if (orderId) data = data.filter((d) => d.orderId === Number(orderId));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.orderId) return NextResponse.json({ error: "Order is required" }, { status: 400 });
    if (!b.deliveredQuantity || Number(b.deliveredQuantity) <= 0)
      return NextResponse.json({ error: "Delivered quantity is required" }, { status: 400 });
    const [row] = await db
      .insert(deliveries)
      .values({
        orderId: Number(b.orderId),
        deliveryDate: b.deliveryDate || new Date().toISOString().slice(0, 10),
        deliveredQuantity: Number(b.deliveredQuantity),
        recipient: b.recipient || null,
        deliveryAddress: b.deliveryAddress || null,
        status: b.status || "DELIVERED",
        notes: b.notes || null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    const [row] = await db
      .update(deliveries)
      .set({
        deliveryDate: b.deliveryDate,
        deliveredQuantity: Number(b.deliveredQuantity),
        recipient: b.recipient,
        deliveryAddress: b.deliveryAddress,
        status: b.status,
        notes: b.notes,
      })
      .where(eq(deliveries.id, Number(b.id)))
      .returning();
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
