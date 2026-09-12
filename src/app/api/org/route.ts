import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [orgRows, userRows] = await Promise.all([
      db.select().from(organizations),
      db.select().from(users),
    ]);
    return NextResponse.json({ org: orgRows[0] ?? null, users: userRows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.queryError?.message || e?.cause?.message || e?.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    const [row] = await db
      .update(organizations)
      .set({ name: b.name, phone: b.phone, email: b.email, address: b.address })
      .where(eq(organizations.id, 1))
      .returning();
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e?.queryError?.message || e?.cause?.message || e?.message || "Unknown error" }, { status: 500 });
  }
}
