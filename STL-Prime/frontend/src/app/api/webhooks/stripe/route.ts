import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Tell Next.js this is always dynamic (never statically collected)
export const dynamic = 'force-dynamic';


// Guard: Stripe webhook requires real credentials to function.
// The module-level init is deferred to inside the handler to avoid build-time crashes.

export async function POST(req: NextRequest) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
        console.error('[Webhook] Missing required environment variables.');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
        console.error('[Webhook Error]', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (session.mode === 'payment') {
            try {
                // Fetch line items with expanded product to get metadata
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                    expand: ['data.price.product'],
                });

                const purchases = [];

                for (const item of lineItems.data) {
                    const product = item.price?.product as Stripe.Product | undefined;
                    const modelId = product?.metadata?.model_id;

                    if (modelId && item.amount_total) {
                        purchases.push({
                            user_id: userId === 'anonymous' ? null : userId,
                            model_id: modelId,
                            stripe_session_id: session.id,
                            amount_paid: item.amount_total / 100, // exact amount for this line item
                            payment_status: 'completed'
                        });
                    }
                }

                if (purchases.length > 0) {
                    const { error } = await supabaseAdmin.from('purchases').insert(purchases);
                    if (error) console.error('[Webhook DB Error - Purchase Insert]', error);
                    else {
                        console.log(`[Webhook] Recorded ${purchases.length} purchases successfully.`);

                        // Fire the Receipt Email
                        try {
                            const emailItems = lineItems.data.map(item => {
                                const prod = item.price?.product as Stripe.Product | undefined;
                                return {
                                    title: prod?.name || 'Modelo 3D',
                                    author: prod?.metadata?.author_username || 'criador',
                                    price: item.amount_total ? (item.amount_total / 100).toFixed(2) : '0.00'
                                };
                            });

                            const userEmail = session.customer_details?.email;
                            const userName = session.customer_details?.name || 'Membro';

                            if (userEmail) {
                                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';
                                await fetch(`${appUrl}/api/emails/receipt`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        to: userEmail,
                                        firstName: userName.split(' ')[0],
                                        items: emailItems,
                                        total: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
                                        orderId: session.payment_intent as string || session.id.slice(-8)
                                    })
                                });
                                console.log('[Webhook] Trigerred receipt email for', userEmail);
                            }
                        } catch (emailErr) {
                            console.error('[Webhook Error triggering receipt email]', emailErr);
                        }
                    }
                }
            } catch (lineItemsError) {
                console.error('[Webhook Error fetching line items]', lineItemsError);
            }
        } else if (session.mode === 'subscription') {
            const planType = session.metadata?.plan_type;
            const subscriptionId = session.subscription as string;

            // Update user profile
            const { error: userError } = await supabaseAdmin
                .from('users')
                .update({
                    subscription_status: planType,
                    subscription_id: subscriptionId,
                    stripe_customer_id: session.customer as string
                })
                .eq('id', userId);

            if (userError) console.error('[Webhook DB Error - User Sub]', userError);

            // Fetch subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

            // Insert into user_subscriptions
            const { error: subError } = await supabaseAdmin.from('user_subscriptions').insert({
                user_id: userId,
                stripe_subscription_id: subscriptionId,
                plan_type: planType,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

            if (subError) console.error('[Webhook DB Error - Sub Log]', subError);
        }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;
        const status = subscription.status;

        // Update user profile status
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                subscription_status: status === 'active' ? undefined : 'free' // Simplified
            })
            .eq('subscription_id', subscription.id);

        // Update user_subscriptions table
        await supabaseAdmin
            .from('user_subscriptions')
            .update({
                status: status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end
            })
            .eq('stripe_subscription_id', subscription.id);
    }

    return NextResponse.json({ received: true });
}
