import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ChangePasswordSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import * as v from "valibot";

// POST /api/admin/me/password — change own password (any authenticated user)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = v.safeParse(ChangePasswordSchema, body);

    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.output;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
