"use client";

import React from 'react';
import { X, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
    const { items, removeItem, totalItems, totalPrice, isOpen, closeCart } = useCart();

    return (
        <>
            {/* Overlay */}
            <div
                onClick={closeCart}
                className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Drawer */}
            <aside className={`fixed top-0 right-0 z-[95] h-full w-full max-w-[420px] bg-[#030712] border-l border-gray-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-[#3347FF]" />
                        <h2 className="text-white font-bold text-lg">Meu Carrinho</h2>
                        {totalItems > 0 && (
                            <span className="bg-[#3347FF] text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-gray-300 font-semibold">Carrinho vazio</p>
                                <p className="text-gray-500 text-sm mt-1">Explore o catálogo e adicione modelos.</p>
                            </div>
                            <button
                                onClick={closeCart}
                                className="text-[#3347FF] text-sm font-bold hover:underline"
                            >
                                Explorar Catálogo →
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-gray-900 border border-gray-800 group">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                    {item.thumbnail_url ? (
                                        <img
                                            src={item.thumbnail_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{item.title}</p>
                                    <p className="text-gray-500 text-xs mt-1">por @{item.author_username}</p>
                                    {item.format && (
                                        <span className="inline-block mt-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                                            {item.format}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col items-end justify-between flex-shrink-0">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <span className="text-[#3347FF] font-bold text-sm">
                                        {item.price === 0
                                            ? <span className="text-green-400">Grátis</span>
                                            : `R$ ${item.price.toFixed(2)}`
                                        }
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-800 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total</span>
                            <span className="text-white font-black text-xl">
                                {totalPrice === 0 ? (
                                    <span className="text-green-400">Grátis</span>
                                ) : (
                                    `R$ ${totalPrice.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#3347FF] text-white font-bold text-base hover:bg-[#2236ee] transition-colors"
                        >
                            Finalizar Compra
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <p className="text-center text-xs text-gray-500">
                            Pagamento processado via Stripe com SSL
                        </p>
                    </div>
                )}
            </aside>
        </>
    );
}
