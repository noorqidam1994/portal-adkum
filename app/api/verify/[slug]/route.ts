import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VerifyPasswordSchema } from "@/validations/verify";
import bcrypt from "bcryptjs";
import * as v from "valibot";

type Params = { params: Promise<{ slug: string }> };

// POST /api/verify/[slug] — verify password for a protected link
// Returns a short-lived access token, never the raw targetUrl
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = v.safeParse(VerifyPasswordSchema, body);

    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const { password } = parsed.output;

    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link || !link.isActive) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    if (!link.isProtected || !link.passwordHash) {
      return NextResponse.json(
        { error: "This link is not password protected" },
        { status: 400 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, link.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Create a short-lived access token (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const accessToken = await prisma.accessToken.create({
      data: {
        linkId: link.id,
        expiresAt,
      },
    });

    return NextResponse.json({ token: accessToken.token });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
