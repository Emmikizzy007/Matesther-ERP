import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, String(email).trim().toLowerCase()));

    if (!user)
      return NextResponse.json(
        { error: "No staff account found with that email." },
        { status: 401 }
      );
    if (user.status !== "ACTIVE")
      return NextResponse.json(
        { error: "This account has been deactivated. Contact the owner." },
        { status: 403 }
      );
    if (!user.passwordHash)
      return NextResponse.json(
        { error: "No password set for this account yet. Ask the owner to set one in Settings → Users." },
        { status: 401 }
      );
    if (!verifyPassword(String(password), user.passwordHash))
      return NextResponse.json(
        { error: "Incorrect password. Try again." },
        { status: 401 }
      );

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (e: any) {
    // Surface the real Postgres error (e.g. "relation \"users\" does not exist")
    const msg =
      e?.queryError?.message ||
      e?.cause?.message ||
      e?.message ||
      "Unknown error";
    return NextResponse.json(
      {
        error:
          msg +
          "  —  If this says a table does not exist, run deploy/full-setup.sql in the Supabase project that your Netlify DATABASE_URL points to.",
      },
      { status: 500 }
    );
  }
}
