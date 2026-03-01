import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/emails/ReceiptEmail';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        if (!resend) {
            console.warn('[Resend] RESEND_API_KEY not configured. Skipping receipt email.');
            return NextResponse.json({ skipped: true }, { status: 200 });
        }

        const { to, firstName, items, total, orderId } = await req.json();

        if (!to || !items) {
            return NextResponse.json({ error: 'Missing required variables' }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: 'STL Prime <billing@resend.dev>', // Use dev address for unverified testing
            to: [to],
            subject: `Seu Recibo STL Prime (Pedido ${orderId})`,
            react: ReceiptEmail({ firstName, items, total, orderId }),
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Receipt Email Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
