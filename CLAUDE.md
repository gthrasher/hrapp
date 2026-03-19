# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Environment

Copy `.env.local` values from your Supabase project dashboard (Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For Vercel deployment, add these same variables in the Vercel project settings.

## Database setup

Run `supabase/schema.sql` in the Supabase SQL Editor once to create the `employees` table and RLS policies.

## Architecture

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase JS v2

**Data flow:**
- Server Components fetch data directly from Supabase (`lib/supabase.ts`) — no API routes needed.
- Mutations use [Server Actions](node_modules/next/dist/docs/01-app/02-guides/forms.md) (`'use server'`) which call Supabase then `revalidatePath` + `redirect`.
- Forms use `useActionState` from React 19 to handle pending state and inline errors.

**Key files:**
- `lib/supabase.ts` — lazy Supabase client singleton (`getSupabase()`) and `Employee` type
- `app/employees/actions.ts` — `createEmployee`, `updateEmployee`, `deleteEmployee` server actions
- `app/employees/EmployeeForm.tsx` — shared `'use client'` form component used by both new and edit pages
- `supabase/schema.sql` — database schema

**Routing:**
- `/` → redirects to `/employees`
- `/employees` — employee list (server component)
- `/employees/new` — create form
- `/employees/[id]` — edit/delete form

## Notes

- The Supabase client uses lazy initialization (`getSupabase()`) to avoid `Invalid supabaseUrl` errors during `next build` when env vars are placeholders.
- Pages that fetch from Supabase must export `export const dynamic = 'force-dynamic'` to prevent Next.js from trying to statically prerender them at build time.
- The `updateEmployee` server action uses `.bind(null, id)` to pass the employee ID before the `(prevState, formData)` arguments required by `useActionState`.
- Row Level Security is enabled with a permissive "allow all" policy. Add auth-based policies before going to production.
- Next.js 16 has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before modifying framework-level behavior.
