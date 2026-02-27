-- =========================================================================================
-- STL PRIME: ESQUEMA DE BANCO DE DADOS (PostgreSQL - Otimizado para Supabase)
-- =========================================================================================

-- 1. ATIVAR EXTENSÃO UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABELA: users (Perfil de Usuários)
-- Nota: Autenticação base fica no auth.users do Supabase, 
-- esta tabela estende o perfil público.
-- ==========================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABELA: categories
-- ==========================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50), -- ex: 'Cpu', 'Printer' (para mapear ícones Lucide)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INSERIR CATEGORIAS BASE
INSERT INTO public.categories (name, slug) VALUES 
('Prototipagem', 'prototipagem'),
('Cases IoT', 'cases-iot'),
('Engrenagens', 'engrenagens'),
('Gridfinity', 'gridfinity'),
('Miniaturas', 'miniaturas'),
('Utilidades', 'utilidades'),
('Ferramentas', 'ferramentas'),
('Robótica', 'robotica');

-- ==========================================
-- TABELA: models (Arquivos 3D Publicados)
-- ==========================================
CREATE TABLE public.models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    format VARCHAR(50) NOT NULL, -- ex: '3MF + STL', 'STL'
    
    -- Arquivos e Mídia
    thumbnail_url TEXT NOT NULL,
    gallery_urls TEXT[] DEFAULT '{}',
    file_url TEXT NOT NULL, -- Caminho no Storage Bucket
    
    -- Relacionamentos
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- Estatísticas Cache (Atualizadas via Triggers/Functions)
    downloads_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABELA: likes (Favoritos/Curtidas)
-- ==========================================
CREATE TABLE public.likes (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, model_id)
);

-- ==========================================
-- TABELA: purchases (Histórico de Compras/Downloads)
-- ==========================================
CREATE TABLE public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    stripe_session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TABELA: reviews (Avaliações dos Modelos)
-- ==========================================
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    model_id UUID REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    print_photo_url TEXT, -- O usuário pode subir uma foto de como ficou a impressão (Make)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, model_id) -- Usuário só pode avaliar um modelo 1 vez
);

-- ============================================================================
-- SEGURANÇA: RLS (Row Level Security) - SUPABASE
-- Regras para garantir que usuários só modifiquem seus próprios dados
-- ============================================================================

-- Ativar RLS nas tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (Todo mundo pode ver perfil público, categorias e modelos aprovados)
CREATE POLICY "Public profiles are visible to everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Categories are visible to everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Published models are visible to everyone" ON public.models FOR SELECT USING (is_published = true);
CREATE POLICY "Reviews are visible to everyone" ON public.reviews FOR SELECT USING (true);

-- Políticas de Modificação (Apenas dono)
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Creators can insert own models" ON public.models FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Creators can update own models" ON public.models FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can like/unlike" ON public.likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can leave reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- TRIGGER: Atualizar count de likes na tabela de models
-- ==========================================
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.models SET likes_count = likes_count + 1 WHERE id = NEW.model_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.models SET likes_count = likes_count - 1 WHERE id = OLD.model_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_inserted_deleted
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
