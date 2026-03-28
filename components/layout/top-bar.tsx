"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 hover:bg-[var(--secondary)]">
          <Bell className="h-5 w-5 text-[var(--muted-foreground)]" />
        </button>
        <div className="flex items-center gap-3">
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name || "User"}
            size="sm"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-[var(--muted-foreground)] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
