import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();
    
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      });
    }

    // Get price ID based on plan
    const priceId = plan === 'annual' 
      ? process.env.STRIPE_PRICE_ID_ANNUAL 
      : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price configuration missing' },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=1`,
      client_reference_id: session.user.email, // Use email as device identifier
      metadata: {
        plan,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
