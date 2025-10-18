# Paper Reading Club

A bi-weekly paper reading club application with ranked-choice voting. Built with Next.js, TypeScript, Drizzle ORM, and SQLite.

## Features

- 📝 **Paper Submission**: Members can submit papers during dedicated submission windows
- 🗳️ **Ranked-Choice Voting**: Democratic selection using instant-runoff voting algorithm
- 📊 **Results Tracking**: View past cycles and voting results
- 🔑 **Simple Token Access**: Ultra-lightweight authentication using pattern-matching tokens
- 👥 **Auto-Registration**: First-time token users are automatically registered
- ⚡ **Server Actions**: Type-safe data mutations without API routes
- 🎨 **Clean Design**: Light-mode only interface with generous whitespace

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4 (CSS-based config)
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Authentication**: Stateless token validation (no sessions, cookies, or JWT)

## Design System

- **Typography**: IBM Plex Mono (monospace for headings, buttons, inputs), New York (serif for body)
- **Colors**: Stone palette (broken white backgrounds), Blueprint blue accents
- **Mode**: Light mode only

## Project Structure

```
src/
├── actions/           # Server actions (Phase 3)
├── app/               # Next.js app router pages
│   ├── layout.tsx     # Root layout with fonts and metadata
│   └── page.tsx       # Home page
├── components/
│   └── ui/            # shadcn/ui components
├── db/
│   ├── index.ts       # Database client instance
│   ├── schema/        # Drizzle schema definitions (Phase 2)
│   ├── types/         # TypeScript type exports (Phase 2)
│   └── migrations/    # Drizzle migrations (Phase 2)
├── lib/               # Business logic and utilities (Phase 2)
└── utils/
    └── cn.ts          # Tailwind class merging utility

scripts/               # Database migration and seed scripts (Phase 2)
data/                  # SQLite database files (gitignored)
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Basic understanding of Next.js and TypeScript

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd paper-reading-club
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root:

```bash
# Database Configuration
DATABASE_PATH=./data/papers.db

# Admin Access
ADMIN_PASSWORD=your-secure-password-here
```

4. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Commands (Phase 2+)

```bash
# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Seed database with initial data
pnpm db:seed

# Open Drizzle Studio for database inspection
pnpm db:studio
```

## Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Style Guidelines

- Use `@/utils/cn` for className merging (never relative imports)
- Use database-derived ID types (`Event["id"]`) instead of generic `string`
- Import types with `import type` from `@/db/types`
- Prefer Server Actions over API routes
- Use Drizzle ORM for all database operations

## Authentication

This application uses an ultra-simple token-based access system:

- **No sessions**: Token validated on every server action (stateless)
- **No cookies**: localStorage used only for client convenience
- **No JWT**: Simple pattern matching (e.g., "papers-\*" matches any token starting with "papers-")
- **Auto-registration**: First use of a valid token creates a participant record
- **No login/logout**: Users simply enter their token once

## Project Status

**Phase 1 Complete**: Foundation setup with Next.js, Tailwind, shadcn/ui, and Drizzle configuration

**Next Steps**:

- Phase 2: Database schema and core business logic
- Phase 3: Server actions
- Phase 4: UI components
- Phase 5: Page integration
- Phase 6: Token UI and polish
- Phase 7: Testing and deployment

## License

MIT

## Contributing

This is currently a personal project. Future contributions may be accepted after initial release.
