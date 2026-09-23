# LincScales

Your Business. Scaled.

LincScales is a Next.js App Router website for performance marketing and AI automation. It includes customer purchasing flows, a local SQLite/Prisma data layer, and a protected admin operations foundation.

## Preview in Codespaces

```bash
npm install
cp .env.example .env
# Set SESSION_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD_HASH in .env
npm run db:migrate
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

Open the forwarded port `3000` in the Ports panel.

Customer routes:

- `/` public homepage
- `/packages` Meta Ads and AI chatbot catalog
- `/checkout?items=meta-growth` order review and service request
- `/plan-builder` custom advertising plan builder
- `/onboarding` customer onboarding form
- `/request` original custom plan request form

Private routes:

- `/admin/login` environment-configured admin sign in
- `/admin` customer, order, catalog, and chatbot overview

## Admin setup

Generate a password hash locally. Do not put the plain password in GitHub or client-side code:

```bash
node -e "const c=require('node:crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(process.argv[1],s,64).toString('hex'))" 'YOUR-PASSWORD'
```

Put the output in `ADMIN_PASSWORD_HASH`, set `ADMIN_EMAIL`, and use a random value of at least 32 characters for `SESSION_SECRET`. No default admin account exists.

## Database

Prisma with SQLite is used for development. The migration is in `prisma/migrations`; local `prisma/*.db*` files are ignored. For production, configure a managed database and run migrations as part of deployment. The schema models users, customers, service packages, orders, custom plan requests, and chatbot configurations.

## Validation and limits

```bash
npm run lint
npm run build
```

Public forms validate on the server, use a honeypot field, and apply an in-memory development rate limit. For multiple production instances, replace that limiter with a shared Redis or edge rate limiter.

Payments, credit-card collection, authentication providers, CRM integrations, AI model connections, and publishing are intentionally not activated. Pricing is preliminary and orders are service requests only.
