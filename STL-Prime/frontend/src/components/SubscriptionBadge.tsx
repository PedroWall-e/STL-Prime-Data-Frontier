import React from 'react';
import { Crown, Zap, Star } from 'lucide-react';

interface SubscriptionBadgeProps {
    status: 'free' | 'pro' | 'premium' | 'creator' | string;
    joinedAt?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

// Calculates time-evolved badge level based on how long they've been subscribed
function getBadgeLevel(joinedAt?: string): number {
    if (!joinedAt) return 0;
    const months = Math.floor(
        (Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (months >= 12) return 3; // Gold - 1+ year
    if (months >= 6) return 2;  // Silver - 6+ months
    if (months >= 1) return 1;  // Bronze - 1+ month
    return 0; // New
}

const BADGE_CONFIG = {
    free: {
        label: 'Free',
        icon: null,
        classes: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
    pro: {
        label: 'Pro',
        icon: <Zap size={10} />,
        classes: 'bg-[#3347FF]/10 text-[#3347FF] border border-[#3347FF]/20',
    },
    premium: {
        label: 'Premium',
        icon: <Crown size={10} />,
        classes: 'bg-amber-50 text-amber-600 border border-amber-200',
    },
    creator: {
        label: 'Creator',
        icon: <Star size={10} />,
        classes: 'bg-purple-50 text-purple-600 border border-purple-200',
    },
};

const LEVEL_DECORATORS = [
    { label: '', color: '' },
    { label: '·', color: 'text-amber-700' },   // Bronze
    { label: '·', color: 'text-gray-400' },    // Silver
    { label: '·', color: 'text-yellow-500' },  // Gold
];

const SIZE_CLASSES = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
    lg: 'px-3 py-1 text-xs',
};

export function SubscriptionBadge({
    status,
    joinedAt,
    size = 'md',
    showLabel = true,
}: SubscriptionBadgeProps) {
    const key = (status?.toLowerCase() ?? 'free') as keyof typeof BADGE_CONFIG;
    const config = BADGE_CONFIG[key] ?? BADGE_CONFIG.free;
    const level = getBadgeLevel(joinedAt);
    const decorator = LEVEL_DECORATORS[level];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wider ${config.classes} ${SIZE_CLASSES[size]}`}
            title={`${config.label}${level > 0 ? ` · Nível ${['', 'Bronze', 'Prata', 'Ouro'][level]}` : ''}`}
        >
            {config.icon}
            {showLabel && config.label}
            {level > 0 && (
                <span className={`${decorator.color} text-[8px] font-black leading-none`}>
                    {'★'.repeat(level)}
                </span>
            )}
        </span>
    );
}

// Utility to check if a user can access premium content
export function canAccessPremium(subscriptionStatus: string): boolean {
    return ['pro', 'premium', 'creator', 'admin'].includes(subscriptionStatus?.toLowerCase() ?? '');
}
