## Copilot / Agent Guidance for this repo

This file gives concise, actionable information to help an AI coding agent be productive immediately.

- **Big picture:** Vite + React (TS) single-page app using `@/` alias → `src/`. UI is built with shadcn-style components under `src/components/ui`. Data and auth use Supabase (client in `src/integrations/supabase/client.ts`). App routing is defined in `src/App.tsx` (React Router) and global state/hooks live in `src/hooks` (e.g., `useAuth.tsx`, `useCart.tsx`). There is a PWA service worker at `public/sw.js` registered in `src/main.tsx`.

- **Start / build / lint:**
  - Install: `npm i`
  - Dev server (runs Vite on host `::` port `8080`): `npm run dev`
  - Build: `npm run build` (or `npm run build:dev` for development mode)
  - Preview production build: `npm run preview`
  - Lint: `npm run lint`

- **Key files to inspect when making changes:**
  - App entry / routing: `src/App.tsx` and `src/main.tsx`
  - Supabase client: `src/integrations/supabase/client.ts` (env keys: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
  - Vite config / dev plugins: `vite.config.ts` (`lovable-tagger` is enabled in dev)
  - UI components: `src/components/ui` (many shadcn-style components)
  - Pages: `src/pages` (public and `src/pages/admin/*` for admin routes)
  - Hooks: `src/hooks` for `AuthProvider`, `CartProvider`, etc.
  - Supabase functions & migrations: `supabase/functions/` and `supabase/migrations/`

- **Conventions and patterns (concrete):**
  - Absolute imports use the `@` alias (configured in `vite.config.ts`) — import like `import X from "@/path"`.
  - Data access uses the generated typed Supabase client: import `{ supabase }` from `src/integrations/supabase/client` and call `.from(...).select(...)/insert()/update()` as seen in `src/pages/ReferDashboard.tsx` and `src/pages/Profile.tsx`.
  - Global cross-cutting providers: `QueryClientProvider` (react-query) wraps the app in `src/App.tsx`; prefer `react-query` for caching/fetching flows.
  - UI/UX: Toaster components live under `src/components/ui` (`Toaster`, `Sonner`). Use those rather than ad-hoc alerts.
  - Admin interface: nested React Router under `/admin` implemented in `src/App.tsx` and `src/components/admin/AdminLayout.tsx`.

- **Environment & infra notes:**
  - Supabase settings: see `supabase/config.toml` (project_id) and the client uses Vite env vars. Ensure `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for local dev.
  - There is a serverless function `supabase/functions/cashfree-payment` (verify_jwt = true) — avoid editing generated function config without understanding Supabase function deployment.

- **Developer workflows to prefer:**
  - Local iteration: run `npm run dev` and open http://localhost:8080 (host is `::` to bind IPv6/IPv4).
  - When editing components, run the dev server (Vite) — the `lovable-tagger` plugin will annotate components in development (see `vite.config.ts`).
  - To debug API/Supabase issues, inspect calls in `src/integrations/supabase/client.ts` and search usages under `src/pages/**` and `src/components/**`.

- **What NOT to change lightly:**
  - Do not edit the generated `src/integrations/supabase/*` files manually if they are part of a generation pipeline.
  - The `lovable-tagger` plugin is used in dev for component tagging — removing it will reduce dev tooling insights.

- **Quick examples:**
  - Supabase client usage: `import { supabase } from "@/integrations/supabase/client"` then `await supabase.from('products').select('*')` (see `src/pages/ReferDashboard.tsx`).
  - Routes and providers: See `src/App.tsx` for how `AuthProvider`, `CartProvider`, `QueryClientProvider`, and `BrowserRouter` are composed.

If anything here is unclear or you want more detail about a specific area (routing, Supabase, admin flows, or component patterns), tell me which part and I will expand or adjust this file.
