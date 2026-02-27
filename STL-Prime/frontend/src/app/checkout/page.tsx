"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Package, ArrowLeft, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const freeOnly = items.every(i => i.price === 0);

    const handleCheckout = async () => {
        setStatus('processing');
        // TODO: Conectar ao Stripe/MercadoPago na próxima fase
        // Por agora, simula o processamento para itens gratuitos
        await new Promise(r => setTimeout(r, 2000));
        setStatus('success');
        clearCart();
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-[#2B2B2B] mb-2">Pedido Confirmado!</h1>
                    <p className="text-gray-500 mb-8">Seus arquivos estão disponíveis para download na sua conta.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-[#3347FF] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#2236ee] transition-colors"
                    >
                        Voltar ao Catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-[#2B2B2B] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#3347FF]" />
                        <span className="font-bold text-[#2B2B2B]">Checkout</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">
                {items.length === 0 ? (
                    <div className="text-center py-24">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-400">Carrinho vazio</h2>
                        <Link href="/" className="inline-block mt-6 text-[#3347FF] font-bold hover:underline">
                            ← Explorar modelos
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
                        {/* Lista de Items */}
                        <div>
                            <h2 className="text-xl font-black text-[#2B2B2B] mb-6">
                                Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
                            </h2>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#2B2B2B] leading-tight">{item.title}</p>
                                            <p className="text-gray-400 text-sm mt-0.5">por @{item.author_username}</p>
                                            {item.format && (
                                                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                    {item.format}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {item.price === 0
                                                ? <span className="text-green-600 font-bold">Grátis</span>
                                                : <span className="font-bold text-[#2B2B2B]">R$ {item.price.toFixed(2)}</span>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar de Pagamento */}
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-black text-[#2B2B2B] text-lg mb-6">Pagamento</h3>

                                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">
                                            {totalPrice === 0 ? 'Grátis' : `R$ ${totalPrice.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Taxa de serviço</span>
                                        <span className="font-medium text-green-600">R$ 0,00</span>
                                    </div>
                                </div>

                                <div className="flex justify-between mb-8">
                                    <span className="font-bold text-[#2B2B2B]">Total</span>
                                    <span className="font-black text-2xl text-[#3347FF]">
                                        {totalPrice === 0 ? 'Grátis' : `R$ ${totalPrice.toFixed(2)}`}
                                    </span>
                                </div>

                                {freeOnly ? (
                                    <button
                                        onClick={handleCheckout}
                                        disabled={status === 'processing'}
                                        className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-base hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {status === 'processing' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Baixar Grátis
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-4 rounded-2xl bg-[#3347FF] text-white font-bold text-base opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Pagar com Stripe
                                        <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">Em breve</span>
                                    </button>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <Shield className="w-3 h-3" />
                                    <span>Pagamentos protegidos com SSL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
