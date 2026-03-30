import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PasswordForm } from "@/components/PasswordForm";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const link = await prisma.link.findUnique({
    where: { slug, isActive: true },
    select: { title: true },
  });

  return {
    title: link ? `${link.title} — Enter Password` : "Link Not Found",
  };
}

export default async function PasswordPage({ params }: Props) {
  const { slug } = await params;
  const link = await prisma.link.findUnique({
    where: { slug, isActive: true },
    select: {
      title: true,
      description: true,
      isProtected: true,
      slug: true,
      // Never expose targetUrl at this stage
    },
  });

  if (!link) {
    notFound();
  }

  // If the link is not protected, redirect via the API route directly
  if (!link.isProtected) {
    // This shouldn't normally be reached since the public page handles this,
    // but handle gracefully
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/api/${slug}"`,
        }}
      />
    );
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <PasswordForm
          slug={link.slug}
          title={link.title}
          description={link.description}
        />
      </ToastProvider>
    </QueryProvider>
  );
}
