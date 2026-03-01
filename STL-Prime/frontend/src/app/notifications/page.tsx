"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, User, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const TYPE_ICONS: Record<string, string> = {
    new_follower: '👤',
    new_comment: '💬',
    new_model: '📦',
    purchase: '🛒',
};

const TYPE_LABELS: Record<string, string> = {
    new_follower: 'Novo seguidor',
    new_comment: 'Novo comentário',
    new_model: 'Modelo publicado',
    purchase: 'Compra realizada',
};

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAllRead, markRead } = useNotifications();

    return (
        <div className="min-h-screen bg-[#F9F8F6] py-12">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-[#3347FF] transition-all">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-[#2B2B2B] tracking-tight flex items-center gap-2">
                                <Bell size={20} className="text-[#3347FF]" />
                                Notificações
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-[#3347FF] text-white text-[10px] font-black rounded-full">
                                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-gray-400 font-medium">Suas últimas atividades e atualizações</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-2xl text-[#3347FF] text-xs font-black uppercase tracking-widest hover:shadow-md transition-all"
                        >
                            <CheckCheck size={14} /> Marcar todas como lidas
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="text-5xl mb-4">🔔</div>
                        <h2 className="text-xl font-black text-[#2B2B2B] mb-2">Tudo certo!</h2>
                        <p className="text-gray-400 font-medium">Você está em dia com todas as novidades.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Group by date */}
                        {(() => {
                            const today = new Date().toDateString();
                            const yesterday = new Date(Date.now() - 86400000).toDateString();
                            let lastGroup = '';

                            return notifications.map(n => {
                                const notifDate = new Date(n.created_at).toDateString();
                                let groupLabel = '';
                                if (notifDate !== lastGroup) {
                                    lastGroup = notifDate;
                                    if (notifDate === today) groupLabel = 'Hoje';
                                    else if (notifDate === yesterday) groupLabel = 'Ontem';
                                    else groupLabel = new Date(n.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
                                }

                                return (
                                    <React.Fragment key={n.id}>
                                        {groupLabel && (
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 pb-1 px-1">{groupLabel}</p>
                                        )}
                                        <Link
                                            href={n.link || '#'}
                                            onClick={() => markRead(n.id)}
                                            className={`flex items-start gap-4 p-5 rounded-3xl border transition-all hover:shadow-md group ${!n.is_read ? 'bg-white border-[#3347FF]/10 shadow-sm' : 'bg-white/60 border-gray-100'}`}
                                        >
                                            {/* Actor avatar with type emoji */}
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {n.actor?.avatar_url ? (
                                                        <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-1.5 -right-1.5 text-lg leading-none drop-shadow-sm">
                                                    {TYPE_ICONS[n.type] || '🔔'}
                                                </span>
                                            </div>

                                            {/* Text content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${!n.is_read ? 'text-[#3347FF]' : 'text-gray-400'}`}>
                                                        {TYPE_LABELS[n.type] || 'Notificação'}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${!n.is_read ? 'font-bold text-[#2B2B2B]' : 'font-medium text-gray-500'}`}>
                                                    {n.body || n.title}
                                                </p>
                                                <p className="text-[11px] font-medium text-gray-400 mt-1">
                                                    {new Date(n.created_at).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                                                </p>
                                            </div>

                                            {/* Unread indicator */}
                                            {!n.is_read && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#3347FF] shrink-0 mt-2 animate-pulse" />
                                            )}
                                        </Link>
                                    </React.Fragment>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
