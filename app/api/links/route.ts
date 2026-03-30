import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateLinkSchema } from "@/validations/link";
import bcrypt from "bcryptjs";
import * as v from "valibot";

// GET /api/links — public, returns active parent links with their active children
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const sanitize = (link: (typeof links)[number]) => {
      const { passwordHash, children, ...rest } = link;
      return {
        ...rest,
        children: children.map(({ passwordHash: _ph, ...child }) => child),
      };
    };

    return NextResponse.json(links.map(sanitize));
  } catch {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

// POST /api/links — admin only, create a new link
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = v.safeParse(CreateLinkSchema, body);

    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const {
      title, description, slug, targetUrl, imageUrl,
      isProtected, password, isActive, sortOrder, parentId,
    } = parsed.output;

    if (isProtected && (!password || password.trim() === "")) {
      return NextResponse.json(
        { error: "Password is required for protected links" },
        { status: 400 }
      );
    }

    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A link with this slug already exists" },
        { status: 409 }
      );
    }

    if (parentId) {
      const parent = await prisma.link.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent link not found" }, { status: 404 });
      }
      if (parent.parentId) {
        return NextResponse.json(
          { error: "Child links cannot have children" },
          { status: 400 }
        );
      }
    }

    const passwordHash = isProtected && password ? await bcrypt.hash(password, 12) : null;

    const link = await prisma.link.create({
      data: {
        title, description, slug, targetUrl,
        imageUrl: imageUrl ?? null,
        isProtected, passwordHash, isActive, sortOrder,
        parentId: parentId ?? null,
      },
      include: { children: true },
    });

    const { passwordHash: ph, children, ...rest } = link;
    return NextResponse.json(
      { ...rest, hasPassword: Boolean(ph), children: [] },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
