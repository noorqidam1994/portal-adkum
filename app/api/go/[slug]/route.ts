import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/go/[slug] — handles link click for non-protected links
// Increments clickCount and redirects to targetUrl
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protected link requires a valid token
    if (link.isProtected) {
      if (!token) {
        return NextResponse.redirect(
          new URL(`/go/${slug}`, req.url)
        );
      }

      // Validate the access token
      const accessToken = await prisma.accessToken.findUnique({
        where: { token },
        include: { link: true },
      });

      if (
        !accessToken ||
        accessToken.linkId !== link.id ||
        accessToken.expiresAt < new Date()
      ) {
        // Invalid or expired token — send back to password page with error
        const passwordUrl = new URL(`/go/${slug}`, req.url);
        passwordUrl.searchParams.set("error", "expired");
        return NextResponse.redirect(passwordUrl);
      }

      // Valid token — consume it, increment click count, redirect
      await prisma.$transaction([
        prisma.accessToken.delete({ where: { id: accessToken.id } }),
        prisma.link.update({
          where: { id: link.id },
          data: { clickCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.redirect(link.targetUrl);
    }

    // Non-protected link — just increment and redirect
    await prisma.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.redirect(link.targetUrl);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
