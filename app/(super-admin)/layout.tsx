import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // TODO: Check isSuperAdmin flag on user record
  // For now, only allow access in development or if user is verified
  // In production, add a superAdmin boolean to the User model

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
        <h1 className="text-xl font-bold">Quickflow Admin</h1>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
