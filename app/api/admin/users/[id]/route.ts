import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UpdateUserSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import * as v from "valibot";
import type { Session } from "next-auth";

type Params = { params: Promise<{ id: string }> };

function isSuperadmin(session: Session | null) {
  return session?.user?.role === "superadmin";
}

// PUT /api/admin/users/[id] — superadmin only
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || !isSuperadmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = v.safeParse(UpdateUserSchema, body);

    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const { name, password, role, isActive } = parsed.output;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent superadmin from disabling themselves
    if (id === session.user?.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password !== undefined && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
