"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Notification {
    id: string;
    type: 'new_follower' | 'new_comment' | 'new_model' | 'purchase';
    title: string;
    body: string;
    link: string;
    is_read: boolean;
    created_at: string;
    actor?: {
        full_name: string;
        avatar_url: string;
        username: string;
    };
}

export function useNotifications() {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
            .from('notifications')
            .select(`
                *,
                actor:users!notifications_actor_id_fkey (
                    full_name, avatar_url, username
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30);

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to realtime inserts into notifications table
        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchNotifications]);

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const markRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return { notifications, unreadCount, loading, markAllRead, markRead, refresh: fetchNotifications };
}
