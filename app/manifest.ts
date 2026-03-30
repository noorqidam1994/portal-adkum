import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portal Adkum — Kementerian Sekretariat Negara",
    short_name: "Portal Adkum",
    description:
      "Pusat akses layanan dan dokumen administrasi hukum dalam satu portal untuk memudahkan pengelolaan dan pencarian informasi hukum secara cepat dan terintegrasi",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48 256x256",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
