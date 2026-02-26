"use client";

import React, { useState } from 'react';
import {
    Search,
    TrendingUp,
    Box,
    ChevronRight,
    Star,
    Download,
    Heart,
    Printer,
    ShieldCheck,
    Menu,
    X,
    UploadCloud,
    User
} from 'lucide-react';

// Paleta de Cores Oficial - Data Frontier
const theme = {
    dark: '#2B2B2B',
    blue: '#3347FF',
    peach: '#FFE3D6',
    rawhide: '#B2624F',
    lightBg: '#F9F8F6',
    white: '#FFFFFF'
};

// Dados Simulados (Mock Data) para o Marketplace
const TRENDING_MODELS = [
    { id: 1, title: 'Suporte Articulado para Monitor V2', author: '@EngenhariaDF', price: 0, downloads: '12.4k', likes: 3420, format: '3MF + STL', imageUrl: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=600' },
    { id: 2, title: 'Case IoT Satelital - Robusto', author: '@DataFrontier_Lab', price: 15.50, downloads: '892', likes: 450, format: '3MF', imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=600' },
    { id: 3, title: 'Engrenagem Planetária Paramétrica', author: '@MakerPro', price: 0, downloads: '5.1k', likes: 1200, format: 'STL', imageUrl: 'https://images.unsplash.com/photo-1537724326059-2ea20251b9c8?auto=format&fit=crop&q=80&w=600' },
    { id: 4, title: 'Organizador Gridfinity Premium', author: '@DesktopHacks', price: 4.99, downloads: '2.3k', likes: 890, format: '3MF + STL', imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600' },
    { id: 5, title: 'Vaso Geométrico Texturizado', author: '@HomeDeco3D', price: 0, downloads: '18k', likes: 5600, format: 'STL', imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600' },
    { id: 6, title: 'Turbina a Jato (Modelo Educacional)', author: '@AeroSpace', price: 25.00, downloads: '410', likes: 315, format: '3MF', imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600' },
    { id: 7, title: 'Braço Robótico de 6 Eixos', author: '@RoboTech', price: 45.00, downloads: '1.1k', likes: 890, format: '3MF + STL', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600' },
    { id: 8, title: 'Clipe de Cabos Minimalista', author: '@PragmaticDesign', price: 0, downloads: '32k', likes: 8900, format: 'STL', imageUrl: 'https://images.unsplash.com/photo-1520106292556-9a2ed935a8bc?auto=format&fit=crop&q=80&w=600' },
];

const CATEGORIES = [
    'Prototipagem', 'Cases IoT', 'Engrenagens', 'Gridfinity', 'Miniaturas', 'Utilidades', 'Ferramentas', 'Robótica'
];

export default function STLPrimeApp() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: theme.lightBg, color: theme.dark }}>

            {/* Navbar - Estilo Marketplace */}
            <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">

                    {/* Logo (Icon Only for Minimalist Look) */}
                    <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/logo.svg" alt="STL Prime Logo" className="w-12 h-12" />
                    </div>

                    {/* Search Desktop (Secundária) */}
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
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: theme.blue }}>
                            <User className="w-4 h-4" />
                            Entrar
                        </button>
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
                    <button className="mt-auto py-4 rounded-xl font-bold text-white text-center" style={{ backgroundColor: theme.blue }}>
                        Entrar / Registar
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <header className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden" style={{ backgroundColor: theme.peach }}>
                {/* Padrão de Fundo Subtil */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#B2624F 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-[#3347FF]/20 text-[#3347FF] text-xs font-bold mb-8 backdrop-blur-sm shadow-sm">
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
                            <div className="pl-6 text-[#B2624F]">
                                <Search size={26} />
                            </div>
                            <input
                                type="text"
                                placeholder="Ex: Suporte de Monitor, Engrenagens, Cases..."
                                className="w-full bg-transparent py-5 md:py-6 px-4 text-[#2B2B2B] outline-none font-medium text-lg placeholder:text-gray-400"
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
                            <a key={tag} href="#" className="px-4 py-2 rounded-full bg-white/50 border border-[#B2624F]/20 text-[#B2624F] text-sm font-bold hover:bg-white hover:border-[#B2624F] transition-all shadow-sm">
                                {tag}
                            </a>
                        ))}
                    </div>
                </div>
            </header>

            {/* Categorias */}
            <section className="py-10 border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {CATEGORIES.map((cat, i) => (
                            <button key={i} className="shrink-0 snap-start flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:border-[#3347FF] hover:bg-[#F0F3FF] text-gray-700 hover:text-[#3347FF] transition-all font-bold whitespace-nowrap">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modelos Populares (Grid Principal) */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">

                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest mb-2" style={{ color: theme.rawhide }}>
                                <TrendingUp size={18} /> Modelos em Destaque
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black" style={{ color: theme.dark }}>Engenharia Partilhada</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-200 rounded-lg p-1">
                                <button className="px-4 py-1.5 rounded-md bg-white shadow-sm font-bold text-sm">Populares</button>
                                <button className="px-4 py-1.5 rounded-md text-gray-500 hover:text-gray-800 font-bold text-sm">Recentes</button>
                            </div>
                            <a href="#" className="hidden md:flex items-center gap-1 font-bold transition-colors hover:opacity-70" style={{ color: theme.blue }}>
                                Ver Todos <ChevronRight size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Grid de Cards Estilo Printables/Cults */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {TRENDING_MODELS.map((model) => (
                            <div key={model.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3347FF]/50 hover:shadow-xl transition-all duration-300">

                                {/* Imagem do Modelo */}
                                <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                                    <img
                                        src={model.imageUrl}
                                        alt={model.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {/* Etiqueta de Formato (3MF/STL) */}
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-gray-800">
                                        {model.format}
                                    </div>
                                    {/* Botão de Gosto Rápido */}
                                    <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0">
                                        <Heart size={20} />
                                    </button>
                                </div>

                                {/* Informação do Modelo */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-[#3347FF] transition-colors cursor-pointer" style={{ color: theme.dark }}>
                                            {model.title}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-800">
                                            {model.author}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
                                                <Download size={16} /> {model.downloads}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
                                                <Heart size={16} /> {model.likes}
                                            </div>
                                        </div>

                                        <span className="font-black text-lg" style={{ color: model.price === 0 ? '#10B981' : theme.dark }}>
                                            {model.price === 0 ? 'Grátis' : `€${model.price.toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    <button className="w-full md:hidden mt-8 py-4 rounded-xl border-2 border-gray-200 text-gray-800 font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
                        Ver todos os modelos <ChevronRight size={18} />
                    </button>
                </div>
            </section>

            {/* Secção de Vantagens (Features) */}
            <section className="py-20 border-y border-gray-200" style={{ backgroundColor: theme.white }}>
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: theme.dark }}>O Padrão Data Frontier</h2>
                        <p className="text-lg font-medium text-gray-500">
                            A STL Prime não é apenas um repositório. É um ecossistema construído para garantir que a sua impressora 3D nunca pare.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-[#F9F8F6] p-8 rounded-3xl border border-gray-100 hover:border-[#3347FF]/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                                <ShieldCheck size={28} style={{ color: theme.blue }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.dark }}>Modelos Testados</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Cada modelo premium é impresso e verificado na nossa fazenda de impressoras. Diga adeus aos modelos com geometria quebrada.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#F9F8F6] p-8 rounded-3xl border border-gray-100 hover:border-[#B2624F]/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                                <Printer size={28} style={{ color: theme.rawhide }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.dark }}>Ficheiros 3MF Prontos</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Fornecemos perfis 3MF configurados com suportes, orientações e definições ideais para Bambu Lab, Prusa e Creality.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#F9F8F6] p-8 rounded-3xl border border-gray-100 hover:border-[#3347FF]/30 transition-colors">
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
                {/* Elemento Decorativo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 blur-[120px] rounded-full pointer-events-none opacity-50" style={{ backgroundColor: theme.blue }}></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pronto para aquecer o seu *Hotend*?</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
                        Junte-se à comunidade. Descarregue modelos otimizados hoje mesmo ou torne-se um criador e rentabilize os seus designs.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-[#2B2B2B] text-lg hover:scale-105 transition-transform duration-300 shadow-xl" style={{ backgroundColor: theme.peach }}>
                            Criar Conta Gratuita
                        </button>
                        <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-transparent border border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                            Explorar Catálogo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Minimalista */}
            <footer className="py-12 border-t border-gray-200" style={{ backgroundColor: theme.white }}>
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
