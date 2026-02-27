import { createClient } from '@/utils/supabase/client';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon_name?: string;
}

export interface Model {
    id: string;
    title: string;
    slug: string;
    price: number;
    format: string;
    thumbnail_url: string;
    downloads_count: number;
    likes_count: number;
    author: {
        username: string;
        full_name: string;
    };
}

export async function getCategories(): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
    }

    return data || [];
}

export async function getTrendingModels(limit = 8): Promise<Model[]> {
    const supabase = createClient();

    // Na tabela 'models', fazemos um join explícito com 'users' usando a restrição da FK (author_id)
    const { data, error } = await supabase
        .from('models')
        .select(`
            id,
            title,
            slug,
            price,
            format,
            thumbnail_url,
            downloads_count,
            likes_count,
            author:users!author_id (
                username,
                full_name
            )
        `)
        .eq('is_published', true)
        .order('downloads_count', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Erro ao buscar modelos trending:", error);
        return [];
    }

    return (data as unknown) as Model[] || [];
}
