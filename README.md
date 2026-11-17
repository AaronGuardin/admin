# AFTERHOURS Admin

An independent Vite application for marketplace administration. It runs separately from the customer storefront and uses the Hono API for authentication and overview data.

## Local development

```sh
cd admin
npm install
cp .env.example .env
npm run dev
```

The dashboard runs at `http://localhost:5174`. Keep the `localhost` hostname for the dashboard and API so the browser sends the HTTP-only session cookie consistently. Start the API at port `3000` and the customer storefront at port `5173` as needed. The API must have its migrations applied and sample catalog seeded.

Create an account through the customer app, then grant administrator access from the API package:

```sh
cd ../api
npm run db:promote-admin -- admin@example.com
```

Sign in to the dashboard with that account. Admin access is enforced by the API for `/api/admin/*`; the dashboard UI check alone does not grant access.

## Available admin view

The protected overview displays counts for users, producers, beats, and published beats, plus the most recently added beats. Customer and producer management, catalog editing, orders, and payments are not part of this initial dashboard slice.
