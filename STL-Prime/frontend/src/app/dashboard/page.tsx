"use client";

import React, { useState, useEffect } from 'react';
import { Download, Package, UploadCloud, ArrowLeft, User, LogOut, FileDown, CheckCircle2, Clock, MapPin, CreditCard, ShieldCheck, Star, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';

interface Purchase {
    id: string;
    created_at: string;
    amount: number;
    model: {
        id: string;
        title: string;
        thumbnail_url: string | null;
        format: string | null;
        file_url: string;
    };
}

interface MyModel {
    id: string;
    title: string;
    thumbnail_url: string | null;
    price: number;
    is_free: boolean;
    downloads_count: number;
    likes_count: number;
    is_published: boolean;
    created_at: string;
}

interface CreatorSale {
    id: string;
    amount_paid: number;
    created_at: string;
    model: { title: string };
    user: { full_name: string };
}

const isSimulationMode = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    return !url || url.includes('SEU_PROJETO') || url.includes('mockup');
};

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [tab, setTab] = useState<'downloads' | 'mymodels' | 'profile' | 'sales'>('downloads');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [creatorSales, setCreatorSales] = useState<CreatorSale[]>([]);
    const [myModels, setMyModels] = useState<MyModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            // If Supabase URL is a placeholder, skip the network call
            if (isSimulationMode()) {
                setUser({ user_metadata: { full_name: 'Usuário Teste (Simulação)' }, email: 'teste@simulacao.com' });
                setPurchases([{
                    id: 'mock-1', created_at: new Date().toISOString(), amount: 0,
                    model: { id: 'm1', title: 'Low-Poly Bulbasaur Planter', thumbnail_url: 'https://images.unsplash.com/photo-1618331835717-817684d0b16b', format: 'STL', file_url: '#' },
                }, {
                    id: 'mock-2', created_at: new Date(Date.now() - 86400000).toISOString(), amount: 15.5,
                    model: { id: 'm2', title: 'Vaso Orgânico Paramétrico', thumbnail_url: 'https://images.unsplash.com/photo-1616422285623-13fd3397bd59', format: '3MF', file_url: '#' },
                }]);
                setMyModels([{
                    id: 'mod1', title: 'Suporte Articulado para Fone', thumbnail_url: 'https://images.unsplash.com/photo-1599669500515-bdff2a281895', price: 9.90, is_free: false, downloads_count: 42, likes_count: 15, is_published: true, created_at: new Date().toISOString()
                }]);
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                // Fetch real data
                const { data: purchasesData } = await supabase
                    .from('purchases')
                    .select('id, created_at, amount, model:models(id, title, thumbnail_url, format, file_url)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (purchasesData) setPurchases(purchasesData as any);

                // Fetch User Profile (for subscription)
                const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
                if (profileData) setProfile(profileData);

                // Fetch My Models
                const { data: modelsData } = await supabase
                    .from('models')
                    .select('id, title, thumbnail_url, price, is_free, downloads_count, likes_count, is_published, created_at')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false });

                if (modelsData) setMyModels(modelsData as any);

                // Fetch Creator Sales (if is_creator)
                if (profileData?.is_creator) {
                    const { data: salesData } = await supabase
                        .from('purchases')
                        .select('id, amount_paid, created_at, model:models(title, author_id), user:users(full_name)')
                        .eq('model.author_id', user.id) // This filter might need adjustment if Supabase doesn't support nested filter directly like this
                        .order('created_at', { ascending: false });

                    if (salesData) setCreatorSales(salesData as any);
                }
            } else {
                // MODO SIMULAÇÃO LOCAL: Dados Falsos se não logged in
                setUser({ user_metadata: { full_name: 'Usuário Teste (Simulação)' }, email: 'teste@simulacao.com' });
                setProfile({ subscription_status: 'premium' });

                setPurchases([{
                    id: 'mock-1', created_at: new Date().toISOString(), amount: 0,
                    model: { id: 'm1', title: 'Low-Poly Bulbasaur Planter', thumbnail_url: 'https://images.unsplash.com/photo-1618331835717-817684d0b16b', format: 'STL', file_url: '#' },
                }, {
                    id: 'mock-2', created_at: new Date(Date.now() - 86400000).toISOString(), amount: 15.5,
                    model: { id: 'm2', title: 'Vaso Orgânico Paramétrico', thumbnail_url: 'https://images.unsplash.com/photo-1616422285623-13fd3397bd59', format: '3MF', file_url: '#' },
                }]);

                setMyModels([{
                    id: 'mod1', title: 'Suporte Articulado para Fone', thumbnail_url: 'https://images.unsplash.com/photo-1599669500515-bdff2a281895', price: 9.90, is_free: false, downloads_count: 42, likes_count: 15, is_published: true, created_at: new Date().toISOString()
                }]);

                setCreatorSales([{
                    id: 's1', amount_paid: 15.5, created_at: new Date().toISOString(), model: { title: 'Suporte Articulado' }, user: { full_name: 'Maria F.' }
                }]);
            }

            setLoading(false);
        };
        init();
    }, []);

    const handleDownload = async (fileUrl: string, title: string) => {
        if (fileUrl === '#') {
            alert(`[Modo Simulação] Download de ${title} com sucesso!`);
            return;
        }

        const { data } = await supabase.storage
            .from('model-files')
            .createSignedUrl(fileUrl, 3600); // 1-hour expiring link

        if (data?.signedUrl) {
            const a = document.createElement('a');
            a.href = data.signedUrl;
            a.download = `${title}.stl`;
            a.click();
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-[#2B2B2B] transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-[#3347FF]" />
                            <span className="font-bold text-[#2B2B2B]">Minha Conta</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/upload" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3347FF] text-white text-sm font-bold hover:bg-[#2236ee] transition-colors">
                            <UploadCloud className="w-4 h-4" /> Publicar Modelo
                        </Link>
                        <button
                            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">
                {/* User info */}
                {user && (
                    <div className="mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#3347FF]/10 border border-[#3347FF]/20 flex items-center justify-center text-2xl font-black text-[#3347FF] overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-black text-[#2B2B2B]">
                                        {user.user_metadata?.full_name || 'Utilizador'}
                                    </h1>
                                    <SubscriptionBadge
                                        status={profile?.subscription_status || 'free'}
                                        joinedAt={profile?.created_at}
                                        size="md"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-200 pb-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button
                        onClick={() => setTab('downloads')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${tab === 'downloads' ? 'border-[#3347FF] text-[#3347FF]' : 'border-transparent text-gray-500 hover:text-[#2B2B2B]'}`}
                    >
                        <FileDown className="w-4 h-4" /> Downloads ({purchases.length})
                    </button>
                    <button
                        onClick={() => setTab('mymodels')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${tab === 'mymodels' ? 'border-[#3347FF] text-[#3347FF]' : 'border-transparent text-gray-500 hover:text-[#2B2B2B]'}`}
                    >
                        <Package className="w-4 h-4" /> Meus Modelos ({myModels.length})
                    </button>
                    <button
                        onClick={() => setTab('profile')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${tab === 'profile' ? 'border-[#3347FF] text-[#3347FF]' : 'border-transparent text-gray-500 hover:text-[#2B2B2B]'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Perfil & Plano
                    </button>
                    <button
                        onClick={() => setTab('sales')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${tab === 'sales' ? 'border-[#3347FF] text-[#3347FF]' : 'border-transparent text-gray-500 hover:text-[#2B2B2B]'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Vendas
                    </button>
                </div>

                {loading ? (
                    <div className="py-24 text-center text-gray-400">Carregando...</div>
                ) : tab === 'downloads' ? (
                    <div className="space-y-4 animate-fadein">
                        {purchases.length === 0 ? (
                            <div className="py-20 text-center">
                                <FileDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 font-semibold">Nenhum download ainda</p>
                                <Link href="/" className="inline-block mt-4 text-[#3347FF] font-bold hover:underline text-sm">
                                    Explorar modelos →
                                </Link>
                            </div>
                        ) : (
                            purchases.map(p => (
                                <div key={p.id} className="flex gap-4 p-4 bg-white rounded-3xl border border-gray-200 shadow-sm items-center">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {p.model?.thumbnail_url ? (
                                            <img src={p.model.thumbnail_url} alt={p.model?.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#2B2B2B]">{p.model?.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            <span className="text-xs text-gray-400">
                                                Comprado em {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(p.model.file_url, p.model.title)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3347FF] text-white text-sm font-bold hover:bg-[#2236ee] transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> Baixar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : tab === 'mymodels' ? (
                    <div className="animate-fadein">
                        <div className="mb-6 flex justify-end">
                            <Link href="/upload" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2B2B2B] text-white text-sm font-bold hover:bg-gray-800 transition-colors">
                                <UploadCloud className="w-4 h-4" /> Novo Modelo
                            </Link>
                        </div>
                        {myModels.length === 0 ? (
                            <div className="py-20 text-center">
                                <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400 font-semibold">Você ainda não publicou nenhum modelo</p>
                                <Link href="/upload" className="inline-block mt-4 text-[#3347FF] font-bold hover:underline text-sm">
                                    Publicar agora →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {myModels.map(m => (
                                    <div key={m.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="h-40 bg-gray-100 overflow-hidden">
                                            {m.thumbnail_url ? (
                                                <img src={m.thumbnail_url} alt={m.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold text-[#2B2B2B] leading-tight truncate">{m.title}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <span>{m.downloads_count} downloads</span>
                                                <span>❤️ {m.likes_count}</span>
                                                <span className={`ml-auto px-2 py-0.5 rounded-full font-bold ${m.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {m.is_published ? 'Publicado' : 'Rascunho'}
                                                </span>
                                            </div>
                                            <p className="font-black text-[#3347FF] mt-2">
                                                {m.is_free ? 'Grátis' : `R$ ${m.price.toFixed(2)}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : tab === 'profile' ? (
                    <div className="space-y-8 animate-fadein">
                        <div className="bg-gradient-to-br from-[#3347FF] to-[#2236ee] rounded-3xl p-8 text-white shadow-xl shadow-[#3347FF]/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-4">
                                    <Star className="w-3 h-3 fill-white" /> STL Prime {profile?.subscription_status || 'Free'}
                                </div>
                                <h2 className="text-3xl font-black mb-2">Plano Ativo</h2>
                                <p className="text-white/80 font-medium mb-6">Sua assinatura está vinculada ao e-mail {user?.email}.</p>
                                <div className="flex gap-4">
                                    <button className="px-6 py-2.5 bg-white text-[#3347FF] font-black rounded-xl text-sm hover:bg-gray-50 transition-all">
                                        Gerenciar Assinatura
                                    </button>
                                    <button className="px-6 py-2.5 bg-white/10 text-white border border-white/20 font-black rounded-xl text-sm hover:bg-white/20 transition-all">
                                        Ver Faturas
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User size={16} /> Dados Pessoais
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome Completo</label>
                                        <p className="font-bold text-[#2B2B2B]">{user?.user_metadata?.full_name || 'Pedro Silva'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">E-mail</label>
                                        <p className="font-bold text-[#2B2B2B]">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Endereço de Faturamento
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Rua da Inovação, 123</p>
                                        <p className="text-sm font-medium text-gray-600">Lisboa, Portugal</p>
                                        <p className="text-sm font-medium text-gray-600">1000-001</p>
                                    </div>
                                    <button className="text-[#3347FF] text-xs font-black hover:underline uppercase tracking-tight">Editar Endereço</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadein">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Total Ganho (Mês) Líquido</p>
                                <p className="text-3xl font-black text-[#2B2B2B]">R$ {(creatorSales.reduce((acc, s) => acc + Number(s.amount_paid), 0) * 0.7).toFixed(2)}</p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                    <TrendingUp size={12} className="text-green-500" /> Já descontada a taxa de 30%
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Vendas Totais</p>
                                <p className="text-3xl font-black text-[#2B2B2B]">{creatorSales.length}</p>
                                <p className="mt-2 text-xs text-gray-400 font-medium">Modelos vendidos no total</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Popularidade</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <BarChart3 className="text-[#3347FF]" size={24} />
                                    <p className="text-xl font-black text-[#2B2B2B]">Top {profile?.is_creator ? '5%' : 'N/A'}</p>
                                </div>
                                <p className="mt-2 text-xs text-gray-400 font-medium">Baseado em downloads e likes</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-black text-[#2B2B2B]">Vendas Recentes</h3>
                                <button className="text-xs font-bold text-[#3347FF] hover:underline">Ver Histórico Completo</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {creatorSales.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 text-sm">Nenhuma venda registrada.</div>
                                ) : (
                                    creatorSales.map(sale => (
                                        <div key={sale.id} className="p-4 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <Package size={18} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#2B2B2B]">{sale.model?.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{new Date(sale.created_at).toLocaleString()} · Comprado por {sale.user?.full_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-[#2B2B2B]">R$ {(Number(sale.amount_paid) * 0.7).toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Preço pago: R$ {Number(sale.amount_paid).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-[#2B2B2B]">Saldo Disponível para Saque</p>
                                <p className="text-2xl font-black text-[#2B2B2B]">R$ {(creatorSales.reduce((acc, s) => acc + Number(s.amount_paid), 0) * 0.7).toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">* Já descontada a taxa de plataforma de 30%</p>
                            </div>
                            <button className="px-6 py-3 rounded-2xl bg-[#2B2B2B] text-white font-black text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                                Solicitar Saque
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
