# Aura Audio (aura-audio-main)

Small Vite + React + TypeScript single-page app. Includes Tailwind CSS, shadcn-style UI components, a PWA service worker, and Supabase integrations for data/auth.

**Quick Start**

- Install dependencies: `npm i`
- Start dev server (Vite): `npm run dev` (dev server binds to `::` and runs on port `8080` by default in this template)
- Build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

**Environment**

Create a `.env` (or set environment variables) with at least the following keys for Supabase integration:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The Supabase client is at `src/integrations/supabase/client.ts`.

**Project structure (high level)**

- `src/` — application source
	- `src/main.tsx` — app entry
	- `src/App.tsx` — routing and global providers
	- `src/pages/` — top-level pages
	- `src/components/` — UI components (including `src/components/ui` for shadcn-style primitives)
	- `src/hooks/` — custom hooks (e.g., `useAuth.tsx`, `useCart.tsx`)
- `public/` — static assets and `sw.js` service worker
- `supabase/` — Supabase function(s) and SQL migrations

Key files to inspect when editing or debugging:

- `src/App.tsx` — routing and provider composition
- `src/main.tsx` — application bootstrap
- `src/integrations/supabase/client.ts` — Supabase client (env keys above)

**Development notes & conventions**

- Absolute imports use the `@/` alias (configured in `vite.config.ts`) — import like `import X from "@/path"`.
- Data access uses the typed Supabase client: `import { supabase } from "@/integrations/supabase/client"` then `await supabase.from('products').select('*')`.
- React Query (`QueryClientProvider`) is used for caching/fetching and wraps the app in `src/App.tsx`.
- Toaster components and consistent UI primitives live under `src/components/ui`.
- Admin routes are under `src/pages/admin` and layout at `src/components/admin/AdminLayout.tsx`.

**Supabase functions & migrations**

- Serverless functions live in `supabase/functions/` (example: `cashfree-payment`).
- SQL migrations are under `supabase/migrations/`.

**Running locally**

1. Copy or add required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
2. Install: `npm i`
3. Start dev server: `npm run dev` and open `http://localhost:8080`

**Contributing**

- Fork or branch, make changes, run `npm i` and `npm run dev` to test. Open a PR when ready.

If you'd like, I can also:

- Add a `.env.example` file with the env keys shown above.
- Add a short `CONTRIBUTING.md` with local testing steps.

---
Updated README to provide concise developer setup and key pointers.