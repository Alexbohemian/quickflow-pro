export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
