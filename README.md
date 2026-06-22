# Outreach CRM

A lightweight CRM for tracking local trades prospects, tailored website demos, follow-ups, replies, and won clients.

## Features

- Prospect dashboard with sorting and filtering
- Add/edit prospect forms
- Follow-up due today view
- Quick status actions that update last-contacted dates
- Reusable message templates with placeholders
- Prospect detail pages with message generation and timeline history
- Stats cards and conversion rates
- Postgres persistence for Vercel deployment

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` from `.env.example` and set:

   ```bash
   DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
   MY_NAME="Your Name"
   ```

3. Initialize the database:

   ```bash
   pnpm db:init
   ```

   The app also checks the schema on first run, so this command is mostly useful for verifying the connection.

4. Start the app:

   ```bash
   pnpm dev
   ```

5. Open `http://localhost:3000`.

## Database

Use any hosted Postgres database. Supabase is a simple option:

1. Create a Supabase project.
2. Copy the pooled Postgres connection string.
3. Add it to `.env.local` locally and to Vercel as `DATABASE_URL`.
4. Add `MY_NAME` in Vercel for template personalization.

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add environment variables:

   - `DATABASE_URL`
   - `MY_NAME`

4. Deploy.

Tables and default templates are created automatically when the app first connects.
