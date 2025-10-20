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

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
```

## Authentication

Uses simple token-based access with pattern matching. No sessions, cookies, or JWT. First use of a valid token auto-registers the participant.

## Production Setup

### 1. Create `.env.production`

On your production server, create a `.env.production` file with your actual values:

```bash
ADMIN_PASSWORD=your_secure_password
TOKEN_PATTERN=papers-*-suffix
INITIAL_TOKEN=papers-firstname-lastname-suffix
INITIAL_FIRST_NAME=FirstName
INITIAL_LAST_NAME=LastName
DATABASE_URL=file:/app/data/papers.db
```

### 2. Seed Production Database

Run the seed script in your Docker container:

```bash
# Start containers
docker compose up -d

# Run production seed script
docker compose exec app npm run seed:prod

# Or as one-time execution
docker compose run --rm app npm run seed:prod
```
