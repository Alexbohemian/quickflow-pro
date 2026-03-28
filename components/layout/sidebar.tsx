"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Target,
  Receipt,
  UsersRound,
  BarChart3,
  Gift,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "PROJECT MANAGEMENT",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/proposals", label: "Proposals", icon: FileText },
      { href: "/leads", label: "Leads Pipeline", icon: Target },
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/team", label: "Team", icon: UsersRound },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/perks", label: "Perks", icon: Gift },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isOpen, setCollapsed, setOpen } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--border)] bg-[var(--background)] transition-all duration-200",
          isCollapsed ? "w-16" : "w-64",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold">
              Quickflow
            </Link>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 hover:bg-[var(--secondary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className="hidden rounded-lg p-1 hover:bg-[var(--secondary)] lg:block"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-3">
          <Link
            href="/notifications"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <Bell className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link
            href="/settings/general"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
