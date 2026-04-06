import Stripe from 'stripe';

function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export function getStripe() {
  return createStripeClient();
}

// Lazy singleton
let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) _stripe = createStripeClient();
    return (_stripe as any)[prop];
  },
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    jds_per_month: 3,
    features: ['3 JD analyses/month', 'Bias detection', 'AI rewrite', 'Quality scoring'],
  },
  pro: {
    name: 'Pro',
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    jds_per_month: -1,
    features: ['Unlimited analyses', 'Everything in Free', 'Benchmarking against live JDs', 'Export reports', 'Priority support'],
  },
  team: {
    name: 'Team',
    price: 149,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    jds_per_month: -1,
    features: ['Everything in Pro', 'Multi-seat access', 'API access', 'Team analytics dashboard', 'Custom word lists', 'SSO support'],
  },
} as const;
