import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

export async function POST(req: NextRequest) {
    try {
        const { items, userId } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
        }

        let discountMultiplier = 1;

        if (userId && userId !== 'anonymous') {
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data: userProfile } = await supabaseAdmin
                .from('users')
                .select('subscription_status')
                .eq('id', userId)
                .single();

            if (userProfile?.subscription_status === 'pro') {
                discountMultiplier = 0.8; // 20% discount
            } else if (userProfile?.subscription_status === 'premium') {
                discountMultiplier = 0.5; // 50% discount
            }
        }

        const lineItems = items
            .filter((item: any) => item.price > 0) // Skip free items
            .map((item: any) => {
                const finalPrice = item.price * discountMultiplier;

                return {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: item.title,
                            description: `por @${item.author_username} | Formato: ${item.format || 'STL'}`,
                            images: item.thumbnail_url ? [item.thumbnail_url] : [],
                            metadata: {
                                model_id: item.id,
                                author_username: item.author_username
                            },
                        },
                        unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
                    },
                    quantity: 1,
                };
            });

        if (lineItems.length === 0) {
            return NextResponse.json({ error: 'Nenhum item pago no carrinho' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${appUrl}/dashboard?payment=success`,
            cancel_url: `${appUrl}/checkout?payment=cancelled`,
            metadata: {
                item_ids: items.map((i: any) => i.id).join(','),
                user_id: userId || 'anonymous',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[Stripe Checkout Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
