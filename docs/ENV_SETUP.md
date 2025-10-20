# Environment Setup Guide

## Required Environment Variables

This project requires environment variables to be set before running. Since `.env.local` is gitignored, you need to create it manually.

## Quick Setup

### Step 1: Create `.env.local` file

In the project root directory, create a file named `.env.local`:

```bash
cd /Users/gtarraga/projects/gtarraga
touch .env.local
```

### Step 2: Add environment variables

Copy and paste this content into `.env.local`:

```bash
# Database Configuration
DATABASE_PATH=./data/papers.db

# Admin Access
ADMIN_PASSWORD=admin123
```

### Step 3: Verify setup

The file should be automatically ignored by git (check with `git status`).

## Environment Variables Explained

### `DATABASE_PATH`

- **Purpose**: Location of the SQLite database file
- **Default**: `./data/papers.db`
- **Usage**: Used by Drizzle ORM client and Drizzle Kit
- **Note**: The database file will be created automatically when migrations run in Phase 2

### `ADMIN_PASSWORD`

- **Purpose**: Stateless password for admin actions
- **Default**: None (must be set)
- **Security**: Change from default `admin123` in production
- **Usage**: Validated on each admin server action (no sessions stored)

## Verification

After creating `.env.local`, verify the setup:

1. **Check git status**:

   ```bash
   git status
   ```

   The `.env.local` file should NOT appear (it's gitignored)

2. **Verify variables are loaded**:
   Run the dev server and check that no environment variable warnings appear:

   ```bash
   pnpm dev
   ```

3. **Test Drizzle Kit access**:
   ```bash
   pnpm db:studio
   ```
   This should use the `DATABASE_PATH` variable

## Production Setup

For production deployment:

1. Set environment variables in your hosting platform's dashboard
2. Use a strong, randomly generated password for `ADMIN_PASSWORD`
3. Consider using absolute paths for `DATABASE_PATH` if needed
4. Ensure the `data/` directory has write permissions

## Template File

A template file `.env.example` is provided in the repository with placeholder values. This file IS committed to git and serves as documentation for required variables.

## Troubleshooting

### "Cannot read environment variable"

- Ensure `.env.local` exists in the project root
- Verify the file has no typos in variable names
- Restart the dev server after creating/modifying `.env.local`

### "Database path not found"

- The `data/` directory should exist (with `.gitkeep`)
- The database file will be created automatically in Phase 2
- Verify `DATABASE_PATH` points to `./data/papers.db`

### "Admin password incorrect"

- Check for leading/trailing spaces in `.env.local`
- Ensure `ADMIN_PASSWORD` is set (not empty)
- Value is case-sensitive
