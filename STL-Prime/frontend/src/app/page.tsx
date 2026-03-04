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
    ShieldCheck,
    X,
    UploadCloud,
    User,
    LogOut,
    Bell,
    Bookmark,
    Filter,
    Layers,
    Zap,
    CheckCircle2,
    Box,
    ShoppingCart,
    ArrowRight,
    ExternalLink,
    ShoppingBag
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = {
    dark: '#2B2B2B',
    blue: '#3347FF',
    peach: '#FFE3D6',
    rawhide: '#B2624F',
    lightBg: '#F9F8F6',
    white: '#FFFFFF',
};

// ─── Static Mock Data (used when Supabase returns no data) ───────────────────
const TRENDING_MODELS = [
    { id: 1, title: 'Suporte Articulado para Monitor V2', author: 'EngenhariaDF', avatar: 'https://i.pravatar.cc/150?u=df', price: 0, downloads: '12.4k', likes: 3420, format: '3MF + STL', isPremium: false, tags: ['FDM', 'Print-in-Place'], imageUrl: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=800' },
    { id: 2, title: 'Case IoT Satelital - Robusto (IP67)', author: 'DataFrontier_Lab', avatar: 'https://i.pravatar.cc/150?u=dflab', price: 15.50, downloads: '892', likes: 450, format: '3MF', isPremium: true, tags: ['FDM', 'Case'], imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=800' },
    { id: 3, title: 'Engrenagem Planetária Paramétrica', author: 'MakerPro', avatar: 'https://i.pravatar.cc/150?u=maker', price: 0, downloads: '5.1k', likes: 1200, format: 'STL', isPremium: false, tags: ['Mecânica'], imageUrl: 'https://images.unsplash.com/photo-1537724326059-2ea20251b9c8?auto=format&fit=crop&q=80&w=800' },
    { id: 4, title: 'Organizador Gridfinity Premium 4x4', author: 'DesktopHacks', avatar: 'https://i.pravatar.cc/150?u=desk', price: 4.99, downloads: '2.3k', likes: 890, format: '3MF', isPremium: true, tags: ['Organização'], imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800' },
    { id: 5, title: 'Vaso Geométrico Voronoi', author: 'HomeDeco3D', avatar: 'https://i.pravatar.cc/150?u=home', price: 0, downloads: '18k', likes: 5600, format: 'STL', isPremium: false, tags: ['Decoração'], imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800' },
    { id: 6, title: 'Turbina a Jato Jet-X (Educacional)', author: 'AeroSpace', avatar: 'https://i.pravatar.cc/150?u=aero', price: 25.00, downloads: '410', likes: 315, format: '3MF', isPremium: true, tags: ['Complexo', 'Multicolor'], imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800' },
    { id: 7, title: 'Braço Robótico de 6 Eixos - Kit', author: 'RoboTech', avatar: 'https://i.pravatar.cc/150?u=robo', price: 45.00, downloads: '1.1k', likes: 890, format: '3MF', isPremium: true, tags: ['Eletrônica'], imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800' },
    { id: 8, title: 'Clipe Organizador de Cabos Desk', author: 'PragmaticDesign', avatar: 'https://i.pravatar.cc/150?u=prag', price: 0, downloads: '32k', likes: 8900, format: 'STL', isPremium: false, tags: ['Utilidade'], imageUrl: 'https://images.unsplash.com/photo-1520106292556-9a2ed935a8bc?auto=format&fit=crop&q=80&w=800' },
];

const CATEGORIES = [
    { name: 'Prototipagem', icon: <Layers size={18} /> },
    { name: 'Cases IoT', icon: <Box size={18} /> },
    { name: 'Engrenagens', icon: <CheckCircle2 size={18} /> },
    { name: 'Gridfinity', icon: <Search size={18} /> },
    { name: 'Miniaturas', icon: <Star size={18} /> },
    { name: 'Utilidades', icon: <Zap size={18} /> },
];

const COLLECTIONS = [
    { title: 'Setup Perfeito', items: '24 modelos', img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400' },
    { title: 'Mundo Maker', items: '150+ modelos', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400' },
    { title: 'Cases Eletrônicos', items: '89 modelos', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function STLPrimeApp() {
    const supabase = createClient();
    const { totalItems, openCart, addItem } = useCart();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('trending');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const handleAddToCart = (model: typeof TRENDING_MODELS[0]) => {
        addItem({
            id: String(model.id),
            title: model.title,
            price: model.price,
            author_username: model.author,
            format: model.format,
            thumbnail_url: model.imageUrl,
        });
        openCart();
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: theme.lightBg, color: theme.dark }}>
            <AdminKeypad />

            {/* ── Navbar ──────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all">
                <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                        <img src="/logo.svg" alt="STL Prime" className="w-11 h-11" />
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-2xl tracking-tight" style={{ color: theme.dark }}>
                                stl<span style={{ color: theme.blue }}>prime</span>
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">by Data Frontier</span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-12 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#3347FF] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar milhões de modelos 3D..."
                            className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-[#3347FF] focus:shadow-[0_0_0_4px_rgba(51,71,255,0.1)] rounded-full py-2.5 pl-12 pr-10 text-sm font-medium transition-all outline-none"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-500 hover:text-[#3347FF] hover:bg-gray-100 rounded-full transition-all relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                            </button>
                            <button className="p-2 text-gray-500 hover:text-[#3347FF] hover:bg-gray-100 rounded-full transition-all">
                                <Bookmark className="w-5 h-5" />
                            </button>
                        </div>

                        <a href="https://www.datafrontier3d.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE3D6] text-[#B2624F] text-xs font-black hover:bg-[#ffd9c7] transition-all uppercase tracking-tight">
                            <ShoppingBag size={14} /> Loja Oficial
                        </a>

                        <Link href="/upload" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#3347FF] transition-colors">
                            <UploadCloud className="w-4 h-4" /> Carregar
                        </Link>

                        {/* Cart */}
                        <button onClick={openCart} className="relative p-2 text-gray-500 hover:text-[#3347FF] hover:bg-gray-100 rounded-full transition-all">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#3347FF] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="text-sm font-bold text-gray-700 hover:text-[#3347FF] transition-colors">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'Conta'}
                                </Link>
                                <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white shadow-lg shadow-[#3347FF]/30 hover:shadow-[#3347FF]/50 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: theme.blue }}>
                                <User className="w-4 h-4" /> Entrar
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden p-2 text-gray-800 bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-20 z-40 bg-white/95 backdrop-blur-xl p-6 flex flex-col gap-6 border-b border-gray-200">
                    <input type="text" placeholder="Pesquisar modelos..." className="w-full bg-gray-100 border-2 border-transparent focus:border-[#3347FF] rounded-2xl py-3.5 px-5 text-sm outline-none font-medium" />
                    <div className="flex flex-col gap-4 text-lg font-bold text-gray-800">
                        <button className="text-left py-2 border-b border-gray-100">Explorar Modelos</button>
                        <button className="text-left py-2 border-b border-gray-100">Coleções Curadas</button>
                        <button onClick={openCart} className="text-left py-2 border-b border-gray-100 flex items-center gap-2">
                            <ShoppingCart size={20} /> Carrinho {totalItems > 0 && <span className="bg-[#3347FF] text-white text-xs px-2 py-0.5 rounded-full">{totalItems}</span>}
                        </button>
                    </div>
                    {user ? (
                        <div className="flex gap-3 mt-4">
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white" style={{ backgroundColor: theme.blue }}>
                                <User className="w-5 h-5" /> Minha Conta
                            </Link>
                            <button onClick={handleSignOut} className="px-5 py-4 rounded-2xl font-bold text-red-500 border border-red-200">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white shadow-lg" style={{ backgroundColor: theme.blue }}>
                            <User className="w-5 h-5" /> Entrar ou Registar
                        </Link>
                    )}
                </div>
            )}

            {/* ── Hero ────────────────────────────────────────────────── */}
            <header className="relative w-full overflow-hidden bg-[#F4F6FF]">
                {/* Soft Mesh Gradient */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFE3D6] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#E0E7FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#E8EAFF] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
                    <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#F9F8F6] to-transparent z-10"></div>
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10 pt-20 pb-40 md:pt-32 md:pb-48">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[#3347FF] text-xs font-bold mb-6 shadow-sm">
                            <Zap size={14} />
                            <span className="uppercase tracking-widest">A nova era da impressão 3D</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] text-gray-900">
                            Designs perfeitos.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3347FF] to-[#8C9BFF]">Impressões perfeitas.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 mb-10 font-medium max-w-2xl leading-relaxed">
                            Junte-se a mais de 50.000 makers. Descubra ficheiros STL e 3MF otimizados, testados em laboratório e prontos para a sua impressora.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button className="px-8 py-4 rounded-full font-black text-white text-lg transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(51,71,255,0.3)] shadow-xl" style={{ backgroundColor: theme.blue }}>
                                Explorar Catálogo
                            </button>
                            <a href="https://www.datafrontier3d.com.br" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full font-bold text-[#B2624F] bg-[#FFE3D6] border border-[#B2624F]/20 hover:bg-[#ffd9c7] shadow-sm transition-all text-lg flex items-center gap-2">
                                <ShoppingBag size={20} /> Loja Oficial Data Frontier
                            </a>
                        </div>

                        <div className="flex items-center gap-6 mt-12 text-sm font-bold text-gray-500">
                            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#3347FF]" /> 12k+ Modelos Testados</div>
                            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#3347FF]" /> Suporte a Bambu & Prusa</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Categories Pills ─────────────────────────────────────── */}
            <section className="relative z-20 -mt-20 container mx-auto px-4 md:px-8 mb-16">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white p-2 md:p-4 flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide snap-x">
                    {CATEGORIES.map((cat, i) => (
                        <button key={i} className="shrink-0 snap-start flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-[#F0F3FF] text-gray-700 hover:text-[#3347FF] transition-all font-bold whitespace-nowrap group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all text-gray-400 group-hover:text-[#3347FF]">
                                {cat.icon}
                            </div>
                            {cat.name}
                        </button>
                    ))}
                    <button className="shrink-0 snap-start flex items-center gap-2 px-6 py-3 rounded-xl text-gray-500 hover:text-gray-800 font-bold ml-auto">
                        Ver todas <ChevronRight size={16} />
                    </button>
                </div>
            </section>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div className="container mx-auto px-4 md:px-8">

                {/* Featured Collections */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <button disabled className="text-sm font-bold text-gray-400 opacity-60 cursor-not-allowed">Ver todas (em breve)</button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {COLLECTIONS.map((col, i) => (
                                <div key={i} className="group relative h-32 md:h-44 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all">
                                    <img src={col.img} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-5">
                                        <h4 className="text-white font-bold text-lg">{col.title}</h4>
                                        <p className="text-gray-300 text-xs font-medium">{col.items}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Model Feed */}
                    <section className="mb-24">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-black" style={{ color: theme.dark }}>Modelos para si</h2>
                                <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
                                    {[{ id: 'trending', label: 'Em Alta' }, { id: 'new', label: 'Novidades' }].map(t => (
                                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                    <button onClick={() => setActiveTab('premium')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1 ${activeTab === 'premium' ? 'bg-[#3347FF] text-white shadow-sm' : 'text-[#3347FF] hover:bg-blue-50'}`}>
                                        <Star size={14} className={activeTab === 'premium' ? 'fill-white' : ''} /> Premium
                                    </button>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:border-gray-300 shadow-sm">
                                <Filter size={16} /> Filtros
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {TRENDING_MODELS.map((model) => (
                                <div key={model.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#3347FF]/30 hover:shadow-xl transition-all duration-300 relative">
                                    {model.isPremium && (
                                        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#3347FF] to-[#8C9BFF] text-white p-1.5 rounded-lg shadow-md" title="Modelo Premium">
                                            <Star size={14} className="fill-white" />
                                        </div>
                                    )}

                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer">
                                        <img src={model.imageUrl} alt={model.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-gray-700 shadow-sm border border-gray-100/50">
                                            {model.format}
                                        </div>

                                        {/* Hover actions */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-end gap-2">
                                            <button className="p-2.5 rounded-full bg-white text-gray-700 hover:text-red-500 hover:scale-110 transition-transform shadow-lg">
                                                <Heart size={18} />
                                            </button>
                                            <button className="p-2.5 rounded-full bg-white text-gray-700 hover:text-[#3347FF] hover:scale-110 transition-transform shadow-lg">
                                                <Bookmark size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(model)}
                                                className="px-4 py-2.5 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                                style={{ backgroundColor: theme.blue }}
                                            >
                                                <ShoppingCart size={15} /> {model.price === 0 ? 'Grátis' : `R$${model.price}`}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="text-[15px] font-bold leading-tight line-clamp-2 group-hover:text-[#3347FF] transition-colors cursor-pointer text-gray-900">
                                                {model.title}
                                            </h3>
                                            <span className="shrink-0 font-black text-sm" style={{ color: model.price === 0 ? '#10B981' : theme.dark }}>
                                                {model.price === 0 ? 'Grátis' : `R$${model.price.toFixed(2)}`}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {model.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2 cursor-pointer group/author">
                                                <img src={model.avatar} alt={model.author} className="w-6 h-6 rounded-full bg-gray-200 border border-gray-100" />
                                                <span className="text-xs font-bold text-gray-600 group-hover/author:text-[#3347FF] transition-colors truncate max-w-[100px]">
                                                    {model.author}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-gray-400 font-bold text-xs">
                                                    <Download size={12} /> {model.downloads}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400 font-bold text-xs">
                                                    <Heart size={12} /> {model.likes}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <button className="px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors inline-flex items-center gap-2">
                                Carregar mais modelos <ChevronRight size={18} />
                            </button>
                        </div>
                    </section>
                </div>

                {/* ── Subscription CTA ─────────────────────────────────────── */}
                <section className="py-24 relative overflow-hidden bg-white border-y border-gray-100">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 text-[#B2624F] text-xs font-black uppercase tracking-wider">
                                    <Star size={14} className="fill-[#B2624F]" /> Para Profissionais
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                    Desbloqueie o poder da <br />
                                    <span style={{ color: theme.blue }}>STL Prime Subscription</span>
                                </h2>
                                <p className="text-lg text-gray-600 font-medium max-w-lg leading-relaxed">
                                    Pare de perder tempo reparando malhas e configurando suportes. Nossos engenheiros otimizam cada arquivo 3MF para garantir impressões infalíveis na sua fazenda.
                                </p>
                                <ul className="space-y-4">
                                    {['Licença de venda comercial de impressões', 'Acesso a ficheiros exclusivos e premium', 'Perfis de fatiador otimizados (Bambu Studio & PrusaSlicer)', 'Descontos de 20% em filamentos de parceiros'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 font-bold text-gray-700">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="px-8 py-4 rounded-xl font-black text-white shadow-xl shadow-[#3347FF]/20 hover:shadow-[#3347FF]/40 hover:-translate-y-1 transition-all" style={{ backgroundColor: theme.blue }}>
                                    Ver Planos e Preços
                                </button>
                            </div>

                            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#3347FF]/10 to-[#B2624F]/10 blur-3xl rounded-full transform -skew-y-12"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <img src="https://images.unsplash.com/photo-1631541909061-71e34a49cebe?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-2xl object-cover h-64 w-full" alt="Impressão 3D" />
                                    <img src="https://images.unsplash.com/photo-1590422749895-d04b87c48508?auto=format&fit=crop&q=80&w=400" className="rounded-3xl shadow-2xl object-cover h-64 w-full translate-y-8" alt="Design 3D" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="pt-20 pb-10 bg-gray-50 text-gray-600 border-t border-gray-200">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                            <div className="col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <img src="/logo.svg" alt="STL Prime" className="w-10 h-10" />
                                    <span className="font-black text-2xl tracking-tight text-gray-900">stl<span className="text-[#3347FF]">prime</span></span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                                    O ecossistema definitivo para criadores e makers. Desenvolvido com precisão pela Data Frontier Labs.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">Explorar</h4>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li><Link href="/models?sort=trending" className="hover:text-[#3347FF] transition-colors">Modelos em Alta</Link></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">STL Prime Premium</button></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Desafios de Design</button></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Hardware & Filamentos</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">Criadores</h4>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li><Link href="/upload" className="hover:text-[#3347FF] transition-colors">Vender na STL Prime</Link></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Programa de Parceiros</button></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Guia de Otimização 3MF</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">Empresa</h4>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Sobre a Data Frontier</button></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Carreiras</button></li>
                                    <li><button disabled className="hover:text-[#3347FF] transition-colors opacity-50 cursor-not-allowed" title="Em breve">Suporte e FAQ</button></li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
                            <p>&copy; 2024 Data Frontier Labs. Todos os direitos reservados.</p>
                            <div className="flex gap-6">
                                <span className="text-gray-400 opacity-60 cursor-not-allowed" title="Em breve">Termos de Serviço</span>
                                <span className="text-gray-400 opacity-60 cursor-not-allowed" title="Em breve">Política de Privacidade</span>
                                <span className="text-gray-400 opacity-60 cursor-not-allowed" title="Em breve">Cookies</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            );
}
