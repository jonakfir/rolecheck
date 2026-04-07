import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';

async function updateUserPlan(
  stripeCustomerId: string,
  plan: 'free' | 'pro' | 'team'
) {
  // Find profile by stripe_customer_id
  const snapshot = await adminDb
    .collection('profiles')
    .where('stripe_customer_id', '==', stripeCustomerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error(`No profile found for customer ${stripeCustomerId}`);
    return;
  }

  await snapshot.docs[0].ref.update({ plan });
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

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = determinePlanFromSubscription(subscription);

        const userEmail = session.customer_details?.email;
        if (userEmail) {
          // Find user profile by email
          const snapshot = await adminDb
            .collection('profiles')
            .where('email', '==', userEmail)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              stripe_customer_id: customerId,
              plan,
            });
          }
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
