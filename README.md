# Portal Adkum

Portal Adkum merupakan platform terintegrasi yang dikembangkan untuk memfasilitasi pengelolaan, akses, dan distribusi layanan administrasi hukum dalam satu sistem terpadu. Aplikasi ini dirancang untuk meningkatkan efisiensi, transparansi, serta kemudahan dalam pencarian dan pengolahan informasi hukum.

## Fitur Utama

- **Manajemen Tautan Hierarkis** — Dukung tautan induk dan anak (parent-child) dengan pengurutan kustom
- **Proteksi Password** — Tautan sensitif dapat dilindungi dengan password; akses diberikan melalui token sementara (5 menit)
- **Analitik Klik** — Setiap tautan mencatat jumlah klik secara otomatis
- **Manajemen Pengguna** — Role-based access control dengan dua peran: `superadmin` dan `admin`
- **Upload Gambar** — Ikon/logo kustom per tautan via Vercel Blob
- **Progressive Web App (PWA)** — Dapat diinstal di perangkat mobile/desktop, mendukung mode offline
- **Dark Mode** — Dukungan tema terang dan gelap
- **Responsif** — Tampilan optimal di mobile, tablet, dan desktop

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 15.2 (App Router), React 19 |
| Bahasa | TypeScript 5 |
| Database | PostgreSQL + Prisma ORM 7 |
| Autentikasi | NextAuth v5 (JWT, Credentials) |
| State Management | TanStack React Query 5 |
| HTTP Client | Axios |
| UI | Tailwind CSS 4, Radix UI |
| Upload | react-dropzone + Vercel Blob |
| Validasi | Valibot |
| PWA | @ducanh2912/next-pwa |

## Prasyarat

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

## Instalasi

**1. Clone repositori**

```bash
git clone https://github.com/noorqidam1994/portal-adkum.git
cd portal-adkum
```

**2. Install dependensi**

```bash
pnpm install
```

**3. Konfigurasi environment**

```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/portal_adkum"
AUTH_SECRET="<generate dengan: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_PROFILE_NAME="Portal Adkum"
NEXT_PUBLIC_PROFILE_DESCRIPTION="All my important links in one place"
NEXT_PUBLIC_PROFILE_IMAGE_URL="https://..."

# Untuk fitur upload gambar (Vercel Blob) — otomatis tersedia di Vercel,
# atau generate manual via: vercel blob --help
BLOB_READ_WRITE_TOKEN="vercelblob:..."
```

**4. Setup database**

```bash
# Terapkan skema ke database
pnpm db:push

# Jalankan seed data awal
pnpm db:seed
```

**5. Jalankan development server**

```bash
pnpm dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

## Data Awal (Seed)

Setelah menjalankan `pnpm db:seed`, data berikut dibuat secara otomatis:

**Pengguna**

| Role | Email | Password |
|---|---|---|
| Superadmin | distribusidanpublikasi@gmail.com | AsdepAdkum@!123 |

**Contoh tautan (hanya dibuat jika belum ada tautan)**

| Judul | Slug | Password |
|---|---|---|
| Permohonan Perlindungan Hukum | `permohonan-perlindungan-hukum` | rahasia123 |
| Granat (Grasi, Rehabilitasi, Amnesti, Naturalisasi, dan Abolisi) | `granat-grasi-rahabilitasi-...` | secret123 |

> **Penting:** Ganti semua password default segera setelah setup di lingkungan produksi.

## Scripts

```bash
pnpm dev           # Jalankan development server
pnpm build         # Build untuk produksi
pnpm start         # Jalankan production server
pnpm lint          # Lint kode

