# Pagaê - Personal Finance Management Application

## Overview

Pagaê is a personal finance management web application that helps users track bills, manage payments, and get AI-powered financial insights. The app supports installment, monthly, and annual recurring bills with automatic balance tracking. It includes an AI report generation system (powered by OpenAI via Replit AI Integrations), a credit-based usage model for AI features, user notifications, and full internationalization support (English and Brazilian Portuguese). Authentication is handled via Replit Auth (OpenID Connect).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no dedicated client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support). Custom fonts: Inter (body) and Outfit (display)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Charts**: Recharts for financial data visualization (bar charts, pie charts)
- **Date Handling**: date-fns for formatting and manipulation
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Protected Routes**: Components check auth state and redirect to landing page if unauthenticated

### Backend

- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via tsx in development
- **Build**: Custom build script using esbuild (server) + Vite (client). Production output goes to `dist/`
- **API Design**: RESTful JSON API under `/api/` prefix. API contracts defined in `shared/routes.ts` using Zod schemas for input validation and response typing
- **Authentication**: Replit Auth via OpenID Connect (passport + openid-client). Sessions stored in PostgreSQL via connect-pg-simple
- **AI Integration**: OpenAI API (via Replit AI Integrations proxy) for generating financial reports. Uses a credit system where each report costs 1 credit
- **Dev Server**: Vite dev server runs as middleware in development mode with HMR

### Shared Layer (`shared/`)

- **Schema**: Drizzle ORM table definitions in `shared/schema.ts` and `shared/models/`
- **Routes Contract**: `shared/routes.ts` defines the full API contract (paths, methods, Zod input/output schemas) shared between client and server
- **Models**: `auth.ts` (users, sessions), `chat.ts` (conversations, messages for AI chat features)

### Database

- **Database**: PostgreSQL (required, referenced by `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Push**: Use `npm run db:push` (drizzle-kit push) to sync schema to database
- **Migrations**: Output directory is `./migrations`
- **Key Tables**:
  - `users` - User profiles with balance, language, currency, notification preferences
  - `sessions` - Express session storage for Replit Auth
  - `invoices` - Bills with status (paid/unpaid/overdue), recurrence type (none/monthly/annual/installment), installment tracking
  - `credits` - AI credit balance per user
  - `ai_reports` - Generated AI financial analysis reports (stored as JSONB)
  - `notifications` - User notifications for overdue/paid bills
  - `conversations` / `messages` - AI chat history

### Key Design Decisions

1. **Shared API Contract**: The `shared/routes.ts` file acts as a single source of truth for API endpoints, keeping client hooks and server routes in sync via Zod schemas.

2. **Credit-Based AI**: AI report generation requires credits, preventing unlimited API usage. Credits are stored in a dedicated table and checked before each generation.

3. **User Settings on Auth Table**: User preferences (language, currency, balance, notifications) are stored directly on the users table rather than a separate settings table, simplifying queries.

4. **Replit Auth Integration**: Authentication delegates to Replit's OpenID Connect provider. The `server/replit_integrations/auth/` directory contains all auth setup including session management, passport strategy, and user upsert logic.

5. **Internationalization**: Simple approach using conditional rendering based on `user.language` field ("en" or "pt-BR") rather than a full i18n framework.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and connected via `DATABASE_URL` environment variable
- **Replit Auth**: OpenID Connect authentication requiring `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### AI Services (Replit AI Integrations)
- **OpenAI API**: Used for AI report generation and chat features. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
- **Image Generation**: gpt-image-1 model support available via Replit AI Integrations
- **Voice/Audio**: Audio processing utilities using OpenAI speech-to-text, with ffmpeg for format conversion

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` - Database ORM and migration tooling
- `express` + `express-session` - HTTP server and session management
- `passport` + `openid-client` - Authentication
- `zod` + `drizzle-zod` - Schema validation
- `@tanstack/react-query` - Server state management
- `recharts` - Data visualization
- `framer-motion` - Animations
- `wouter` - Client-side routing
- `connect-pg-simple` - PostgreSQL session store