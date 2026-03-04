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
            .select('id, is_free, file_url')
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

        if (!model.file_url) {
            return NextResponse.json({ error: 'Arquivo do modelo não encontrado' }, { status: 404 });
        }

        // Extrai o caminho relativo (path) do arquivo dentro do bucket a partir do file_url salvo
        // A url padrão supabase contem: /storage/v1/object/public/models-files/[USER_ID]/[FILE_NAME]
        const caminhoDoArquivo = model.file_url.split('/models-files/').pop();

        if (!caminhoDoArquivo) {
            return NextResponse.json({ error: 'Caminho de arquivo inválido' }, { status: 400 });
        }

        // Gera a Signed URL válida por 1 hora (3600 segundos) para o bucket 'models-files'
        const { data: signedData, error: signError } = await supabase.storage
            .from('models-files')
            .createSignedUrl(caminhoDoArquivo, 3600);

        if (signError || !signedData?.signedUrl) {
            return NextResponse.json({ error: 'Erro ao assinar URL de download seguro.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            files: [{
                name: caminhoDoArquivo.split('/').pop() || 'modelo_download.stl',
                url: signedData.signedUrl
            }]
        });

    } catch (error: any) {
        console.error('[Download Middleware Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
