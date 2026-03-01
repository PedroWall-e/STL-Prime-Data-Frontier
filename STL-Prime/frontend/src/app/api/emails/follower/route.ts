import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { NewFollowerEmail } from '@/emails/NewFollowerEmail';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Supabase Admin to bypass RLS and fetch the user's email
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        if (!resend) {
            console.warn('[Resend] RESEND_API_KEY not configured. Skipping follower email.');
            return NextResponse.json({ skipped: true }, { status: 200 });
        }

        const { creatorId, creatorName, followerName, followerUsername } = await req.json();

        if (!creatorId || !creatorName) {
            return NextResponse.json({ error: 'Missing required variables' }, { status: 400 });
        }

        // Fetch creator's email securely
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(creatorId);
        const creatorEmail = userData?.user?.email;

        if (userError || !creatorEmail) {
            console.error('[Follower Email] Could not fetch creator email', userError);
            return NextResponse.json({ error: 'Creator not found or email missing' }, { status: 404 });
        }

        const data = await resend.emails.send({
            from: 'STL Prime <notifications@resend.dev>', // Use dev address for unverified testing
            to: [creatorEmail],
            subject: `${followerName} começou a seguir você! 🎉`,
            react: NewFollowerEmail({ creatorName, followerName, followerUsername }),
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Follower Email Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
