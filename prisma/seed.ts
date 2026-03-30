import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create superadmin
  const superadminEmail = "distribusidanpublikasi@gmail.com";
  const superadminPassword = "AsdepAdkum@!123";

  const existingSuperadmin = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existingSuperadmin) {
    const passwordHash = await bcrypt.hash(superadminPassword, 12);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superadminEmail,
        passwordHash,
        role: "superadmin",
        isActive: true,
      },
    });
  } else {
    console.log(`ℹ️  Superadmin already exists: ${superadminEmail}`);
  }

  // Seed example links
  const existingLinks = await prisma.link.count();
  if (existingLinks === 0) {
    await prisma.link.createMany({
      data: [
        {
          title: "Permohonan Perlindungan Hukum",
          description:
            "Pengelolaan Rekapitulasi Data Permohonan Perlindungan Hukum",
          slug: "permohonan-perlindungan-hukum",
          targetUrl: "https://drive.google.com/file/d/example1",
          isProtected: true,
          passwordHash: await bcrypt.hash("rahasia123", 12),
          isActive: true,
          sortOrder: 1,
        },
        {
          title:
            "Granat (Grasi, Rahabilitasi, Amnesti, Naturalisasi, dan Abolisi)",
          description:
            "Sistem administrasi permohonan Grasi, Rehabilitasi, Amnesti, Naturalisasi, dan Abolisi Terintegrasi",
          slug: "granat-grasi-rahabilitasi-amnesti-naturalisasi-dan-abolisi",
          targetUrl: "https://drive.google.com/file/d/example2",
          isProtected: true,
          passwordHash: await bcrypt.hash("secret123", 12),
          isActive: true,
          sortOrder: 2,
        },
      ],
    });
    console.log("✅ Example links created");
    console.log("   - public-doc: no password");
    console.log("   - confidential-report: password is 'secret123'");
  } else {
    console.log("ℹ️  Links already exist, skipping seed");
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