pnpm db:generate   # Regenerate Prisma client
pnpm db:push       # Terapkan skema ke database tanpa migrasi
pnpm db:migrate    # Buat dan terapkan migrasi
pnpm db:seed       # Jalankan seed script
```

## Struktur Proyek

```
portal-adkum/
├── app/
│   ├── api/                    # API Routes
│   │   ├── [slug]/             # Redirect tautan publik
│   │   ├── go/[slug]/          # Short link redirect
│   │   ├── links/              # CRUD tautan
│   │   ├── admin/
│   │   │   ├── links/          # Manajemen tautan (admin)
│   │   │   ├── users/          # Manajemen pengguna (superadmin)
│   │   │   └── me/password/    # Ganti password sendiri
│   │   ├── upload/             # Upload gambar ke Vercel Blob
│   │   └── verify/[slug]/      # Verifikasi password tautan
│   ├── admin/                  # Halaman dashboard admin
│   ├── [slug]/                 # Halaman password untuk tautan terproteksi
│   ├── login/                  # Halaman login
│   └── page.tsx                # Halaman publik utama
├── components/
│   ├── admin/                  # Komponen admin (LinkTable, UserForm)
│   ├── ui/                     # Komponen UI reusable
│   ├── providers/              # Context providers
│   ├── LinkCard.tsx            # Kartu tautan publik
│   └── ThemeToggle.tsx         # Toggle dark mode
├── lib/                        # Utility (prisma, api client, query config)
├── queries/                    # React Query hooks
├── validations/                # Skema validasi Valibot
├── prisma/
│   ├── schema.prisma           # Skema database
│   └── seed.ts                 # Script seed
├── types/                      # TypeScript type definitions
├── auth.ts                     # Konfigurasi NextAuth
├── middleware.ts               # Middleware proteksi rute
└── prisma.config.ts            # Konfigurasi koneksi database (Prisma 7)
```

## API Reference

### Publik

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/links` | Ambil semua tautan aktif |
| GET | `/api/[slug]` | Redirect ke target (increment klik) |
| GET | `/api/go/[slug]` | Short link redirect |
| POST | `/api/verify/[slug]` | Verifikasi password tautan terproteksi |

### Admin (memerlukan autentikasi)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/links` | Ambil semua tautan (termasuk anak) |
| POST | `/api/links` | Buat tautan baru |
| PUT | `/api/links/[id]` | Update tautan |
| DELETE | `/api/links/[id]` | Hapus tautan |
| POST | `/api/upload` | Upload gambar (maks. 2MB; JPEG, PNG, WebP, GIF, SVG) |
| POST | `/api/admin/me/password` | Ganti password sendiri |

### Superadmin only

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/users` | Ambil semua pengguna |
| POST | `/api/admin/users` | Buat pengguna baru |
| PUT | `/api/admin/users/[id]` | Update data pengguna |

## Skema Database

### User
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| name | String | Nama pengguna |
| email | String | Unique |
| passwordHash | String | bcrypt (12 rounds) |
| role | Enum | `superadmin` \| `admin` |
| isActive | Boolean | Default: true |

### Link
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| parentId | UUID? | Self-referencing (cascade delete) |
| title | String | Judul tautan |
| slug | String | Unique, digunakan di URL |
| targetUrl | String | URL tujuan redirect |
| isProtected | Boolean | Default: false |
| passwordHash | String? | bcrypt, null jika tidak terproteksi |
| imageUrl | String? | URL ikon/logo kustom |
| isActive | Boolean | Default: true |
| sortOrder | Int | Urutan tampil |
| clickCount | Int | Jumlah klik |

### AccessToken
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID | Primary key |
| token | UUID | Unique, auto-generated |
| linkId | UUID | Foreign key ke Link (cascade delete) |
| expiresAt | DateTime | TTL 5 menit |

## Alur Akses Tautan Terproteksi

```
User klik tautan → Redirect ke /{slug} (halaman password)
  → Input password → POST /api/verify/{slug}
    → Validasi berhasil → AccessToken dibuat (5 menit)
      → Redirect ke /api/{slug}?token=<token>
        → Token divalidasi → Klik dicatat → Token dikonsumsi
          → Redirect ke targetUrl
```

## Role & Hak Akses

| Fitur | Admin | Superadmin |
|---|:---:|:---:|
| Lihat & kelola tautan | ✅ | ✅ |
| Upload gambar | ✅ | ✅ |
| Ganti password sendiri | ✅ | ✅ |
| Lihat & kelola pengguna | ❌ | ✅ |
| Buat pengguna baru | ❌ | ✅ |

## Deployment

Aplikasi ini dioptimalkan untuk deployment di [Vercel](https://vercel.com).

1. Hubungkan repositori ke Vercel
2. Tambahkan semua environment variable dari `.env.example` di dashboard Vercel
3. Aktifkan [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) untuk fitur upload gambar
4. Deploy

## Lisensi

Dikembangkan untuk keperluan internal — Sekretariat Negara Republik Indonesia.
