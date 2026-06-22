# saurabhgaur.world

Full-stack portfolio + AI art storefront built with **Next.js 14**, **Supabase**, and **Razorpay**.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database + Storage | Supabase (PostgreSQL + Storage) |
| Payments | Razorpay (UPI, Cards, Net Banking) |
| Email | Resend |
| Deployment | Vercel |

## Local Setup

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/saurabhgaur.world.git
cd saurabhgaur.world
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in all values in `.env.local` (see `.env.example` for what's needed).

### 3. Supabase setup
1. Create project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Run `supabase/seed.sql` for test data (optional)
4. Create storage buckets: `art-thumbnails` (public) and `art-files` (private)

### 4. Run dev server
```bash
npm run dev
```
Open http://localhost:3000

## Deployment

Push to GitHub → connect to Vercel → add env vars → deploy.

See full setup guide: ask Claude at https://claude.ai

## Admin

Visit `/login` and enter your `ADMIN_SECRET` to access the admin panel at `/admin`.

## Performance & SEO

Key optimisations applied to this build:

| Area | Detail |
|---|---|
| Canvas particles | 70 desktop / 25 mobile; 0 on `prefers-reduced-motion` |
| Mousemove | Throttled to ~60fps via `Date.now()` guard + `passive` listener |
| Particle connections | Max draw distance reduced 100px → 80px (O(n²) savings) |
| GPU compositing | `will-change: transform` on radar canvas; `will-change: transform, box-shadow` on cards/buttons |
| Off-screen render | `content-visibility: auto` on non-hero sections |
| Fonts | Google Fonts `display=swap` prevents FOIT |
| Network | `preconnect` for fonts; `dns-prefetch` for Supabase CDN |
| Bundle | `optimizePackageImports: ['lucide-react']` for tree-shaking |
| SEO | JSON-LD Person schema, keywords, authors, creator in metadata |
| Sitemap | Art page priority 0.95 / daily; projects weekly |
| a11y | Skip-to-content link, WCAG 2.1 AA focus ring (2px), `prefers-reduced-motion` scroll guard |
| Security | `poweredByHeader: false` removes X-Powered-By fingerprint |

## License

Personal use. All art and content © Saurabh Kumar Gaur.
