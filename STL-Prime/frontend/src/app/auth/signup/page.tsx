"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            });

            if (signUpError) {
                if (signUpError.message === 'Not configured') {
                    // Simulation mode
                    await new Promise(r => setTimeout(r, 1200));
                    setSuccessMessage('Conta criada! (Modo Simulação) — Redirecionando...');
                    setTimeout(() => router.push('/dashboard'), 1500);
                    return;
                }
                throw signUpError;
            }

            if (data.user && !data.session) {
                setSuccessMessage('Conta criada com sucesso! Verifique o seu e-mail para confirmar o cadastro.');
            } else {
                // Trigger Welcome Email in the background
                fetch('/api/emails/welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: email,
                        firstName: fullName.split(' ')[0]
                    })
                }).catch(err => console.error('Failed to trigger welcome email', err));

                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F9F8F6]">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#2B2B2B]">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#3347FF]/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#B2624F]/20 rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between p-14 w-full">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.svg" alt="STL Prime" className="w-10 h-10" />
                        <span className="font-black text-2xl text-white tracking-tight">stl<span className="text-[#8C9BFF]">prime</span></span>
                    </Link>
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Junte-se à comunidade</p>
                        <h2 className="text-white text-4xl font-black leading-tight mb-6">
                            Comece a criar.<br />Comece a crescer.
                        </h2>
                        <div className="space-y-4">
                            {['Acesso gratuito a milhares de modelos', 'Publique e venda os seus designs', 'Comunidade de 50k+ makers'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-[#3347FF]/20 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-[#8C9BFF]" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">© 2024 Data Frontier Labs</p>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
                        <img src="/logo.svg" alt="STL Prime" className="w-10 h-10" />
                        <span className="font-black text-2xl text-[#2B2B2B] tracking-tight">stl<span className="text-[#3347FF]">prime</span></span>
                    </Link>

                    <h1 className="text-3xl font-black text-[#2B2B2B] mb-2">Criar conta gratuita</h1>
                    <p className="text-gray-500 font-medium mb-10">É rápido e gratuito. Comece agora.</p>

                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700 font-medium">
                            <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu Nome" required
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-bold focus:bg-white focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none transition-all placeholder:text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                </div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-bold focus:bg-white focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none transition-all placeholder:text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                </div>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-bold focus:bg-white focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none transition-all placeholder:text-gray-400" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl bg-[#3347FF] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#2236ee] transition-colors disabled:opacity-60 shadow-lg shadow-[#3347FF]/20 hover:-translate-y-0.5 transform duration-200">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><span>Criar Conta</span><ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>

                        <p className="text-xs text-gray-400 text-center font-medium">
                            Ao criar conta, concorda com os nossos{' '}
                            <a href="#" className="text-[#3347FF] hover:underline">Termos de Serviço</a> e{' '}
                            <a href="#" className="text-[#3347FF] hover:underline">Política de Privacidade</a>.
                        </p>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-gray-500">
                        Já tem conta?{' '}
                        <Link href="/auth/login" className="text-[#3347FF] font-bold hover:underline">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
