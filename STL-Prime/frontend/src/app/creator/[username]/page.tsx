"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
    ArrowLeft, Star, Download, Heart, Users, Package, BookOpen,
    Info, ShoppingCart, Shield, Zap, CheckCircle2, ChevronRight,
    ExternalLink, MapPin, Calendar, Layers, Award, User, UserPlus, UserCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';

interface Creator {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    is_creator: boolean;
    subscription_status: string;
    created_at: string;
    location?: string;
    social?: {
        website?: string;
        instagram?: string;
    };
    // We'll calculate/fetch these
    total_downloads?: number;
    total_models?: number;
    rating?: number;
    followers_count?: number;
}

interface Model {
    id: string;
    title: string;
    slug: string;
    price: number;
    format: string;
    thumbnail_url: string;
    downloads_count: number;
    likes_count: number;
}

// ─── Mock Creator Database ────────────────────────────────────────────────
const MOCK_CREATORS: Record<string, any> = {
    'DataFrontier_Lab': {
        username: 'DataFrontier_Lab',
        display_name: 'Data Frontier Labs',
        avatar: 'https://i.pravatar.cc/150?u=dflab',
        banner: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600',
        bio: 'Equipa de engenharia da Data Frontier. Criamos designs industriais, cases IoT e protótipos técnicos otimizados para produção em série. Todos os nossos arquivos são testados em ambiente de produção real.',
        location: 'Lisboa, Portugal',
        joined: '2023-01-15',
        is_official: true,
        verified: true,
        team_role: 'Data Frontier Engineering Team',
        followers: 8900,
        following: 120,
        total_downloads: 48200,
        total_models: 34,
        rating: 4.98,
        subscription_note: 'Todos os modelos premium deste criador estão incluídos na STL Prime Pro Subscription.',
        social: { website: 'https://datafrontier.pt', instagram: '@datafrontier_lab' },
        tabs: ['Modelos', 'Coleções', 'Lab Notes', 'Sobre'],
        models: [
            { id: '2', slug: 'case-iot-satelital', title: 'Case IoT Satelital (IP67)', price: 15.50, is_free: false, downloads: 892, likes: 450, format: '3MF', isPremium: true, imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=400' },
            { id: '1', slug: 'suporte-articulado-monitor-v2', title: 'Suporte Monitor V2', price: 0, is_free: true, downloads: 12400, likes: 3420, format: '3MF+STL', isPremium: false, imageUrl: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=400' },
            { id: '7', slug: 'braco-robotico-6-eixos', title: 'Braço Robótico 6 Eixos', price: 45.00, is_free: false, downloads: 1100, likes: 890, format: '3MF', isPremium: true, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400' },
            { id: '6', slug: 'turbina-jato-educacional', title: 'Turbina Jet-X Educacional', price: 25.00, is_free: false, downloads: 410, likes: 315, format: '3MF', isPremium: true, imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=400' },
        ],
        lab_notes: [
            { title: 'Como imprimir PETG perfeito para uso exterior', date: '2024-03-10', readTime: '8 min', img: 'https://images.unsplash.com/photo-1631541909061-71e34a49cebe?auto=format&fit=crop&q=80&w=400' },
            { title: 'Configurar perfis de Bambu Studio para multi-material', date: '2024-02-22', readTime: '12 min', img: 'https://images.unsplash.com/photo-1590422749895-d04b87c48508?auto=format&fit=crop&q=80&w=400' },
        ],
    },
    'MakerPro': {
        username: 'MakerPro',
        display_name: 'MakerPro Studio',
        avatar: 'https://i.pravatar.cc/150?u=maker',
        banner: 'https://images.unsplash.com/photo-1537724326059-2ea20251b9c8?auto=format&fit=crop&q=80&w=1600',
        bio: 'Engenheiro mecânico apaixonado por impressão 3D. Especializado em mecânica de precisão, engrenagens e componentes funcionais. Partilho tudo que aprendo na comunidade.',
        location: 'Porto, Portugal',
        joined: '2023-06-01',
        is_official: false,
        verified: true,
        followers: 1240,
        following: 380,
        total_downloads: 9800,
        total_models: 12,
        rating: 4.7,
        social: { instagram: '@makerprostudio' },
        tabs: ['Modelos', 'Sobre'],
        models: [
            { id: '3', slug: 'engrenagem-planetaria', title: 'Engrenagem Planetária Paramétrica', price: 0, is_free: true, downloads: 5100, likes: 1200, format: 'STL', isPremium: false, imageUrl: 'https://images.unsplash.com/photo-1537724326059-2ea20251b9c8?auto=format&fit=crop&q=80&w=400' },
        ],
    },
};

const DEFAULT_CREATOR = MOCK_CREATORS['DataFrontier_Lab'];

// ─── Official Hub Header ───────────────────────────────────────────────────
function OfficialHubHeader({ creator }: { creator: any }) {
    return (
        <div className="relative w-full overflow-hidden">
            {/* Banner */}
            <div className="relative h-64 md:h-80">
                <img src={creator.banner} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/20 via-[#2B2B2B]/50 to-[#2B2B2B]"></div>
            </div>

            {/* Subscription Banner */}
            <div className="relative bg-gradient-to-r from-[#3347FF] to-[#2236EE] py-3 px-4">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Zap size={16} className="text-yellow-300 shrink-0" />
                        <p className="text-white/90 text-sm font-medium">{creator.subscription_note}</p>
                    </div>
                    <button className="shrink-0 px-4 py-1.5 rounded-full text-xs font-black text-[#3347FF] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Ver Planos
                    </button>
                </div>
            </div>

            {/* Creator Info overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-[52px] flex items-end">
                <div className="container mx-auto px-4 md:px-8 pb-6">
                    <div className="flex items-end gap-5">
                        <div className="relative">
                            <img src={creator.avatar} alt={creator.display_name} className="w-20 h-20 rounded-2xl border-3 border-white shadow-xl object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3347FF] flex items-center justify-center shadow-md">
                                <Shield size={12} className="text-white" fill="currentColor" />
                            </div>
                        </div>
                        <div className="mb-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h1 className="text-3xl font-black text-white tracking-tight">{creator.display_name}</h1>
                                <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full bg-[#3347FF] text-white shadow-lg border border-white/20">
                                    ✦ STL PRIME OFICIAL
                                </span>
                            </div>
                            <p className="text-white/80 text-sm font-bold tracking-wide italic">{creator.team_role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Normal Creator Header ────────────────────────────────────────────────
function NormalHeader({ creator, isFollowing, onFollow, followLoading, showFollowButton }: {
    creator: any;
    isFollowing: boolean;
    onFollow: () => void;
    followLoading: boolean;
    showFollowButton: boolean;
}) {
    return (
        <div className="bg-white border-b border-gray-100">
            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img src={creator.banner} alt="" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="container mx-auto px-4 md:px-8 pb-6">
                <div className="flex items-end gap-4 -mt-10">
                    <img src={creator.avatar} alt="" className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover relative z-10" />
                    <div className="pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-black text-[#2B2B2B] tracking-tight">{creator.display_name}</h1>
                            {creator.verified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 size={10} /> Verificado
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm font-bold">@{creator.username}</p>
                    </div>
                    {showFollowButton && (
                        <button
                            onClick={onFollow}
                            disabled={followLoading}
                            className={`ml-auto mb-1 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md flex items-center gap-2 ${isFollowing
                                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 border border-gray-200'
                                : 'bg-[#3347FF] text-white hover:bg-[#2236ee]'
                                }`}
                        >
                            {isFollowing ? <><UserCheck size={15} /> Seguindo</> : <><UserPlus size={15} /> Seguir</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CreatorPage({ params }: { params: { username: string } }) {
    const supabase = createClient();
    const router = useRouter();
    const { addItem, openCart } = useCart();

    const [creator, setCreator] = useState<Creator | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Modelos');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchCreatorData = async () => {
            setLoading(true);

            // Get Creator Profile
            const { data: prof, error: profError } = await supabase
                .from('users')
                .select('*')
                .eq('username', params.username)
                .single();

            if (!prof || profError) {
                setLoading(false);
                return;
            }

            // Get Models
            const { data: mods } = await supabase
                .from('models')
                .select('*')
                .eq('author_id', prof.id)
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            // Calculate simple stats
            const totalDownloads = mods?.reduce((acc, m) => acc + (m.downloads_count || 0), 0) || 0;
            const totalModels = mods?.length || 0;

            // Calculate follower count
            const { count: followers } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', prof.id);
            setFollowerCount(followers || 0);

            // Check if current user follows this creator
            const { data: { user: currentU } } = await supabase.auth.getUser();
            setCurrentUser(currentU);
            if (currentU && currentU.id !== prof.id) {
                const { data: follow } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('follower_id', currentU.id)
                    .eq('following_id', prof.id)
                    .single();
                setIsFollowing(!!follow);
            }

            setCreator({
                ...prof,
                total_downloads: totalDownloads,
                total_models: totalModels,
                rating: 4.98,
                followers_count: followers || 0
            });
            setModels(mods || []);
            setLoading(false);
        };

        fetchCreatorData();
    }, [params.username]);

    const handleAddToCart = (model: Model) => {
        addItem({
            id: model.id,
            title: model.title,
            price: model.price,
            author_username: creator?.username || '',
            format: model.format,
            thumbnail_url: model.thumbnail_url
        });
        openCart();
    };

    const handleFollow = async () => {
        if (!currentUser || !creator) return;
        setFollowLoading(true);
        if (isFollowing) {
            await supabase.from('follows').delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', creator.id);
            setIsFollowing(false);
            setFollowerCount(c => c - 1);
        } else {
            await supabase.from('follows').insert({
                follower_id: currentUser.id,
                following_id: creator.id
            });
            setIsFollowing(true);
            setFollowerCount(c => c + 1);
        }
        setFollowLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
                <div className="text-gray-400 font-bold animate-pulse">Carregando perfil...</div>
            </div>
        );
    }

    if (!creator) return notFound();

    const isOfficial = creator.is_creator; // Or use another flag if needed
    const tabs = isOfficial ? ['Modelos', 'Coleções', 'Lab Notes', 'Sobre'] : ['Modelos', 'Sobre'];


    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Back nav */}
            <div className={`sticky top-0 z-50 flex items-center gap-3 px-4 h-14 ${isOfficial ? 'bg-[#2B2B2B]/95 backdrop-blur-xl border-b border-white/10' : 'bg-white/90 backdrop-blur-xl border-b border-gray-100'}`}>
                <Link href="/" className={`${isOfficial ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-[#2B2B2B]'} transition-colors`}>
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className={`text-sm font-bold ${isOfficial ? 'text-white' : 'text-[#2B2B2B]'}`}>{creator.full_name}</span>
                {isOfficial && (
                    <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#3347FF] text-white">✦ OFICIAL</span>
                )}
            </div>

            {/* Header */}
            {isOfficial ? (
                <div className="relative w-full overflow-hidden">
                    <div className="relative h-64 md:h-80 bg-[#1a1a1a]">
                        {/* Fallback color if no banner */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/20 via-[#2B2B2B]/50 to-[#2B2B2B]"></div>
                    </div>
                    <div className="relative bg-gradient-to-r from-[#3347FF] to-[#2236EE] py-3 px-4">
                        <div className="container mx-auto flex items-center justify-between gap-4">
                            <p className="text-white/90 text-sm font-medium">Modelos premium incluídos na STL Prime Subscription.</p>
                            <button className="shrink-0 px-4 py-1.5 rounded-full text-xs font-black text-[#3347FF] bg-white hover:bg-gray-50 transition-colors">Ver Planos</button>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 bottom-[52px] flex items-end">
                        <div className="container mx-auto px-4 md:px-8 pb-6">
                            <div className="flex items-end gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl border-3 border-white shadow-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {creator.avatar_url ? <img src={creator.avatar_url} className="w-full h-full object-cover" /> : <User className="text-gray-400" />}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3347FF] flex items-center justify-center shadow-md">
                                        <Shield size={12} className="text-white" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-3xl font-black text-white tracking-tight">{creator.full_name}</h1>
                                    <p className="text-white/80 text-sm font-bold italic">@{creator.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border-b border-gray-100">
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200" />
                    <div className="container mx-auto px-4 md:px-8 pb-6">
                        <div className="flex items-end gap-4 -mt-10">
                            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden relative z-10">
                                {creator.avatar_url ? <img src={creator.avatar_url} className="w-full h-full object-cover" /> : <User className="text-gray-400" />}
                            </div>
                            <div className="pb-1">
                                <h1 className="text-2xl font-black text-[#2B2B2B] tracking-tight">{creator.full_name}</h1>
                                <p className="text-gray-600 text-sm font-bold">@{creator.username}</p>
                            </div>
                            {currentUser && currentUser.id !== creator.id && (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`ml-auto mb-1 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md flex items-center gap-2 ${isFollowing
                                        ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 border border-gray-200'
                                        : 'bg-[#3347FF] text-white hover:bg-[#2236ee]'
                                        }`}
                                >
                                    {isFollowing ? <><UserCheck size={15} /> Seguindo</> : <><UserPlus size={15} /> Seguir</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`container mx-auto px-4 md:px-8 py-8 ${isOfficial ? '' : 'max-w-5xl'}`}>
                <div className={`grid gap-8 ${isOfficial ? 'md:grid-cols-[1fr_300px]' : 'md:grid-cols-[1fr_280px]'} items-start`}>


                    {/* Left — Tabs + Content */}
                    <div>
                        {/* Bio (for normal creators, show here) */}
                        {!isOfficial && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Sobre o Criador</h3>
                                <p className="text-gray-700 text-sm leading-relaxed font-bold">{creator.bio}</p>
                                <div className="flex items-center gap-4 mt-5 text-[11px] text-gray-500 font-black flex-wrap uppercase tracking-tight">
                                    {creator.location && <span className="flex items-center gap-1"><MapPin size={12} /> {creator.location}</span>}
                                    <span className="flex items-center gap-1"><Calendar size={12} /> Membro desde {new Date(creator.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        )}


                        {/* Tabs Navigation */}
                        <div className={`flex gap-1 rounded-xl p-1 mb-6 w-fit ${isOfficial ? 'bg-white/10' : 'bg-gray-100'}`}>
                            {tabs.map((tab: string) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? isOfficial
                                            ? 'bg-[#3347FF] text-white shadow-md'
                                            : 'bg-white shadow-sm text-[#2B2B2B]'
                                        : isOfficial
                                            ? 'text-white/60 hover:text-white'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>


                        {/* Models Tab */}
                        {activeTab === 'Modelos' && (
                            <div className="grid sm:grid-cols-2 gap-5">
                                {models.map((model) => (
                                    <div key={model.id} className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${isOfficial ? 'bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-white/10 hover:border-[#3347FF]/40' : 'bg-white border-gray-100 hover:border-[#3347FF]/30'}`}>
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            <img src={model.thumbnail_url} alt={model.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black text-gray-700">{model.format}</div>
                                        </div>
                                        <div className="p-4">
                                            <Link href={`/models/${model.slug}`}>
                                                <h3 className={`font-bold text-sm leading-tight mb-3 group-hover:text-[#3347FF] transition-colors cursor-pointer ${isOfficial ? 'text-white' : 'text-[#2B2B2B]'}`}>
                                                    {model.title}
                                                </h3>
                                            </Link>
                                            <div className={`flex items-center justify-between`}>
                                                <span className={`font-black ${model.price === 0 ? 'text-green-400' : isOfficial ? 'text-white' : 'text-[#2B2B2B]'}`}>
                                                    {model.price === 0 ? 'Grátis' : `R$ ${model.price.toFixed(2)}`}
                                                </span>
                                                <button
                                                    onClick={() => handleAddToCart(model)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isOfficial ? 'bg-[#3347FF] text-white hover:bg-[#2236ee]' : 'bg-gray-100 text-gray-700 hover:bg-[#3347FF] hover:text-white'}`}
                                                >
                                                    <ShoppingCart size={12} /> {model.price === 0 ? 'Baixar' : 'Carrinho'}
                                                </button>
                                            </div>
                                            <div className={`flex items-center gap-3 mt-3 text-xs font-black ${isOfficial ? 'text-white/60' : 'text-gray-500'}`}>
                                                <span className="flex items-center gap-1"><Download size={11} /> {model.downloads_count.toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><Heart size={11} /> {model.likes_count.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Lab Notes Tab (Official only) */}
                        {activeTab === 'Lab Notes' && isOfficial && (
                            <div className="space-y-4">
                                <p className={`text-sm font-medium mb-6 ${isOfficial ? 'text-white/60' : 'text-gray-500'}`}>
                                    Artigos e tutoriais técnicos escritos pela equipa da Data Frontier.
                                </p>
                                <div className={`rounded-2xl border p-8 text-center ${isOfficial ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                                    <BookOpen size={36} className={`mx-auto mb-3 ${isOfficial ? 'text-white/20' : 'text-gray-300'}`} />
                                    <p className={`font-bold ${isOfficial ? 'text-white/40' : 'text-gray-400'}`}>Notas de laboratório em breve</p>
                                </div>
                            </div>
                        )}

                        {/* Sobre Tab */}
                        {activeTab === 'Sobre' && (
                            <div className={`rounded-2xl border p-6 ${isOfficial ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                                <p className={`leading-relaxed font-medium ${isOfficial ? 'text-white/80' : 'text-gray-600'}`}>{creator.bio}</p>
                                <div className={`mt-6 space-y-3 text-sm font-medium ${isOfficial ? 'text-white/60' : 'text-gray-500'}`}>
                                    {creator.location && <p className="flex items-center gap-2"><MapPin size={14} /> {creator.location}</p>}
                                    <p className="flex items-center gap-2"><Calendar size={14} /> Membro desde {new Date(creator.created_at).getFullYear()}</p>
                                    {creator.social?.website && (
                                        <a href={creator.social.website} className="flex items-center gap-2 text-[#3347FF] hover:underline">
                                            <ExternalLink size={14} /> {creator.social.website}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Coleções Tab */}
                        {activeTab === 'Coleções' && (
                            <div className={`rounded-2xl border p-8 text-center ${isOfficial ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                                <Layers size={36} className={`mx-auto mb-3 ${isOfficial ? 'text-white/20' : 'text-gray-300'}`} />
                                <p className={`font-bold ${isOfficial ? 'text-white/40' : 'text-gray-400'}`}>Coleções em breve</p>
                            </div>
                        )}

                    </div>

                    {/* Right Sidebar — Stats */}
                    <div className="space-y-4">
                        {/* Stats Card */}
                        <div className={`rounded-2xl border p-5 ${isOfficial ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isOfficial ? 'text-white/60' : 'text-gray-400'}`}>Estatísticas</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Seguidores', value: creator.followers_count?.toLocaleString('pt-BR') || '0', icon: Users },
                                    { label: 'Downloads', value: creator.total_downloads?.toLocaleString('pt-BR') || '0', icon: Download },
                                    { label: 'Modelos', value: creator.total_models || 0, icon: Package },
                                    { label: 'Rating', value: `${creator.rating} ★`, icon: Star },
                                ].map((stat, i) => (
                                    <div key={i} className={`p-4 rounded-xl text-center transition-all ${isOfficial ? 'bg-[#3347FF] shadow-[0_4px_20px_rgba(51,71,255,0.3)] border border-white/20' : 'bg-gray-50 border border-gray-100 shadow-sm'}`}>
                                        <p className={`text-2xl font-black leading-none ${isOfficial ? 'text-white' : 'text-[#2B2B2B]'}`}>{stat.value}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isOfficial ? 'text-white' : 'text-gray-700'}`}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Follow button */}
                        <button className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${isOfficial ? 'bg-[#3347FF] text-white hover:bg-[#2236ee] shadow-lg shadow-[#3347FF]/25' : 'bg-[#2B2B2B] text-white hover:bg-black'}`}>
                            Seguir {creator.full_name}
                        </button>

                        {/* Official badge card */}
                        {isOfficial && (
                            <div className="rounded-2xl bg-gradient-to-br from-[#3347FF]/20 to-[#3347FF]/5 border border-[#3347FF]/20 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3347FF] flex items-center justify-center">
                                        <Award size={16} className="text-white" />
                                    </div>
                                    <p className="text-white font-black text-sm">Criador Verificado STL Prime</p>
                                </div>
                                <p className="text-white/60 text-xs leading-relaxed">Todos os designs passam por revisão de qualidade e testes em impressoras reais pela equipa da Data Frontier.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
