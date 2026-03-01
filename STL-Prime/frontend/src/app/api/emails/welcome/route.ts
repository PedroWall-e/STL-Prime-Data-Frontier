import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

// Guard check for API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        if (!resend) {
            console.warn('[Resend] RESEND_API_KEY not configured. Skipping email send.');
            return NextResponse.json({ skipped: true }, { status: 200 });
        }

        const { to, firstName } = await req.json();

        if (!to) {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: 'STL Prime <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
            to: [to],
            subject: 'Bem-vindo à Data Frontier! 🚀',
            react: WelcomeEmail({ firstName }),
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Welcome Email Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
