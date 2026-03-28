export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
        <h1 className="text-xl font-bold">Quickflow</h1>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
