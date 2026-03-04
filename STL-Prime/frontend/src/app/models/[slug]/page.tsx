import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ModelClientPage from './ModelClient';

interface Props {
    params: { slug: string };
}

// Generate Dynamic Metadata for the 3D Model Page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: model } = await supabase
        .from('models')
        .select('title, description, thumbnail_url')
        .eq('slug', params.slug)
        .single();

    if (!model) {
        return {
            title: 'Modelo não encontrado | STL Prime',
            description: 'Infelizmente o modelo que você procura não está mais disponível.',
        };
    }

    return {
        title: `${model.title} | STL Prime`,
        description: model.description.substring(0, 160),
        openGraph: {
            title: model.title,
            description: model.description.substring(0, 160),
            images: [{ url: model.thumbnail_url }],
        },
        twitter: {
            card: 'summary_large_image',
            title: model.title,
            description: model.description.substring(0, 160),
            images: [model.thumbnail_url],
        },
    };
}

export default function ModelPage({ params }: Props) {
    return <ModelClientPage params={params} />;
}
