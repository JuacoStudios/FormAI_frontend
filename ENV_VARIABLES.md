# Environment Variables Required

## Frontend (Vercel)

### Required for NextAuth
- `NEXTAUTH_URL` - The canonical URL of your site (e.g., https://formai.vercel.app)
- `NEXTAUTH_SECRET` - A random string used to encrypt JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Required for Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_)
- `STRIPE_PRICE_ID_MONTHLY` - Stripe price ID for monthly subscription
- `STRIPE_PRICE_ID_ANNUAL` - Stripe price ID for annual subscription

### Required for Backend Communication
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (e.g., https://formai-backend.onrender.com)

## Backend (Render)

### Required for Database
- `DATABASE_URL` - PostgreSQL connection string

### Required for OpenAI
- `OPENAI_API_KEY` - OpenAI API key

### Required for Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `STRIPE_PRICE_ID_MONTHLY` - Stripe price ID for monthly subscription
- `STRIPE_PRICE_ID_ANNUAL` - Stripe price ID for annual subscription

### Required for Frontend Communication
- `WEB_URL` - Frontend URL (e.g., https://formai.vercel.app)

### Optional
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (defaults to 3001)
