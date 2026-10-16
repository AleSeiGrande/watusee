# WatUSee

> Every cloud has a face. Find it, capture it, share it — and turn pareidolia into a game.

**WatUSee** is a social web app built around [pareidolia](https://en.wikipedia.org/wiki/Pareidolia): the human
tendency to see faces, animals and shapes in clouds, walls, coffee foam — anything. Users trace what they see
on an image, publish it, and the community reacts, remixes it and plays mini-games with it.

Live product: **https://watusee.fun**

---

## Features

**Create & share**

- Canvas to draw over photos and mark the shapes you "see".
- Pro drawing tools (layers, textures, smart eraser) for paid creators.
- Feed with likes, reactions, comments, shares and **remixes**.
- Profiles, "My creations", notifications, levels and badges.

**Games & sections**

- **Echo**, **Blind Blowup**, **Memory**, **Mind Reader**, **Puzzle Img** (with a daily puzzle),
  **Resonance**, **Stories** and a **Daily Challenge**.
- **Imaginarium** and **Adults** sections.

**Platform**

- Auth with username/password **and** optional Google sign-in, plus password reset by email.
- 6 languages: English, Spanish, Italian, Korean, Russian, Chinese.
- Subscription/pricing page with artist-named plans, plus a donation option ("Mecenas").
- **Print Shop** — turn a creation into a t-shirt, mug or poster.
- **NFT Gallery** (preview / under construction) — creations as collectibles with a "prestige" score.
- Technical SEO out of the box: `sitemap.xml`, `robots.txt` and Open Graph/Twitter cards.
- Pluggable analytics (GA4 / Plausible / Umami) and first-touch **UTM attribution** per signup.

## Plans

| Plan | Role | Price | Highlights |
| --- | --- | --- | --- |
| **Banksy** | Free | $0 | Create, share, play |
| **Frida** | Creator | $2.99/mo · $29/yr | Echo Pro tools, Print Shop, no ads |
| **Da Vinci** | Studio | $4.99/mo · $49/yr | Everything in Frida + Dual Puzzle, advanced stats, early access, NFT Gallery |
| **Mecenas** | Donation | Name your price | Support the project, patron badge, thanks page |

Payments use **provider-agnostic hosted checkout links** (Stripe Payment Links, Paddle, Lemon Squeezy, …) driven by
environment variables — switching provider means changing URLs, not code. See `.env.example`.
You can also paste every link (checkout, donation, Print Shop and analytics IDs) from the **`/admin`** panel,
which takes priority over `.env` and needs no redeploy.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Prisma + SQLite |
| Auth | NextAuth v5 (Auth.js) — credentials + Google |
| Email | Nodemailer (SMTP) |
| Hosting | Hostinger Node.js (`start.js`) |

## Getting started

Requirements: **Node.js >= 20.9** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your env file and fill it in
cp .env.example .env      # Windows: copy .env.example .env

# 3. Generate the Prisma client and create the SQLite schema
npx prisma generate
npx prisma db push

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

## Environment variables

All variables live in `.env` (never committed). `.env.example` documents each one.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `AUTH_SECRET` | NextAuth session secret (long random string) |
| `AUTH_URL` | Public base URL (`http://localhost:3000` in dev) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Outgoing email (password reset, contact) |
| `NEXT_PUBLIC_CHECKOUT_FRIDA_MONTHLY` / `_YEARLY` | Frida checkout URLs |
| `NEXT_PUBLIC_CHECKOUT_DAVINCI_MONTHLY` / `_YEARLY` | Da Vinci checkout URLs |
| `NEXT_PUBLIC_DONATE_URL` | Mecenas donation URL (PayPal.me, Ko-fi, Buy Me a Coffee, …) |
| `NEXT_PUBLIC_MERCH_TSHIRT_URL` / `_MUG_URL` / `_POSTER_URL` | Per-product Print Shop order links (Printful, Gelato, Printify, …) |
| `NEXT_PUBLIC_MERCH_PARTNER_URL` | Fallback Print Shop order link used when a product link is empty |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL (used by sitemap, robots and Open Graph) |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible domain (e.g. `watusee.fun`) |
| `NEXT_PUBLIC_UMAMI_SRC` / `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami script URL + website ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (auto-activates a plan after payment) |
| `GENERIC_WEBHOOK_SECRET` | Shared secret for `POST /api/webhooks/generic` (any provider, or Zapier/Make) |

> If a checkout/donation URL is empty, the pricing page shows "coming soon" and routes to the contact form.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (`setup-db.js` + `next build`) |
| `npm run start` | Start the production server (`start.js`) |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |

## Project structure

```
app/            Routes (App Router): create, feed, play, pricing, merch, nft, support, api/*
components/     UI components (Navbar, Footer, Canvas, Cards, …)
lib/            Domain logic: plans, entitlements, merch, prisma, i18n, auth helpers
prisma/         schema.prisma + SQLite database
public/         Static assets and user uploads
scripts/        Maintenance scripts
start.js        Production entry point for Hostinger
setup-db.js     Hostinger build hook (creates DB dir and pushes schema)
```

## Deployment

The app targets **Hostinger Node.js hosting**:

1. `npm run build` runs `setup-db.js` (creates the `data/` dir, pushes the Prisma schema) and `next build`.
2. `npm run start` runs `start.js`, which serves the built Next.js app on `$PORT`.

Set the environment variables from the table above in the hosting panel.

## Admin panel

Payments, donations and Print Shop links can be configured **from the web** at
`/admin` (no `.env` edit or redeploy needed). Values are stored in the `Setting`
table and take priority over environment variables.

To grant access, mark a user as admin:

```bash
npx prisma studio                      # toggle User.isAdmin in the UI
# or, via a script / SQL:
# UPDATE User SET isAdmin = 1 WHERE username = 'your-username';
```

Admins see a "Panel de admin" entry in their avatar menu.

### Activating plans

There are two ways to turn a payment into an active plan:

1. **Automatic (webhooks).** Point your provider at a webhook endpoint; the plan
   turns on as soon as the payment succeeds. Checkout links get a
   `client_reference_id` (user + plan + interval) appended automatically so the
   webhook knows who paid.
   - **Stripe:** `POST /api/webhooks/stripe`, verified with `STRIPE_WEBHOOK_SECRET`.
     Handled events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`.
   - **Any other provider** (or Zapier / Make): `POST /api/webhooks/generic` with the
     header `x-webhook-secret`. Body:
     ```json
     { "plan": "frida", "interval": "monthly", "userId": "<id>" }
     ```
     Use `"email"` instead of `"userId"` to match by email. To cancel, send
     `{ "action": "cancel", "providerSubscriptionId": "sub_123" }`.
2. **Manual.** In `/admin`, use the *"Activar plan manualmente"* card: type a
   username, pick a plan, then activate or revoke. Useful for tests, comps, or
   before webhooks are wired up.

Both paths are idempotent by event id and update the user (`plan`, `planStatus`,
`planRenewsAt`, `isPatron`) plus the `Subscription` and `PaymentEvent` tables.
Webhook secrets live in `.env` (server secrets) rather than the `Setting` table.

## Selling / handover

This project is available for acquisition (domain + product). See [`HANDOVER.md`](./HANDOVER.md) for the
transfer checklist, payment activation steps, and due-diligence notes.

## License

Proprietary — all rights reserved.
