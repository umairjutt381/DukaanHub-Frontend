# DukaanHub Frontend

Next.js storefront for DukaanHub.

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to the backend API, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1
```

## Vercel

Import this repository as a Vercel project with the default Next.js settings.
Set the Root Directory to the repository root and configure
`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` in the project
environment variables.

Use a stable backend production domain, not a generated Vercel deployment URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-stable-backend-domain/api/v1
NEXT_PUBLIC_SITE_URL=https://dukaan-hub-frontend.vercel.app
```

Production builds fail when `NEXT_PUBLIC_API_BASE_URL` is missing so the
storefront cannot silently deploy against an incorrect backend.
