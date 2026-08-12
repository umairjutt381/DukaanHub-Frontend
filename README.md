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
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Vercel

Import this repository as a Vercel project with the default Next.js settings.
Set the Root Directory to the repository root and configure
`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` in the project
environment variables.
