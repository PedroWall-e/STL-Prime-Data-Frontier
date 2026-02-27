"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
            // 1. Cadastrar o usuário na Auth do Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    // Dependendo da config do Supabase, você pode precisar de confirmação de e-mail.
                    // Para desenvolvimento rápido, geralmente desativamos o 'Confirm Email' no painel.
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            if (data.user) {
                // 2. Tentar inserir na tabela pública 'users' se você não tiver uma trigger automática.
                // Como definimos database.sql com referencia, é ideal ter uma trigger lá no PostgreSQL 
                // para espelhar auth.users na public.users, OU fazemos a inserção manual aqui:
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([
                        { id: data.user.id, full_name: fullName, username: email.split('@')[0] + Math.floor(Math.random() * 1000) }
                    ]);

                if (profileError) {
                    console.error("Erro ao criar perfil público:", profileError);
                    // Não quebraremos o fluxo principal se apenas o perfil falhar agora
                }

                setSuccessMessage("Conta criada com sucesso! Redirecionando...");
                setTimeout(() => {
                    router.push('/');
                    router.refresh();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao criar a conta.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-prime-600/10 blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] -z-10" />

            <div className="w-full max-w-md">
                <div className="text-center mb-10 text-balance">
                    <Link href="/" className="text-3xl font-bold font-outfit text-gradient mb-2 inline-block">
                        STL Prime
                    </Link>
                    <h2 className="text-2xl font-bold font-outfit text-white">Sua jornada começa aqui</h2>
                    <p className="text-slate-400 mt-2">Crie sua conta e acesse arquivos gratuitos agora mesmo</p>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <form className="space-y-5" onSubmit={handleSignup}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl flex items-start gap-2">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-xl">
                                {successMessage}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-11 text-white focus:border-prime-500 focus:ring-1 focus:ring-prime-500 transition-all outline-none"
                                    placeholder="Pedro Wall-e"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-11 text-white focus:border-prime-500 focus:ring-1 focus:ring-prime-500 transition-all outline-none"
                                    placeholder="seu@email.com"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-11 text-white focus:border-prime-500 focus:ring-1 focus:ring-prime-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <input type="checkbox" className="mt-1 rounded border-white/10 bg-slate-900 text-prime-500 focus:ring-prime-500" required />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Eu aceito os <span className="text-prime-400">Termos de Uso</span> e a <span className="text-prime-400">Política de Privacidade</span> da STL Prime.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-prime-600 hover:bg-prime-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-prime-600/20 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Criando Conta...' : 'Criar Conta'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-400">
                            Já tem uma conta?{' '}
                            <Link href="/auth/login" className="text-prime-400 font-bold hover:text-prime-300 transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <ShieldCheck size={14} />
                    Seus dados estão protegidos com criptografia de ponta.
                </div>
            </div>
        </div>
    );
}
