"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
    ArrowLeft, ShoppingCart, Download, Heart, Bookmark, Share2,
    Star, ChevronLeft, ChevronRight, Package, FileText, Printer,
    CheckCircle2, Layers, Clock, Eye, Shield, VerifiedIcon, Zap, Users,
    MessageSquare, ExternalLink, User, FolderPlus, Folder, Plus, X
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    format: string;
    thumbnail_url: string;
    gallery_urls: string[];
    author_id: string;
    category_id: string;
    downloads_count: number;
    likes_count: number;
    is_published: boolean;
    specs: {
        dimensions?: string;
        weight_file?: string;
        compatibility?: string[];
        license?: string;
    };
    files_list: Array<{
        name: string;
        size: string;
        format: string;
    }>;
    created_at: string;
    author: {
        username: string;
        full_name: string;
        avatar_url: string;
        is_creator: boolean;
        subscription_status?: string;
    };
    category?: {
        name: string;
    };
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    print_photo_url?: string;
    created_at: string;
    author: {
        full_name: string;
        avatar_url: string;
    };
}

// ─── Simple Markdown renderer ─────────────────────────────────────────────
function SimpleMarkdown({ text }: { text: string }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black text-[#2B2B2B] mt-6 mb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-[#2B2B2B] mb-3">{line.replace('# ', '')}</h1>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-sm leading-6 text-gray-600">{line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
                if (line.trim() === '') return <br key={i} />;
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={i} className="text-sm leading-7 text-gray-600" dangerouslySetInnerHTML={{ __html: formatted }} />;
            })}
        </div>
    );
}

