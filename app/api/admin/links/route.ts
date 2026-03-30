import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/admin/links — admin only, returns parent links with their children
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const links = await prisma.link.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const sanitize = (link: (typeof links)[number]) => {
      const { passwordHash, children, ...rest } = link;
      return {
        ...rest,
        hasPassword: Boolean(passwordHash),
        children: children.map(({ passwordHash: cph, ...child }: { passwordHash: string | null; [key: string]: unknown }) => ({
          ...child,
          hasPassword: Boolean(cph),
          children: [],
        })),
      };
    };

    return NextResponse.json(links.map(sanitize));
  } catch {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
