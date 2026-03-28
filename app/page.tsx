import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Quickflow</h1>
        <p className="mt-2 text-lg text-[var(--muted-foreground)]">
          Agency project management, proposals &amp; accountability — all in one
          place.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-[var(--secondary)] transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
