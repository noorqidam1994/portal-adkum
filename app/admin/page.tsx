import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <AdminDashboard session={session} />;
}
