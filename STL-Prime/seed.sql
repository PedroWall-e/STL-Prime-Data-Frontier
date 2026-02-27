-- =============================================================================
-- TEST DATA SEED PARA O SUPABASE (STL PRIME)
-- Execute este ficheiro no SQL Editor do Supabase 
-- APÓS ter executado o `database.sql` principal.
-- =============================================================================

-- 1. Criação de um Utilizador de Teste (Criador)
-- Nota: A password não funcionará para login pois não foi hashada pelo Supabase Auth corretamente aqui,
-- mas serve primariamente para vincular os modelos a um autor real nas verificações de FK.
INSERT INTO public.users (id, email, full_name, username, avatar_url, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'criador@stlprime.com', 'Pedro 3D', 'pedro3d', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro', 'creator')
ON CONFLICT (id) DO NOTHING;

-- 2. Inserção de Categorias Iniciais
INSERT INTO public.categories (name, slug, description, icon_name)
VALUES
    ('Arquitetura', 'arquitetura', 'Modelos de prédios, casas e estruturas em escala.', 'building'),
    ('Miniaturas', 'miniaturas', 'Miniaturas de RPG, wargames e colecionáveis.', 'box'),
    ('Engenharia', 'engenharia', 'Peças funcionais, engrenagens e reposições.', 'cpu'),
    ('Articulação', 'articulacao', 'Modelos fexíveis e print-in-place.', 'activity')
ON CONFLICT (slug) DO NOTHING;

-- 3. Inserção de Modelos de Teste (Trends)
INSERT INTO public.models (id, author_id, category_id, title, slug, description, price, is_free, format, thumbnail_url, file_url, is_published, downloads_count, likes_count)
VALUES
    (
        uuid_generate_v4(), 
        '00000000-0000-0000-0000-000000000001', 
        (SELECT id FROM public.categories WHERE slug = 'miniaturas' LIMIT 1),
        'Cyberpunk Samurai Miniatura', 
        'cyberpunk-samurai-miniatura', 
        'Miniatura altamente detalhada, pronta para impressão em resina. Pré-suportada.', 
        5.99, 
        false, 
        'STL / 3MF', 
        'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=600&auto=format&fit=crop', 
        'test-file-path-1', 
        true, 
        1540, 
        345
    ),
    (
        uuid_generate_v4(), 
        '00000000-0000-0000-0000-000000000001', 
        (SELECT id FROM public.categories WHERE slug = 'engenharia' LIMIT 1),
        'Caixa de Engrenagens Planetária', 
        'caixa-de-engrenagens-planetaria', 
        'Print-in-place, sem suportes necessários. Tolerâncias perfeitas para FDM.', 
        0.00, 
        true, 
        '3MF', 
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop', 
        'test-file-path-2', 
        true, 
        890, 
        210
    ),
    (
        uuid_generate_v4(), 
        '00000000-0000-0000-0000-000000000001', 
        (SELECT id FROM public.categories WHERE slug = 'arquitetura' LIMIT 1),
        'Castelo Gótico Modular', 
        'castelo-gotico-modular', 
        'Conjunto de 50 peças modulares para montar o seu próprio castelo para dioramas.', 
        12.50, 
        false, 
        'STL', 
        'https://images.unsplash.com/photo-1605814577881-80bb6e2ab176?q=80&w=600&auto=format&fit=crop', 
        'test-file-path-3', 
        true, 
        2300, 
        890
    ),
    (
        uuid_generate_v4(), 
        '00000000-0000-0000-0000-000000000001', 
        (SELECT id FROM public.categories WHERE slug = 'articulacao' LIMIT 1),
        'Dragão Articulado Flexível', 
        'dragao-articulado-flexivel', 
        'Print in place. Flexiona em 40 pontos diferentes. Excelente para testes de primeira camada.', 
        0.00, 
        true, 
        'STL / 3MF', 
        'https://images.unsplash.com/photo-1596464518151-51280b18f773?q=80&w=600&auto=format&fit=crop', 
        'test-file-path-4', 
        true, 
        5400, 
        1200
    );

-- FIM DO SCRIPT DE SEED
