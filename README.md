# Paper Reading Club

A bi-weekly paper reading club with ranked-choice voting. Built with Next.js, TypeScript, and SQLite.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- SQLite + Drizzle ORM
- Tailwind CSS 4
- shadcn/ui

## Getting Started

**1. Install dependencies**

```bash
pnpm install
```

**2. Set up environment**

Create `.env.local`:

```bash
DATABASE_PATH=./data/papers.db
ADMIN_PASSWORD=your-password-here
```

**3. Run development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database

Feel free to seed the database once the migrations have been applied.

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
```

## Authentication

Uses simple token-based access with pattern matching. No sessions, cookies, or JWT. First use of a valid token auto-registers the participant.

## License

MIT
