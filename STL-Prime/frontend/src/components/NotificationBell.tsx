"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User, X, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const TYPE_ICONS: Record<string, string> = {
    new_follower: '👤',
    new_comment: '💬',
    new_model: '📦',
    purchase: '🛒',
};

export function NotificationBell() {
    const { notifications, unreadCount, loading, markAllRead, markRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-[#3347FF] hover:bg-gray-100 rounded-full transition-all"
                aria-label="Notificações"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#3347FF] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden z-[200]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h3 className="font-black text-[#2B2B2B]">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-[#3347FF] text-[10px] font-black uppercase tracking-widest hover:underline"
                                >
                                    <CheckCheck size={12} /> Marcar todas
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-400">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="py-10 text-center text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
                                A carregar...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-sm font-bold text-gray-400">Tudo certo por aqui!</p>
                                <p className="text-xs text-gray-300 mt-1">Nenhuma notificação ainda.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <Link
                                    key={n.id}
                                    href={n.link || '#'}
                                    onClick={() => { markRead(n.id); setIsOpen(false); }}
                                    className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group ${!n.is_read ? 'bg-[#3347FF]/3' : ''}`}
                                >
                                    {/* Actor avatar */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {n.actor?.avatar_url ? (
                                                <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 text-base leading-none">
                                            {TYPE_ICONS[n.type] || '🔔'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-relaxed ${!n.is_read ? 'font-bold text-[#2B2B2B]' : 'font-medium text-gray-600'}`}>
                                            {n.body || n.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                            {new Date(n.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!n.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-[#3347FF] shrink-0 mt-2" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-50 px-5 py-3">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#3347FF] transition-colors"
                        >
                            Ver todas <ExternalLink size={10} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
