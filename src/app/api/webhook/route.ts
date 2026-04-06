import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role key for admin-level access in webhooks
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );
}

async function updateUserPlan(
  stripeCustomerId: string,
  plan: 'free' | 'pro' | 'team'
) {
  const { error } = await getSupabaseAdmin()
    .from('profiles')
    .update({ plan })
    .eq('stripe_customer_id', stripeCustomerId);

  if (error) {
    console.error(
      `Failed to update plan for customer ${stripeCustomerId}:`,
      error
    );
    throw new Error(`Database update failed: ${error.message}`);
  }
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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId || !subscriptionId) {
          console.error('Missing customer or subscription ID in checkout session');
          break;
        }

        // Retrieve the subscription to determine the plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = determinePlanFromSubscription(subscription);

        // Link the Stripe customer to the Supabase user if not already linked
        const userEmail = session.customer_details?.email;
        if (userEmail) {
          const { data: existingProfile } = await getSupabaseAdmin()
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (!existingProfile) {
            // Try to find user by email and link the Stripe customer ID
            await getSupabaseAdmin()
              .from('profiles')
              .update({ stripe_customer_id: customerId, plan })
              .eq('email', userEmail);
          } else {
            await updateUserPlan(customerId, plan);
          }
        } else {
          await updateUserPlan(customerId, plan);
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

        // Revert to free plan when subscription is cancelled
        await updateUserPlan(customerId, 'free');
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
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
