import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(products);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e?.queryError?.message || e?.cause?.message || e?.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.name) return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    const [row] = await db
      .insert(products)
      .values({
        organizationId: 1,
        name: b.name,
        description: b.description || null,
        category: b.category || null,
        sellingPrice: Number(b.sellingPrice) || 0,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.queryError?.message || e?.cause?.message || e?.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    const [row] = await db
      .update(products)
      .set({
        name: b.name,
        description: b.description,
        category: b.category,
        sellingPrice: Number(b.sellingPrice) || 0,
      })
      .where(eq(products.id, Number(b.id)))
      .returning();
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e?.queryError?.message || e?.cause?.message || e?.message || "Unknown error" }, { status: 500 });
  }
}
