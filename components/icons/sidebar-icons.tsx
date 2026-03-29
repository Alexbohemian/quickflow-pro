interface IconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <circle cx="24.5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <circle cx="24.5" cy="21" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <circle cx="16" cy="26" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <circle cx="7.5" cy="21" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <circle cx="7.5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
      <line x1="16" y1="8.5" x2="22.5" y2="11" stroke="currentColor" strokeWidth="1.2" />
      <line x1="22.5" y1="13.5" x2="22.5" y2="18.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="22.5" y1="21" x2="16" y2="23.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="13.5" y1="23.5" x2="9.5" y2="21" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9.5" y1="18.5" x2="9.5" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9.5" y1="11" x2="13.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="8.5" x2="16" y2="23.5" stroke="currentColor" strokeWidth="1" />
      <line x1="9.5" y1="11" x2="22.5" y2="21" stroke="currentColor" strokeWidth="1" />
      <line x1="22.5" y1="11" x2="9.5" y2="21" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function DashboardIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 6v5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="6" r="0.75" fill="currentColor" />
      <circle cx="16" cy="11" r="0.75" fill="currentColor" />
      <circle cx="6" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function ProjectsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="10" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="10" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="14" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ClientsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <rect x="3" y="7" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3h3A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function ProposalIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <rect x="4" y="2" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14 15l2-2v4h-4l2-2z" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function LeadsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="2" fill="currentColor" />
      <line x1="11" y1="2" x2="11" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="17" x2="11" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function InvoicesIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <rect x="4" y="2" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <text x="13" y="16.5" fontSize="7" fontWeight="600" fontFamily="Inter" fill="currentColor">$</text>
    </svg>
  );
}

export function TeamIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <circle cx="11" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M19 18c1.5-0.5 3-2 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="4.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 18c-1.5-0.5-3-2-3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function AnalyticsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <line x1="4" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="17" x2="11" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PerksIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="12" width="18" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="7" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="7" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7c0 0-1-5-4-5s-2 3 0 4c1.5 0.75 4 1 4 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7c0 0 1-5 4-5s2 3 0 4c-1.5 0.75-4 1-4 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FaqsIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.5-1.5 2-2 3v0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function TicketIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CommunityIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 19c0-3 2.5-5.5 6-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 19c0-3-2.5-5.5-6-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 13.5c1 0.5 2.5 0.5 3 0.5s2-0 3-0.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUpDownIcon({ className, size = 8 }: IconProps) {
  return (
    <svg width={size} height={size * 2} viewBox="0 0 8 16" fill="none" className={className}>
      <path d="M4 2l3 4H1l3-4z" fill="currentColor" />
      <path d="M4 14l3-4H1l3 4z" fill="currentColor" />
    </svg>
  );
}
