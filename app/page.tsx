"use client";

import Image from "next/image";
import { usePublicLinks } from "@/queries/links";
import { LinkCard } from "@/components/LinkCard";

const PROFILE_NAME = process.env.NEXT_PUBLIC_PROFILE_NAME ?? "Portal Adkum";
const PROFILE_DESCRIPTION =
  process.env.NEXT_PUBLIC_PROFILE_DESCRIPTION ??
  "Pusat akses layanan dan dokumen administrasi hukum dalam satu portal untuk memudahkan pengelolaan dan pencarian informasi hukum secara cepat dan terintegrasi";
const PROFILE_IMAGE = "/logo-setneg.svg";

export default function HomePage() {
  const { data: links, isLoading, error } = usePublicLinks();

  return (
    <main className="min-h-screen bg-(--bg-base) flex flex-col items-center px-4">
      <div className="w-full max-w-160 flex flex-col gap-10 sm:gap-12 pt-16 pb-20 max-[480px]:pt-10 max-[480px]:pb-14">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center mt-2">
            <Image
              src={PROFILE_IMAGE}
              alt={PROFILE_NAME}
              width={112}
              height={112}
              className="w-full h-full object-contain drop-shadow-lg"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-(--text-primary) m-0 leading-snug px-2">
            {PROFILE_NAME}&nbsp;Kementerian Sekretariat Negara
          </h1>
          <p className="text-sm sm:text-[0.9375rem] text-(--text-secondary) max-w-full sm:max-w-95 leading-normal px-2">
            {PROFILE_DESCRIPTION}
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col gap-3">
          {isLoading && !links && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 sm:h-22 rounded-2xl border border-[#2a3a50] skeleton-shimmer"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-[#f87171] py-8 text-[0.9375rem]">
              Failed to load links. Please refresh the page.
            </div>
          )}

          {!isLoading && !error && links?.length === 0 && (
            <div className="text-center text-[#64748b] py-8 text-[0.9375rem]">
              No links available.
            </div>
          )}

          {links?.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>

      <footer className="w-full max-w-160 border-t border-(--border) py-6 flex flex-col items-center gap-1 text-center">
        <p className="text-xs text-(--text-secondary)">
          &copy; {new Date().getFullYear()} Asisten Deputi Administrasi Hukum
        </p>
        <p className="text-xs text-(--text-secondary)">
          Kementerian Sekretariat Negara Republik Indonesia
        </p>
      </footer>
    </main>
  );
}
