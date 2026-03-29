"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";
import {
  LogoIcon,
  DashboardIcon,
  ProjectsIcon,
  ClientsIcon,
  ProposalIcon,
  LeadsIcon,
  InvoicesIcon,
  TeamIcon,
  AnalyticsIcon,
  PerksIcon,
  FaqsIcon,
  TicketIcon,
  CommunityIcon,
  NotificationIcon,
  ChevronUpDownIcon,
} from "@/components/icons/sidebar-icons";
import { Menu, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
    ],
  },
  {
    label: "PROJECT MANAGEMENT",
    items: [
      { href: "/projects", label: "Projects", Icon: ProjectsIcon },
      { href: "/clients", label: "Clients", Icon: ClientsIcon },
      { href: "/proposals", label: "Proposal", Icon: ProposalIcon },
      { href: "/leads", label: "Leads Pipeline", Icon: LeadsIcon, multiline: true },
      { href: "/invoices", label: "Invoices", Icon: InvoicesIcon },
      { href: "/team", label: "Team", Icon: TeamIcon },
      { href: "/analytics", label: "Analytics", Icon: AnalyticsIcon },
      { href: "/perks", label: "Perks", Icon: PerksIcon },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { href: "#", label: "FAQs", Icon: FaqsIcon },
      { href: "#", label: "Send a Ticket", Icon: TicketIcon, multiline: true },
      { href: "#", label: "Community", Icon: CommunityIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isOpen, setCollapsed, setOpen } = useSidebarStore();
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const initials = getInitials(userName);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-[var(--border)] bg-[var(--sidebar-bg)] p-2 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-[var(--sidebar-text)]" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col bg-[var(--sidebar-bg)] transition-all duration-200",
          isCollapsed ? "w-[80px]" : "w-[220px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ boxShadow: "var(--sidebar-shadow)" }}
      >
        {/* Mobile close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1 hover:bg-[var(--accent)] lg:hidden"
        >
          <X className="h-4 w-4 text-[var(--sidebar-text)]" />
        </button>

        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-[var(--border)] px-4",
            isCollapsed ? "h-[60px] justify-center" : "h-[60px] gap-3"
          )}
        >
          <div className="rounded border border-[var(--border)] p-1.5">
            <LogoIcon size={isCollapsed ? 24 : 28} className="text-[var(--foreground)]" />
          </div>
          {!isCollapsed && (
            <span className="font-['Poppins',sans-serif] text-[14px] font-bold tracking-tight text-[var(--foreground)]">
              SECOND CREW
            </span>
          )}
        </div>

        {/* Workspace selector */}
        <div className={cn("px-3 pt-3", isCollapsed ? "px-2" : "px-3")}>
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className={cn(
              "flex w-full items-center rounded border border-[var(--border)] bg-[var(--sidebar-btn-bg)] transition-colors hover:bg-[var(--accent)]",
              isCollapsed
                ? "justify-center gap-1 px-2 py-1.5"
                : "gap-2 px-3 py-1.5"
            )}
          >
            <span className="font-['Inter',sans-serif] text-[12px] font-semibold text-[var(--sidebar-text)]">
              SC
            </span>
            {!isCollapsed && (
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[12px] font-medium text-[var(--sidebar-text)]">
                Second Crew
              </span>
            )}
            <ChevronUpDownIcon size={6} className="text-[var(--sidebar-text)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pt-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {/* Section label */}
              <p
                className={cn(
                  "mb-2 font-['Poppins',sans-serif] text-[9px] font-semibold uppercase tracking-wider text-[var(--sidebar-section-label)]",
                  isCollapsed ? "px-1 text-center" : "px-3"
                )}
              >
                {section.label}
              </p>

              {/* Items */}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      item.href !== "#" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center rounded-lg transition-colors",
                          isCollapsed
                            ? "flex-col gap-1 px-1 py-2"
                            : "gap-3 px-3 py-2",
                          isActive
                            ? "bg-[var(--sidebar-active-bg)]"
                            : "hover:bg-[var(--accent)]"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.Icon
                          size={isCollapsed ? 22 : 20}
                          className={cn(
                            "shrink-0 transition-colors",
                            isActive
                              ? "text-[var(--sidebar-text-active)]"
                              : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-active)]"
                          )}
                        />
                        {isCollapsed ? (
                          <span
                            className={cn(
                              "text-center font-['Poppins',sans-serif] text-[9px] font-medium leading-[10px]",
                              isActive
                                ? "text-[var(--sidebar-text-active)]"
                                : "text-[var(--sidebar-text)]"
                            )}
                          >
                            {item.multiline
                              ? item.label.split(" ").map((word, i) => (
                                  <span key={i} className="block">
                                    {word}
                                  </span>
                                ))
                              : item.label}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "font-['Poppins',sans-serif] text-[12px] font-medium",
                              isActive
                                ? "text-[var(--sidebar-text-active)]"
                                : "text-[var(--sidebar-text)]"
                            )}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[var(--border)] px-2 pb-3 pt-2">
          {/* Notifications */}
          <Link
            href="/notifications"
            className={cn(
              "group flex items-center rounded-lg transition-colors hover:bg-[var(--accent)]",
              isCollapsed ? "flex-col gap-1 px-1 py-2" : "gap-3 px-3 py-2"
            )}
          >
            <div className="relative">
              <NotificationIcon
                size={isCollapsed ? 22 : 20}
                className="text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-active)]"
              />
              {/* Notification dot */}
              <div className="absolute -right-0.5 -top-0.5 h-[6px] w-[6px] rounded-full bg-[var(--primary)]" />
            </div>
            {!isCollapsed && (
              <span className="font-['Poppins',sans-serif] text-[12px] font-medium text-[var(--sidebar-text)]">
                Notifications
              </span>
            )}
          </Link>

          {/* Separator */}
          <div className="my-2 border-t border-[var(--border)]" />

          {/* User avatar */}
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3 px-3"
            )}
          >
            <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--sidebar-avatar-bg)]">
              <span className="font-['Inter',sans-serif] text-[12px] font-semibold text-white">
                {initials}
              </span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-['Inter',sans-serif] text-[14px] font-semibold text-[var(--sidebar-text-active)]">
                    {userName}
                  </p>
                  <p className="font-['Inter',sans-serif] text-[12px] text-[var(--muted-foreground)]">
                    Free account
                  </p>
                </div>
                <ChevronUpDownIcon size={6} className="text-[var(--sidebar-text)]" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
