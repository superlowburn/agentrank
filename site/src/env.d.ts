/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  DASH_TOKEN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  CF_API_TOKEN?: string;
  // Stripe payment processing
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_SPONSORED_BASIC_MONTHLY?: string;
  STRIPE_PRICE_SPONSORED_BASIC_ANNUAL?: string;
  STRIPE_PRICE_SPONSORED_PRO_MONTHLY?: string;
  STRIPE_PRICE_SPONSORED_PRO_ANNUAL?: string;
  STRIPE_PRICE_SPONSORED_ENTERPRISE_MONTHLY?: string;
  STRIPE_PRICE_SPONSORED_ENTERPRISE_ANNUAL?: string;
  STRIPE_PRICE_PRO_MONTHLY?: string;
  STRIPE_PRICE_PRO_ANNUAL?: string;
  STRIPE_PRICE_VP_MONTHLY?: string;
  STRIPE_PRICE_VP_ANNUAL?: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