// ─── Page Component ────────────────────────────────────────────────────────
export default function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const router = useRouter();
    const { addItem, openCart } = useCart();
    const [user, setUser] = useState<any>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [linkedPost, setLinkedPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [activeImage, setActiveImage] = useState(0);
    const [wishlisted, setWishlisted] = useState(false);
    const [activeSection, setActiveSection] = useState<'description' | 'files' | 'specs' | 'discussion'>('description');
    const [newComment, setNewComment] = useState('');

    // Collections states
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [userCollections, setUserCollections] = useState<any[]>([]);
    const [savingToCollection, setSavingToCollection] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [subTier, setSubTier] = useState<string | null>(null);
    const [isCreatingNewCollection, setIsCreatingNewCollection] = useState(false);
    const [newCollName, setNewCollName] = useState('');

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: sessionData } = await supabase.auth.getSession();
            setUser(sessionData.session?.user || null);

            // Fetch Product
            const { data: prodData } = await supabase
                .from('models')
                .select(`
                    *,
                    author:users!models_author_id_fkey (
                        username,
                        full_name,
                        avatar_url,
                        is_creator,
                        subscription_status
                    ),
                    category:categories (name)
                `)
                .eq('slug', params.slug)
                .single();

            if (!prodData) {
                setLoading(false);
                return;
            }

            setProduct(prodData as any);

            // Fetch Reviews
            const { data: reviewsData } = await supabase
                .from('reviews')
                .select(`
                        rating,
                        comment,
                        created_at,
                        author:users (full_name, avatar_url)
                    `)
                .eq('model_id', prodData.id)
                .order('created_at', { ascending: false });
            if (reviewsData) setReviews(reviewsData as any);

            if (sessionData.session?.user) {
                // Fetch wishlisted status
                const { data: wishData } = await supabase
                    .from('likes')
                    .select('created_at')
                    .eq('model_id', prodData.id)
                    .eq('user_id', sessionData.session.user.id)
                    .single();
                if (wishData) setWishlisted(true);

                // Check Access
                if (prodData.is_free) {
                    setHasAccess(true);
                } else {
                    const { data: profile } = await supabase.from('users').select('subscription_status').eq('id', sessionData.session.user.id).single();
                    if (profile?.subscription_status) {
                        setSubTier(profile.subscription_status);
                    }
                    if (profile?.subscription_status === 'pro' || profile?.subscription_status === 'premium') {
                        setHasAccess(true);
                    } else {
                        const { data: purchase } = await supabase.from('purchases').select('id').eq('user_id', sessionData.session.user.id).eq('model_id', prodData.id).single();
                        if (purchase) setHasAccess(true);
                    }
                }
            } else if (prodData.is_free) {
                setHasAccess(true);
            }

            // Fetch Linked Community Post
            const { data: postData } = await supabase
                .from('posts')
                .select('title, slug')
                .eq('model_id', prodData.id)
                .limit(1)
                .single();

            if (postData) setLinkedPost(postData);

            setLoading(false);
        };
        init();
    }, [params.slug]);

    const handleAddToCart = () => {
        if (!product) return;

        let finalPrice = product.price;
        if (subTier === 'pro') finalPrice = product.price * 0.8;
        if (subTier === 'premium') finalPrice = product.price * 0.5;

        addItem({
            id: product.id,
            title: product.title,
            price: finalPrice,
            author_username: product.author.username,
            format: product.format,
            thumbnail_url: product.thumbnail_url,
        });
        openCart();
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !product || !newComment.trim()) return;

        const { error } = await supabase.from('reviews').insert({
            model_id: product.id,
            user_id: user.id,
            rating: 5, // Default for now
            comment: newComment
        });

        if (error) {
            alert("Erro ao publicar: " + error.message);
        } else {
            setNewComment('');
            // Refresh
            const { data } = await supabase
                .from('reviews')
                .select(`*, author:users (full_name, avatar_url)`)
                .eq('model_id', product.id)
                .order('created_at', { ascending: false });
            if (data) setReviews(data as any);
        }
    };

    const openCollectionModal = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setIsCollectionModalOpen(true);
        const { data } = await supabase.from('collections').select('*').order('name');
        if (data) setUserCollections(data);
    };

    const addToCollection = async (collectionId: string) => {
        if (!product) return;
        setSavingToCollection(collectionId);

        const { error } = await supabase
            .from('collection_items')
            .insert({ collection_id: collectionId, model_id: product.id });

        if (error && error.code !== '23505') { // Ignore unique constraint error (already in collection)
            alert("Erro ao salvar: " + error.message);
        } else {
            // Success
            setTimeout(() => {
                setIsCollectionModalOpen(false);
                setSavingToCollection(null);
            }, 600);
        }
    };

    const createAndAddCollection = async () => {
        if (!newCollName.trim() || !user || !product) return;

        const { data, error } = await supabase
            .from('collections')
            .insert({ user_id: user.id, name: newCollName })
            .select()
            .single();

        if (data) {
            await addToCollection(data.id);
            setNewCollName('');
            setIsCreatingNewCollection(false);
        }
    };

    const handleDownload = async () => {
        if (!product || !user) {
            router.push('/auth/login');
            return;
        }
        setDownloading(true);
        try {
            const res = await fetch(`/api/models/${product.id}/download`);
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Erro ao baixar modelo');
            } else if (data.files && data.files.length > 0) {
                // Emulate downloading multiple files
                data.files.forEach((file: any) => {
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.download = file.name;
                    a.target = '_blank';
                    // Trigger download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                alert('Download iniciado!');
            }
        } catch (err) {
            console.error('Download error', err);
            alert('Erro inesperado ao baixar.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
                <div className="text-gray-400 font-bold animate-pulse">Carregando produto...</div>
            </div>
        );
    }

    if (!product) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* ── Navbar mini ─────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-[#2B2B2B] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 font-medium">
                        <Link href="/" className="hover:text-[#3347FF]">Catálogo</Link>
                        <span>/</span>
                        <span className="text-[#2B2B2B] font-bold truncate max-w-xs">{product.title}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <button
                            onClick={openCollectionModal}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#3347FF]/10 text-gray-600 hover:text-[#3347FF] border border-gray-100 rounded-xl font-bold text-xs transition-all uppercase tracking-widest"
                        >
                            <Bookmark className="w-4 h-4" />
                            Salvar
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#3347FF] hover:bg-gray-100 rounded-full transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setWishlisted(!wishlisted)}
                            className={`p-2 rounded-full transition-all ${wishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-gray-100'}`}
                        >
                            <Heart className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 md:px-8 py-10">
                <div className="grid md:grid-cols-[1fr_380px] gap-10 items-start">

                    {/* ── Left Column ───────────────────── */}
                    <div>
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-gray-200 mb-3 shadow-lg group">
                                <img
                                    src={[product.thumbnail_url, ...(product.gallery_urls || [])][activeImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                                {[product.thumbnail_url, ...(product.gallery_urls || [])].length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => setActiveImage(i => Math.min([product.thumbnail_url, ...(product.gallery_urls || [])].length - 1, i + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {[product.thumbnail_url, ...(product.gallery_urls || [])].length > 1 && (
                                <div className="flex gap-3">
                                    {[product.thumbnail_url, ...(product.gallery_urls || [])].map((img: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#3347FF] shadow-md' : 'border-transparent opacity-60 hover:opacity-80'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Author */}
                        <div className="mb-6">
                            <h1 className="text-4xl font-black text-[#2B2B2B] mb-3 leading-tight tracking-tight">{product.title}</h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <Link href={`/creator/${product.author.username}`} className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {product.author.avatar_url ? (
                                            <img src={product.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} className="text-gray-400" />
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#3347FF] transition-colors">{product.author.full_name}</span>
                                    {product.author.is_creator && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#3347FF] text-white">
                                            ✦ OFICIAL
                                        </span>
                                    )}
                                </Link>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-bold">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-[#2B2B2B]">5.0</span>
                                    <span className="text-gray-400 font-medium">({reviews.length} avaliações)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-bold">
                                    <Download size={14} /> {product.downloads_count.toLocaleString('pt-BR')} <span className="text-gray-400 font-medium">downloads</span>
                                </div>
                            </div>
                        </div>

                        {/* Section Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                            {[
                                { id: 'description', label: 'Descrição & Notas', icon: FileText },
                                { id: 'files', label: `Ficheiros`, icon: Layers },
                                { id: 'specs', label: 'Especificações', icon: Printer },
                                { id: 'discussion', label: 'Discussão', icon: MessageSquare },
                            ].map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${activeSection === s.id ? 'bg-white shadow-md text-[#3347FF]' : 'text-gray-600 hover:text-[#2B2B2B]'}`}
                                >
                                    <s.icon size={14} />
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Section Content */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            {activeSection === 'description' && (
                                <SimpleMarkdown text={product.description} />
                            )}
                            {activeSection === 'files' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500 font-medium mb-4">Ficheiros incluídos neste produto:</p>
                                    {product.files_list?.length > 0 ? product.files_list.map((file, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-[#3347FF]/10 flex items-center justify-center">
                                                <FileText size={18} className="text-[#3347FF]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-[#2B2B2B] text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{file.format} · {file.size}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400">Nenhum ficheiro listado.</p>
                                    )}
                                </div>
                            )}
                            {activeSection === 'specs' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Dimensões</p>
                                            <p className="font-black text-[#2B2B2B]">{product.specs?.dimensions || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Tamanho dos Ficheiros</p>
                                            <p className="font-black text-[#2B2B2B]">{product.specs?.weight_file || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 col-span-2 border border-gray-100">
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Licença</p>
                                            <p className="font-black text-[#2B2B2B]">{product.specs?.license || 'Licença Padrão STL Prime'}</p>
                                        </div>
                                    </div>
                                    {product.specs?.compatibility && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Impressoras Testadas</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.specs.compatibility.map((c) => (
                                                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
                                                        <CheckCircle2 size={13} className="text-green-500" />
                                                        <span className="text-xs font-bold text-green-700">{c}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeSection === 'discussion' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-black text-[#2B2B2B]">Comentários ({reviews.length})</h4>
                                    </div>

                                    {/* Link to Community */}
                                    {linkedPost && (
                                        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#3347FF]/5 to-transparent border border-[#3347FF]/10 flex items-center justify-between gap-4 mb-8">
                                            <div>
                                                <p className="text-sm font-black text-[#3347FF] mb-1">Este modelo tem um tópico na Comunidade!</p>
                                                <p className="text-xs text-gray-500 font-medium">{linkedPost.title}</p>
                                            </div>
                                            <Link href={`/community/${linkedPost.slug}`} className="shrink-0 px-4 py-2 rounded-xl bg-white text-[#3347FF] text-xs font-black shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-2">
                                                Ver Post <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Real Reviews */}
                                    {reviews.length === 0 ? (
                                        <p className="text-gray-400 font-bold text-center py-10">Seja o primeiro a comentar!</p>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0">
                                                <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {rev.author.avatar_url ? (
                                                        <img src={rev.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={18} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-[#2B2B2B]">{rev.author.full_name}</span>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={10} className={i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{rev.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <form onSubmit={handleReviewSubmit} className="pt-4">
                                        <textarea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Escreva um comentário..."
                                            className="w-full p-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#3347FF] text-sm font-medium outline-none transition-all min-h-[100px]"
                                        />
                                        <button
                                            type="submit"
                                            className="mt-3 px-6 py-2.5 rounded-xl bg-[#3347FF] text-white text-sm font-black shadow-md hover:bg-[#2236ee] transition-all"
                                        >
                                            Publicar Comentário
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Related Models Placeholder */}
                        <div className="mt-12">
                            <h3 className="text-xl font-black text-[#2B2B2B] mb-5">Mais do Criador</h3>
                            <p className="text-sm text-gray-400 italic">Em breve você poderá ver outros modelos deste criador aqui.</p>
                        </div>
                    </div>

                    {/* ── Right Sidebar (Sticky) ─────────── */}
                    <div className="sticky top-24">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                            {/* Price Header */}
                            <div className="p-6 pb-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex flex-col">
                                        {(subTier === 'pro' || subTier === 'premium') && product.price > 0 && (
                                            <span className="text-sm text-gray-400 line-through font-bold">
                                                R$ {product.price.toFixed(2)}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-4xl font-black" style={{ color: product.price === 0 ? '#10B981' : '#2B2B2B' }}>
                                                {product.price === 0 ? 'Grátis' : (
                                                    `R$ ${(subTier === 'pro' ? product.price * 0.8 : subTier === 'premium' ? product.price * 0.5 : product.price).toFixed(2)}`
                                                )}
                                            </span>
                                            {(subTier === 'pro' || subTier === 'premium') && product.price > 0 && (
                                                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#3347FF]/10 text-[#3347FF]">
                                                    {subTier === 'pro' ? '-20%' : '-50%'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 uppercase shadow-sm border border-gray-200">{product.format}</span>
                                </div>
                                <p className="text-xs text-gray-500 font-bold">Licença pessoal</p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="p-6 space-y-3">
                                {hasAccess ? (
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="w-full py-4 rounded-2xl bg-green-600 text-white font-black text-base hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 disabled:opacity-50"
                                    >
                                        <Download size={18} /> {downloading ? 'Processando...' : 'Baixar Arquivos'}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full py-4 rounded-2xl bg-[#3347FF] text-white font-black text-base hover:bg-[#2236ee] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#3347FF]/25 hover:-translate-y-0.5 transform duration-200"
                                        >
                                            <ShoppingCart size={18} /> Adicionar ao Carrinho
                                        </button>
                                        <button className="w-full py-3.5 rounded-2xl border-2 border-[#3347FF] text-[#3347FF] font-bold text-sm hover:bg-[#3347FF]/5 transition-colors flex items-center justify-center gap-2">
                                            Comprar Agora
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setWishlisted(!wishlisted)}
                                    className={`w-full py-3 rounded-2xl border border-gray-200 text-sm font-bold flex items-center justify-center gap-2 transition-all ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'text-gray-500 hover:border-gray-300'}`}
                                >
                                    <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
                                    {wishlisted ? 'Na Wishlist' : 'Adicionar à Wishlist'}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="px-6 pb-6 space-y-2.5">
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                    <Shield size={14} className="text-green-500 shrink-0" />
                                    <span>Download seguro e garantido</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                    <CheckCircle2 size={14} className="text-[#3347FF] shrink-0" />
                                    <span>Testado em impressoras reais</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                    <Zap size={14} className="text-yellow-500 shrink-0" />
                                    <span>Disponível imediatamente após compra</span>
                                </div>
                            </div>

                            {/* Author Card */}
                            <div className="p-4 mx-4 mb-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <Link href={`/creator/${product.author.username}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {product.author.avatar_url ? (
                                            <img src={product.author.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#2B2B2B] group-hover:text-[#3347FF] transition-colors">{product.author.full_name}</p>
                                        <p className="text-xs text-gray-400 font-medium">@{product.author.username}</p>
                                    </div>
                                    {product.author.is_creator && (
                                        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-[#3347FF] text-white">✦ PRO</span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collection Modal */}
            {isCollectionModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#2B2B2B]/40 backdrop-blur-sm" onClick={() => setIsCollectionModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-[#2B2B2B]">Salvar na Coleção</h2>
                                <button onClick={() => setIsCollectionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                                {userCollections.map(coll => (
                                    <button
                                        key={coll.id}
                                        onClick={() => addToCollection(coll.id)}
                                        disabled={savingToCollection !== null}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${savingToCollection === coll.id ? 'bg-[#3347FF] border-[#3347FF] text-white' : 'bg-gray-50 border-transparent hover:border-[#3347FF]/20 hover:bg-white text-gray-700'}`}
                                    >
                                        <Folder size={18} className={savingToCollection === coll.id ? 'text-white' : 'text-gray-400'} />
                                        <span className="flex-1 text-left font-bold text-sm truncate">{coll.name}</span>
                                        {savingToCollection === coll.id && (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {isCreatingNewCollection ? (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                    <input
                                        autoFocus
                                        value={newCollName}
                                        onChange={e => setNewCollName(e.target.value)}
                                        placeholder="Nome da nova pasta..."
                                        className="w-full bg-gray-50 border-2 border-[#3347FF]/20 focus:border-[#3347FF] p-3 rounded-xl outline-none transition-all font-bold text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsCreatingNewCollection(false)} className="flex-1 py-2 text-xs font-black text-gray-500 bg-gray-100 rounded-xl">Cancelar</button>
                                        <button onClick={createAndAddCollection} className="flex-1 py-2 text-xs font-black text-white bg-[#3347FF] rounded-xl">Criar e Salvar</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreatingNewCollection(true)}
                                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-[#3347FF] hover:border-[#3347FF]/40 transition-all font-black text-xs uppercase"
                                >
                                    <Plus size={16} /> Nova Coleção
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


