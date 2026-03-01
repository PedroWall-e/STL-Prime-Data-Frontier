import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const modelId = params.id;
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        );

        // 1. Fetch Model Data
        const { data: model, error: modelError } = await supabase
            .from('models')
            .select('id, is_free, files_list')
            .eq('id', modelId)
            .single();

        if (modelError || !model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 });
        }

        // We assume the actual file stored in bucket has the path: `models/{modelId}/{filename}`
        // In the mock/real logic, we verify user access before giving the Signed URL.

        const { data: { user } } = await supabase.auth.getUser();

        let hasAccess = false;

        if (model.is_free) {
            hasAccess = true;
        } else if (user) {
            // Check Subscription Level
            const { data: profile } = await supabase
                .from('users')
                .select('subscription_status')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_status === 'pro' || profile?.subscription_status === 'premium') {
                hasAccess = true;
            } else {
                // Check if bought individually
                const { data: purchase } = await supabase
                    .from('purchases')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('model_id', modelId)
                    .limit(1)
                    .single();

                if (purchase) {
                    hasAccess = true;
                }
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access Denied. Upgrade your plan or purchase the model to download.' }, { status: 403 });
        }

        // Emulate generating a Signed URL from the storage
        // Since we are mocking files for some elements or using actual files if uploaded:
        let downloadPaths = [];
        if (model.files_list && Array.isArray(model.files_list) && model.files_list.length > 0) {
            // Get proper signed URLs for all files
            for (const file of model.files_list) {
                const { data: signedData, error: signError } = await supabase.storage
                    .from('models')
                    .createSignedUrl(file.path, 3600); // 1 hour valid

                if (signedData?.signedUrl) {
                    downloadPaths.push({ name: file.name, url: signedData.signedUrl });
                }
            }
            if (downloadPaths.length > 0) {
                return NextResponse.json({ success: true, files: downloadPaths });
            }
        }

        // Fallback or generic path if `files_list` is missing / empty
        return NextResponse.json({
            success: true,
            message: 'Acesso liberado.',
            files: [{ name: 'placeholder_file.stl', url: 'https://example.com/mock-download' }]
        });

    } catch (error: any) {
        console.error('[Download Middleware Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
