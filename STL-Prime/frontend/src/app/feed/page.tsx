"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, UserPlus, UserCheck, Package, MessageSquare, Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';

interface ActivityItem {
    id: string;
    type: 'new_model' | 'new_post';
    actorName: string;
    actorAvatar: string;
    actorUsername: string;
    actorSubscription: string;
    actorJoinedAt: string;
    title: string;
    link: string;
    thumbnail?: string;
    created_at: string;
}

export default function ActivityFeedPage() {
    const supabase = createClient();
    const [feed, setFeed] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [followingIds, setFollowingIds] = useState<string[]>([]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) { setLoading(false); return; }

            // Get list of creators the user follows
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            const ids = follows?.map(f => f.following_id) ?? [];
            setFollowingIds(ids);

            if (ids.length === 0) { setLoading(false); return; }

            // Fetch recent models from followed creators
            const { data: models } = await supabase
                .from('models')
                .select(`
                    id, title, slug, created_at, thumbnail_url,
                    author:users!models_author_id_fkey (
                        id, full_name, username, avatar_url, subscription_status, created_at
                    )
                `)
                .in('author_id', ids)
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(20);

            // Fetch recent posts from followed creators
            const { data: posts } = await supabase
                .from('posts')
                .select(`
                    id, title, slug, created_at,
                    author:users!posts_author_id_fkey (
                        id, full_name, username, avatar_url, subscription_status, created_at
                    )
                `)
                .in('author_id', ids)
                .order('created_at', { ascending: false })
                .limit(20);

            const modelItems: ActivityItem[] = (models ?? []).map((m: any) => ({
                id: m.id,
                type: 'new_model',
                actorName: m.author?.full_name ?? 'Criador',
                actorAvatar: m.author?.avatar_url ?? '',
                actorUsername: m.author?.username ?? '',
                actorSubscription: m.author?.subscription_status ?? 'free',
                actorJoinedAt: m.author?.created_at ?? '',
                title: m.title,
                link: `/models/${m.slug}`,
                thumbnail: m.thumbnail_url,
                created_at: m.created_at,
            }));

            const postItems: ActivityItem[] = (posts ?? []).map((p: any) => ({
                id: p.id,
                type: 'new_post',
                actorName: p.author?.full_name ?? 'Criador',
                actorAvatar: p.author?.avatar_url ?? '',
                actorUsername: p.author?.username ?? '',
                actorSubscription: p.author?.subscription_status ?? 'free',
                actorJoinedAt: p.author?.created_at ?? '',
                title: p.title,
                link: `/community/${p.slug}`,
                created_at: p.created_at,
            }));

            // Merge and sort by date
            const merged = [...modelItems, ...postItems].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setFeed(merged);
            setLoading(false);
        };
        init();
    }, []);

    const toggleFollow = async (creatorId: string) => {
        if (!user) return;

        const isFollowing = followingIds.includes(creatorId);
        if (isFollowing) {
            await supabase.from('follows').delete()
                .eq('follower_id', user.id).eq('following_id', creatorId);
            setFollowingIds(prev => prev.filter(id => id !== creatorId));
        } else {
            await supabase.from('follows').insert({ follower_id: user.id, following_id: creatorId });
            setFollowingIds(prev => [...prev, creatorId]);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6] py-10">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Header */}
                <div className="flex items-center gap-3 mb-10">
                    <Link href="/" className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-[#3347FF] transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-[#2B2B2B] tracking-tight">Atividades</h1>
                        <p className="text-sm font-medium text-gray-400">Novidades dos criadores que você segue</p>
                    </div>
                </div>

                {/* Login gate */}
                {!user ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <Bell className="mx-auto mb-4 text-gray-300" size={48} />
                        <h2 className="text-xl font-black text-[#2B2B2B] mb-2">Entre para ver as atividades</h2>
                        <p className="text-gray-400 font-medium mb-6">Siga criadores para ver seus novos modelos e posts aqui.</p>
                        <Link href="/auth/login" className="px-8 py-3 bg-[#3347FF] text-white font-black rounded-2xl hover:bg-[#2236EE] transition-all">
                            Fazer Login
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : followingIds.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="text-5xl mb-4">🎨</div>
                        <h2 className="text-xl font-black text-[#2B2B2B] mb-2">Você ainda não segue ninguém</h2>
                        <p className="text-gray-400 font-medium mb-6">Explore o catálogo e siga criadores para ver suas novidades aqui.</p>
                        <Link href="/" className="px-8 py-3 bg-[#3347FF] text-white font-black rounded-2xl hover:bg-[#2236EE] transition-all">
                            Explorar Criadores
                        </Link>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="text-5xl mb-4">⏳</div>
                        <h2 className="text-xl font-black text-[#2B2B2B] mb-2">Tudo em silêncio por enquanto</h2>
                        <p className="text-gray-400 font-medium">Os criadores que você segue ainda não publicaram nada recente.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feed.map(item => (
                            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="p-5 flex gap-4">
                                    {/* Actor */}
                                    <Link href={`/creator/${item.actorUsername}`} className="shrink-0">
                                        <div className="w-11 h-11 rounded-2xl bg-gray-100 overflow-hidden">
                                            {item.actorAvatar ? (
                                                <img src={item.actorAvatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-gray-400 m-auto mt-2.5" />
                                            )}
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <Link href={`/creator/${item.actorUsername}`} className="font-black text-sm text-[#2B2B2B] hover:text-[#3347FF] transition-colors">
                                                {item.actorName}
                                            </Link>
                                            <SubscriptionBadge
                                                status={item.actorSubscription}
                                                joinedAt={item.actorJoinedAt}
                                                size="sm"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium mb-2">
                                            {item.type === 'new_model' ? (
                                                <span className="flex items-center gap-1"><Package size={11} /> Publicou um novo modelo</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><MessageSquare size={11} /> Criou um post na comunidade</span>
                                            )}
                                        </p>
                                        <Link href={item.link} className="font-bold text-[#2B2B2B] hover:text-[#3347FF] transition-colors text-sm leading-tight line-clamp-2">
                                            {item.title}
                                        </Link>
                                        <p className="text-[10px] text-gray-300 font-medium mt-1.5">
                                            {new Date(item.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>

                                    {/* Thumbnail */}
                                    {item.thumbnail && (
                                        <Link href={item.link} className="shrink-0">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                                                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
