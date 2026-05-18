# Deploy FoodExpress

## Frontend na Vercel

- Root directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `20.19.0` ou superior

Variaveis de ambiente:

```env
VITE_API_URL=https://your-foodexpress-backend.up.railway.app
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=s8qzx3C1wqrt4YPUxkhnf4epXuVURi1w
```

## Backend no Railway

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/health`
- Node.js: `20.19.0` ou superior

Variaveis de ambiente:

```env
NODE_ENV=production
FRONTEND_URL=https://your-foodexpress-frontend.vercel.app
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=replace_with_rotated_turso_token
JWT_SECRET=replace_with_long_random_secret
RESEND_API_KEY=replace_with_rotated_resend_key
FROM_EMAIL=FoodExpress <vdasilvasouza77@gmail.com>
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

## Auth0

No aplicativo Single Page Application:

- Application Login URI: `https://your-foodexpress-frontend.vercel.app/login`
- Allowed Callback URLs: `https://your-foodexpress-frontend.vercel.app/auth/callback`
- Allowed Logout URLs: `https://your-foodexpress-frontend.vercel.app/login`, `https://your-foodexpress-frontend.vercel.app/`
- Allowed Web Origins: `https://your-foodexpress-frontend.vercel.app`
- Allowed Origins (CORS): `https://your-foodexpress-frontend.vercel.app`

## Seguranca

- Rotacione `TURSO_AUTH_TOKEN`, `RESEND_API_KEY`, `JWT_SECRET` e segredos da Stripe antes de producao.
- Nunca coloque `JWT_SECRET`, Turso, Resend ou Stripe em variaveis `VITE_`.
- Use `.env.example` como referencia; valores reais ficam apenas nos paineis da Vercel/Railway ou no `.env` local.
