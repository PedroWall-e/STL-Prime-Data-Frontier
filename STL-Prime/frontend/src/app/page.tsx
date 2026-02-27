"use client";

import React, { useState, useEffect } from 'react';
import AdminKeypad from '@/components/AdminKeypad';
import {
    Search,
    Menu,
    ChevronRight,
    Heart,
    Download,
    Star,
    TrendingUp,
    Printer,
    Box,
    ShieldCheck,
    X,
    UploadCloud,
    User,
    LogOut,
    Cpu,
    Gamepad2,
    Settings,
    Wrench,
    ArrowRight,
    ShoppingCart
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getCategories, getTrendingModels, Category, Model } from '@/services/catalogService';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

// Paleta de Cores Oficial - Data Frontier
const theme = {
    blue: '#3347FF',
    dark: '#030712',
    lightBg: '#F8F9FA'
};

// Mapeamento dinâmico de ícones (Fallback caso a categoria venha do banco sem ícone)
const IconMap: Record<string, any> = {
    'prototipagem': Cpu,
    'cases-iot': Box,
    'engrenagens': Settings,
    'utilidades': Wrench,
    'miniaturas': Gamepad2,
    default: Box
};

export default function STLPrimeApp() {
    const supabase = createClient();
    const { totalItems, openCart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [trendingModels, setTrendingModels] = useState<Model[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        const loadHomePageData = async () => {
            setLoadingData(true);
            try {
                const [cats, models] = await Promise.all([
                    getCategories(),
                    getTrendingModels(4)
                ]);
                setCategories(cats);
                setTrendingModels(models);
            } catch (err) {
                console.error("Erro ao carregar dados dinâmicos da home", err);
            } finally {
                setLoadingData(false);
            }
        };

        checkUser();
        loadHomePageData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: theme.lightBg, color: theme.dark }}>

            <AdminKeypad />

            {/* Navbar - Estilo Marketplace */}
            <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/logo.svg" alt="STL Prime Logo" className="w-12 h-12" />
                    </Link>

                    {/* Search Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar modelos 3D..."
                            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 rounded-full py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
                        />
                    </div>

                    {/* Ações Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="text-gray-600 hover:text-[#3347FF] font-bold text-sm transition-colors">
                            Explorar
                        </button>
                        <button className="text-gray-600 hover:text-[#3347FF] font-bold text-sm transition-colors">
                            Comunidade
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#3347FF] transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            Carregar
                        </button>
                        <button
                            onClick={openCart}
                            className="relative p-2 text-gray-600 hover:text-[#3347FF] transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#3347FF] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                        {user ? (
                            <div className="flex items-center gap-4 ml-2">
                                <span className="text-sm font-bold text-gray-600">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'Utiliador'}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                                >
                                    <LogOut className="w-4 h-4" /> Sair
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: theme.blue }}>
                                <User className="w-4 h-4" />
                                Entrar
                            </Link>
                        )}
                    </div>

                    {/* Toggle Mobile */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-20 z-40 bg-white p-6 flex flex-col gap-6 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Pesquisar modelos 3D..."
                        className="w-full bg-gray-100 border-transparent focus:border-[#3347FF] rounded-xl py-3 px-4 text-sm outline-none"
                    />
                    <button className="text-left font-bold text-lg text-gray-800">Explorar</button>
                    <button className="text-left font-bold text-lg text-gray-800">Comunidade</button>
                    <button className="text-left font-bold text-lg text-[#3347FF] flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Carregar Modelo
                    </button>
                    {user ? (
                        <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
                            <span className="font-bold text-gray-600">
                                Olá, {user.user_metadata?.full_name || 'Usuário'}
                            </span>
                            <button onClick={handleSignOut} className="py-4 rounded-xl font-bold text-red-500 border border-red-100 hover:bg-red-50 text-center flex items-center justify-center gap-2">
                                <LogOut className="w-5 h-5" /> Sair da Conta
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="mt-auto py-4 rounded-xl font-bold text-white text-center block" style={{ backgroundColor: theme.blue }}>
                            Entrar / Registar
                        </Link>
                    )}
                </div>
            )}

            {/* Hero Section */}
            <header className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-white">
                <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-[#3347FF]/20 text-[#3347FF] text-xs font-bold mb-8 shadow-sm">
                        <Star size={14} className="fill-[#3347FF]" />
                        <span className="uppercase tracking-wide">O Marketplace 3D da Data Frontier</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-balance" style={{ color: theme.dark }}>
                        Design de Fronteira. <br className="hidden md:block" />
                        <span style={{ color: theme.blue }}>Impressão de Precisão.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10 font-medium text-balance">
                        Descarregue milhares de ficheiros STL e 3MF premium. Modelos otimizados e testados pela nossa equipa de engenharia para garantir impressões perfeitas.
                    </p>

                    {/* Barra de Pesquisa Principal */}
                    <div className="w-full max-w-3xl relative shadow-2xl rounded-2xl group">
                        <div className="absolute -inset-1 bg-[#3347FF] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative flex items-center w-full bg-white border-2 border-transparent focus-within:border-[#3347FF] rounded-2xl overflow-hidden transition-all">
                            <div className="pl-6 text-[#3347FF]">
                                <Search size={26} />
                            </div>
                            <input
                                type="text"
                                placeholder="Ex: Suporte de Monitor, Engrenagens, Cases..."
                                className="w-full bg-transparent py-5 md:py-6 px-4 text-[#030712] outline-none font-medium text-lg placeholder:text-gray-400"
                            />
                            <button className="hidden md:block px-10 py-6 font-bold text-white transition-colors hover:bg-blue-700" style={{ backgroundColor: theme.blue }}>
                                Procurar
                            </button>
                        </div>
                    </div>

                    {/* Tags Populares */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <span className="text-sm font-bold text-gray-600 py-2">Tendências:</span>
                        {['IoT', 'Articulados', 'Impressão em Resina', 'Gridfinity'].map((tag) => (
                            <a key={tag} href="#" className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-bold hover:border-[#3347FF] hover:text-[#3347FF] transition-all shadow-sm">
                                {tag}
                            </a>
                        ))}
                    </div>
                </div>
            </header>

            {/* Categorias Dinâmicas do Banco */}
            <section className="py-10 border-y border-gray-200 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {categories.map((cat, i) => {
                            const IconComponent = IconMap[cat.slug] || IconMap.default;
                            return (
                                <button
                                    key={i}
                                    className="shrink-0 snap-start flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:border-[#3347FF] hover:bg-blue-50 text-gray-700 hover:text-[#3347FF] transition-all font-bold whitespace-nowrap"
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Modelos em Destaque (Dinâmico) */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Cabeçalho da Seção */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest mb-2" style={{ color: theme.dark }}>
                                <TrendingUp size={18} /> Modelos em Destaque
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Engenharia Partilhada</h2>
                        </div>
                        <button className="flex items-center gap-2 text-[#3347FF] font-bold hover:gap-3 transition-all">
                            Ver todos <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Grid de Modelos Vinculado ao Supabase */}
                    {loadingData ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3347FF]"></div>
                        </div>
                    ) : trendingModels.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
                            <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum modelo em destaque ainda.</h3>
                            <p className="text-gray-500">Adicione modelos no painel do Supabase para vê-los aqui.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trendingModels.map((model, i) => (
                                <div key={i} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Thumbnail Genérica ou Real */}
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:bg-gray-200 transition-colors">
                                        {model.thumbnail_url ? (
                                            <img src={model.thumbnail_url} alt={model.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <Box className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-sm">
                                            <Heart className="w-4 h-4 text-rose-500" /> {model.likes_count}
                                        </div>
                                        {model.format && (
                                            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {model.format}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info do Card */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-[#3347FF] transition-colors cursor-pointer">{model.title}</h3>
                                            <p className="text-gray-500 text-sm font-medium hover:text-gray-800 cursor-pointer">por @{model.author?.username || 'Anônimo'}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-extrabold text-[#3347FF] text-xl">
                                                {model.price === 0 || !model.price ? 'Grátis' : `R$ ${model.price.toFixed(2)}`}
                                            </span>
                                            <button className="bg-gray-100 hover:bg-[#3347FF] hover:text-white text-gray-900 p-3 rounded-xl transition-colors">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Secção de Vantagens (Features) */}
            <section className="py-20 border-y border-gray-200 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: theme.dark }}>O Padrão Data Frontier</h2>
                        <p className="text-lg font-medium text-gray-500">
                            A STL Prime não é apenas um repositório. É um ecossistema construído para garantir que a sua impressora 3D nunca pare.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-100 hover:border-[#3347FF]/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                                <ShieldCheck size={28} style={{ color: theme.blue }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.dark }}>Modelos Testados</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Cada modelo premium é impresso e verificado na nossa fazenda de impressoras. Diga adeus aos modelos com geometria quebrada.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-100 hover:border-[#3347FF]/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6" style={{ color: theme.dark }}>
                                <Printer size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.dark }}>Ficheiros 3MF Prontos</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Fornecemos perfis 3MF configurados com suportes, orientações e definições ideais para Bambu Lab, Prusa e Creality.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-gray-100 hover:border-[#3347FF]/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md" style={{ backgroundColor: theme.blue }}>
                                <Star size={28} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.dark }}>Assinatura Prime</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Acesso a ficheiros exclusivos, direitos de revenda comercial de impressões e descontos na compra de filamentos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Final */}
            <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.dark }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 blur-[120px] rounded-full pointer-events-none opacity-50" style={{ backgroundColor: theme.blue }}></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pronto para aquecer o seu Hotend?</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
                        Junte-se à comunidade. Descarregue modelos otimizados hoje mesmo ou torne-se um criador e rentabilize os seus designs.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/signup" className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-white text-lg hover:scale-105 transition-transform duration-300 shadow-xl" style={{ backgroundColor: theme.blue }}>
                            Criar Conta Gratuita
                        </Link>
                        <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-transparent border border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                            Explorar Catálogo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Minimalista */}
            <footer className="py-12 bg-white">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.svg" alt="STL Prime Logo" className="w-10 h-10" />
                        <span className="font-bold text-gray-400 text-sm uppercase tracking-widest">STL Prime</span>
                    </div>

                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Tecnologia única como você.
                    </div>

                    <div className="flex gap-6 text-sm font-bold text-gray-500">
                        <a href="#" className="hover:text-[#3347FF] transition-colors">Termos</a>
                        <a href="#" className="hover:text-[#3347FF] transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-[#3347FF] transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
