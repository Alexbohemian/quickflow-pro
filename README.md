# Quickflow

**Agency project management, proposals & accountability — all in one place.**

Quickflow is a SaaS web application for creative and consulting agencies to create proposals, manage projects, enforce timelines, and maintain full financial accountability.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| State (server) | TanStack Query v5 |
| State (client) | Zustand |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (recommend [Neon](https://neon.tech))

### Setup

```bash
# Clone
git clone https://github.com/alexbohemian/quickflow-pro.git
cd quickflow-pro

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL, NextAuth secret, and Google OAuth credentials

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data (optional)
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `demo@quickflow.com` / `Password123`

## Project Structure

```
quickflow-pro/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, Signup, Password Reset
│   ├── (workspace)/        # Agency-side pages (sidebar layout)
│   ├── (client-portal)/    # Client-facing portal
│   ├── (public)/           # Public proposal/invoice views
│   ├── (super-admin)/      # Platform admin (Phase 2)
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # Primitive components (Button, Input, Modal, etc.)
│   ├── layout/             # Sidebar, TopBar
│   └── features/           # Domain-specific (Timeline, Pricing, Signature)
├── lib/
│   ├── api/                # Response helpers, auth middleware, workspace context
│   ├── auth/               # NextAuth configuration
│   ├── db/                 # Prisma client + multi-tenant middleware
│   ├── services/           # Business logic (notifications, AI agent)
│   ├── utils/              # Utility functions
│   └── validators/         # Zod schemas
├── stores/                 # Zustand stores
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types
├── prisma/                 # Database schema + seed
└── .github/workflows/      # CI/CD
```

## Features (MVP — Phase 1)

### Auth & Multi-Tenancy
- Email + Google sign-in
- Workspace creation and switching
- Team invitation system
- 6-role RBAC (Owner, Admin, PM, Finance, Team Member, Client)

### Clients & Leads
- Client directory with Active/Inactive management
- 3-stage leads pipeline Kanban (Prospects → In Discussion → Final Step)

### Proposal Builder
- Two types: By Timeline / By Hour
- Section-based editor (Introduction, Scope, Timeline, Pricing, Penalties, Terms, Signature)
- Interactive timeline builder (weeks + tasks with dependencies)
- Pricing table with auto-calculated totals
- Type-to-sign e-signature with IP/timestamp capture
- Send to client via unique link
- Client approval flow with immutable snapshot

### AI Proposal Generation (Lite)
- 12-field intake form (project name, type, services, goals, etc.)
- Template-based content generation for Introduction, Scope, Penalties
- Ready for LLM API integration (BYOK: Anthropic/OpenAI/Google)

### Project Management
- Proposal → Project conversion on approval
- Active timeline view with task statuses and penalty tracking
- 4-column Kanban board (Backlog, To Do, In Progress, Ready to Test)
- Task detail with per-task chat
- Checklist with progress tracking
- By-Hours: maintenance requests with priority-based pricing
- Change orders: create, send for approval, client approve/reject
- Timeline auto-adjustment with business day logic

### Invoicing
- Manual invoice creation with line items
- Auto-numbered invoices (INV-0001)
- Mark as paid triggers project activation
- PDF export ready (Phase 2)

### Client Portal
- Client dashboard with project cards
- Real-time timeline view (read-only)
- Progress bar with task completion percentage

### Notifications & AI Agent
- In-app notification center with read/unread
- AI Agent (lite): task due reminders, expiry alerts, penalty accrual
- Cron-based check endpoint for all active projects

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript strict check
npm run db:generate  # Prisma generate
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio GUI
```

## Phase 2 (Planned)

- Stripe payment integration
- Analytics & penalty reporting
- Full AI Agent (chat analysis, escalation, reports)
- AI per-section assist (generate, rewrite, expand)
- Super Admin dashboard
- SMS/Call notifications (Twilio)
- Live timer widget
- PDF export (Puppeteer)

## License

Private — All rights reserved.
