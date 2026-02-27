"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    thumbnail_url: string | null;
    format: string | null;
    author_username: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('stlprime_cart');
            if (saved) setItems(JSON.parse(saved));
        } catch { }
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        localStorage.setItem('stlprime_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: CartItem) => {
        setItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const isInCart = useCallback((id: string) => items.some(i => i.id === id), [items]);

    const totalItems = items.length;
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, clearCart, isInCart,
            totalItems, totalPrice,
            isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}
