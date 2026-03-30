import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateUserSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import * as v from "valibot";

function isSuperadmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user?.role === "superadmin";
}

// GET /api/admin/users — superadmin only
export async function GET() {
  const session = await auth();
  if (!session || !isSuperadmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
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

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users — superadmin only, create admin user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !isSuperadmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = v.safeParse(CreateUserSchema, body);

    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const { name, email, password, role } = parsed.output;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
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

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
