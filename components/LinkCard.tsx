"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PublicLink } from "@/queries/links";

type Props = {
  link: PublicLink;
};

export function LinkCard({ link }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = link.children.length > 0;

  const granatLogo =
    link.imageUrl ??
    (link.title.toLowerCase().includes("granat") ? "/siap-granat.png" : null);

  function handleClick() {
    if (hasChildren) {
      setExpanded((v) => !v);
      return;
    }
    if (link.isProtected) {
      router.push(`/${link.slug}`);
    } else {
      window.location.href = `/api/${link.slug}`;
    }
  }

  return (
    <div className="flex flex-col">
      <button
        className="group block w-full text-left outline-none cursor-pointer"
        onClick={handleClick}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={`Open ${link.title}`}
      >
        <div className="relative flex items-stretch gap-3 sm:gap-5 pl-0 pr-3 sm:pr-5 py-0 min-h-20 sm:min-h-22 rounded-2xl border border-(--border) bg-(--bg-surface) shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(2,8,23,0.55)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_14px_45px_rgba(2,8,23,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) overflow-hidden">
          {/* Glass highlight */}
          <span className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-white/10 via-white/5 to-transparent dark:from-white/20 opacity-40 group-hover:opacity-60 transition-opacity duration-200" />
          <span className="pointer-events-none absolute -top-1/2 right-0 z-0 h-[160%] w-1/2 bg-linear-to-l from-white/10 to-transparent opacity-30 blur-2xl" />

          {/* Icon / image */}
          <div className="relative z-10 shrink-0 w-18 sm:w-26 self-stretch rounded-l-2xl rounded-r-lg bg-(--bg-elevated) flex items-center justify-center text-(--accent) font-semibold text-base select-none overflow-hidden">
            {granatLogo ? (
              <Image
                src={granatLogo}
                alt={`${link.title} logo`}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              link.title.charAt(0).toUpperCase()
            )}
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center py-3 sm:py-4">
            <p className="text-sm sm:text-base font-bold text-(--text-primary) leading-snug whitespace-normal transition-colors duration-150">
              {link.title}
            </p>
            {link.description && (
              <p className="text-xs sm:text-sm text-(--text-secondary) mt-1 whitespace-normal transition-colors duration-150">
                {link.description}
              </p>
            )}
          </div>

          {/* Right badges + icon */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0 py-3 sm:py-4">
            {link.isProtected && !hasChildren && (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#1e293b] border border-[#fcd34d]/30 text-[#fcd34d] text-xs sm:text-sm font-semibold leading-none shadow-[0_0_12px_rgba(252,211,77,0.08)]">
                <LockIcon />
                <span className="hidden min-[400px]:inline">Protected</span>
              </span>
            )}
            {hasChildren && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-(--bg-elevated) border border-(--border) text-(--text-muted) text-xs font-medium">
                {link.children.length}
              </span>
            )}
            <span className="w-8 h-8 rounded-full bg-(--bg-elevated) border border-(--border) flex items-center justify-center text-(--text-secondary) group-hover:text-(--accent) transition-all duration-200">
              {hasChildren ? (
                <ChevronIcon rotated={expanded} />
              ) : (
                <ChevronIcon />
              )}
            </span>
          </div>
        </div>
      </button>

      {/* Children list */}
      {hasChildren && expanded && (
        <div className="mt-2 ml-5 sm:ml-8 flex flex-col gap-2">
          {link.children.map((child) => (
            <ChildLinkCard key={child.id} link={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChildLinkCard({ link }: { link: PublicLink }) {
  const router = useRouter();

  const granatLogo =
    link.imageUrl ??
    (link.title.toLowerCase().includes("granat") ? "/siap-granat.png" : null);

  function handleClick() {
    if (link.isProtected) {
      router.push(`/${link.slug}`);
    } else {
      window.location.href = `/api/${link.slug}`;
    }
  }

  return (
    <button
      className="group block w-full text-left outline-none cursor-pointer"
      onClick={handleClick}
      aria-label={`Open ${link.title}`}
    >
      <div className="relative flex items-center gap-3 px-3 py-2.5 min-h-14 rounded-xl border border-(--border) bg-(--bg-surface) transition-all duration-200 hover:bg-(--bg-elevated) hover:border-(--accent)/40 focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-1 focus-visible:ring-offset-(--bg-base) overflow-hidden">
        {/* Small icon */}
        <div className="shrink-0 w-9 h-9 rounded-lg bg-(--bg-elevated) flex items-center justify-center text-(--accent) font-semibold text-sm overflow-hidden">
          {granatLogo ? (
            <Image
              src={granatLogo}
              alt={`${link.title} logo`}
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          ) : (
            link.title.charAt(0).toUpperCase()
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-(--text-primary) leading-snug truncate">
            {link.title}
          </p>
          {link.description && (
            <p className="text-xs text-(--text-secondary) mt-0.5 truncate">{link.description}</p>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {link.isProtected && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#1e293b] border border-[#fcd34d]/30 text-[#fcd34d] text-[0.7rem] font-semibold leading-none">
              <LockIcon size={11} />
              <span className="hidden min-[400px]:inline">Protected</span>
            </span>
          )}
          <span className="w-6 h-6 rounded-full bg-(--bg-elevated) border border-(--border) flex items-center justify-center text-(--text-secondary) group-hover:text-(--accent) transition-colors duration-200">
            <ChevronIcon size={10} />
          </span>
        </div>
      </div>
    </button>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronIcon({ size = 14, rotated }: { size?: number; rotated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transition: "transform 0.2s", transform: rotated ? "rotate(90deg)" : undefined }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
