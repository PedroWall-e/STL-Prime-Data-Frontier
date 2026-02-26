"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Search, UploadCloud, User, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm text-df-dark">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-df-blue group-hover:scale-105 transition-transform">
                            <Box className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-xl tracking-tight text-df-dark">stl<span className="text-df-blue">prime</span></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">by Data Frontier</span>
                        </div>
                    </Link>

                    {/* Search Desktop (Secundária) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar modelos 3D..."
                            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-df-blue focus:ring-2 focus:ring-df-blue/20 rounded-full py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
                        />
                    </div>

                    {/* Ações Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/catalog/paid" className="text-gray-600 hover:text-df-blue font-bold text-sm transition-colors">
                            Explorar
                        </Link>
                        <Link href="/catalog/paid" className="text-gray-600 hover:text-df-blue font-bold text-sm transition-colors">
                            Comunidade
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-df-blue transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            Carregar
                        </button>
                        <Link href="/auth/signup" className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white transition-transform hover:scale-105 bg-df-blue">
                            <User className="w-4 h-4" />
                            Entrar
                        </Link>
                    </div>

                    {/* Toggle Mobile */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-df-blue"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Menu Mobile */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 top-20 z-40 bg-white p-6 flex flex-col gap-6 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Pesquisar modelos 3D..."
                        className="w-full bg-gray-100 border-transparent focus:border-df-blue rounded-xl py-3 px-4 text-sm outline-none"
                    />
                    <Link href="/catalog/paid" className="text-left font-bold text-lg text-gray-800" onClick={() => setIsOpen(false)}>Explorar</Link>
                    <Link href="/catalog/paid" className="text-left font-bold text-lg text-gray-800" onClick={() => setIsOpen(false)}>Comunidade</Link>
                    <button className="text-left font-bold text-lg text-df-blue flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Carregar Modelo
                    </button>
                    <Link href="/auth/signup" className="mt-auto py-4 rounded-xl font-bold text-white text-center bg-df-blue" onClick={() => setIsOpen(false)}>
                        Entrar / Registar
                    </Link>
                </div>
            )}
        </>
    );
}
