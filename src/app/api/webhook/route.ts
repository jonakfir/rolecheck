import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

async function updateUserPlan(
  stripeCustomerId: string,
  plan: 'free' | 'pro' | 'team'
) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .limit(1)
    .single();

  if (error || !data) {
    console.error(`No profile found for customer ${stripeCustomerId}`);
    return;
  }

  await supabaseAdmin
    .from('profiles')
    .update({ plan })
    .eq('id', data.id);
}

function determinePlanFromSubscription(
  subscription: Stripe.Subscription
): 'free' | 'pro' | 'team' {
  const priceId = subscription.items.data[0]?.price?.id;

  if (!priceId) return 'free';

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return 'team';

  return 'free';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown verification error';
      console.error('Webhook signature verification failed:', message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId || !subscriptionId) {
          console.error('Missing customer or subscription ID in checkout session');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = determinePlanFromSubscription(subscription);

        const userEmail = session.customer_details?.email;
        if (userEmail) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              plan,
            })
            .eq('email', userEmail);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const plan = determinePlanFromSubscription(subscription);

        await updateUserPlan(customerId, plan);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await updateUserPlan(customerId, 'free');
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
