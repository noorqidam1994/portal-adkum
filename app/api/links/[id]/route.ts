import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UpdateLinkSchema } from "@/validations/link";
import bcrypt from "bcryptjs";
import * as v from "valibot";

type Params = { params: Promise<{ id: string }> };

// GET /api/links/[id] — admin only
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const link = await prisma.link.findUnique({
      where: { id },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    });
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    const { passwordHash, children, ...rest } = link;
    return NextResponse.json({
      ...rest,
      hasPassword: Boolean(passwordHash),
      children: children.map(({ passwordHash: cph, ...c }) => ({
        ...c,
        hasPassword: Boolean(cph),
        children: [],
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 });
  }
}

// PUT /api/links/[id] — admin only
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = v.safeParse(UpdateLinkSchema, body);
    if (!parsed.success) {
      const errors = parsed.issues.map((i) => i.message);
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const { title, description, slug, targetUrl, imageUrl, isProtected, password, isActive, sortOrder } =
      parsed.output;

    const existing = await prisma.link.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.link.findUnique({ where: { slug } });
      if (conflict)
        return NextResponse.json({ error: "A link with this slug already exists" }, { status: 409 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (slug !== undefined) updateData.slug = slug;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ?? null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isProtected !== undefined) {
      updateData.isProtected = isProtected;
      if (!isProtected) updateData.passwordHash = null;
    }
    if (password != null && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 12);
      updateData.isProtected = true;
    } else if (password === null) {
      updateData.passwordHash = null;
      updateData.isProtected = false;
    }

    const link = await prisma.link.update({
      where: { id },
      data: updateData,
      include: { children: { orderBy: { sortOrder: "asc" } } },
    });

    const { passwordHash, children, ...rest } = link;
    return NextResponse.json({
      ...rest,
      hasPassword: Boolean(passwordHash),
      children: children.map(({ passwordHash: cph, ...c }) => ({
        ...c,
        hasPassword: Boolean(cph),
        children: [],
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}

// DELETE /api/links/[id] — admin only (cascades to children)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const existing = await prisma.link.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
