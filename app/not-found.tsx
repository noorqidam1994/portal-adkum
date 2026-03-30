import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a]">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="text-[5rem] font-extrabold text-[#1e293b] leading-none tracking-[-0.04em]">404</div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] m-0">Link Not Found</h1>
        <p className="text-[0.9375rem] text-[#64748b] max-w-[320px] leading-normal">
          The link you&apos;re looking for doesn&apos;t exist or has been
          disabled.
        </p>
        <Link href="/" className="inline-flex items-center gap-1 mt-2 text-[#818cf8] text-[0.9375rem] font-medium no-underline transition-colors duration-150 hover:text-[#6366f1]">
          ← Back to all links
        </Link>
      </div>
    </main>
  );
}
