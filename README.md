# recoin

> **Note**: Recoin is actively being developed and is not yet ready for production use.

Recoin is a local-first personal finance tracker built as a test case for [Retend](https://github.com/resuite/retend). It helps you track your personal finances with a focus on simplicity and clarity.

## Core (intended) Features

-  Transaction tracking with categories
-  Real-time balance calculations
-  Budget management
-  Goals and progress tracking
-  Spending reports
-  Google authentication
-  AI chat interface

## Technology Stack

-  **Framework**: Retend
-  **Styling**: Tailwind CSS v4
-  **Database**: LiveStore (local-first with OPFS), Drizzle ORM on Cloudflare Workers
-  **Backend**: Hono
-  **Build**: Vite with Rolldown
-  **Runtime**: Bun

## Getting Started

### Prerequisites

-  Bun v1.0+
-  A cloudflare account
-  Google OAuth credentials

### Installation

```bash
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Environment Variables

```env
VITE_BASE_URL=
VITE_PRE_RELEASE=true
VITE_GOOGLE_CLIENT_ID=

CF_DRIZZLE_API_TOKEN==
CF_ACCOUNT_ID=
CF_DATABASE_ID=
CF_ENVIRONMENT="development"

CF_GOOGLE_PROJECT_ID=
CF_GOOGLE_CLIENT_ID=
CF_GOOGLE_CLIENT_SECRET=
ADMIN_SECRET=
```

## Project Structure

```
├── api/                    # Server-side routes
├── components/             # UI components
├── database/               # LiveStore models and schema
├── pages/                  # Application pages
├── scopes/                 # Application contexts
└── utilities/              # Helper functions
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run lint         # Lint code
bun run check        # Type check
```
