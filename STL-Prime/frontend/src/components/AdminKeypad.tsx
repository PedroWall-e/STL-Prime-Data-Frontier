"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminKeypad() {
    const [isOpen, setIsOpen] = useState(false);
    const [pin, setPin] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const supabase = createClient();

    // Sequência secreta para abrir o teclado (ex: clicar 5 vezes no rodapé ou atalho de teclado)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Atalho de desenvolvimento: Ctrl+Shift+A
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (pin !== '6874') {
            setStatus('error');
            setMessage('PIN Inválido');
            setTimeout(() => {
                setPin('');
                setStatus('idle');
            }, 1000);
            return;
        }

        setStatus('loading');
        try {
            // Em vez de chamar a Cloud Function diretamente do frontend, chamaremos o Supabase para invocar a server action no futuro,
            // ou enviamos email via uma tabela de logs que dispara a Edge Function.
            // Por enquanto, apenas simulamos o envio.

            // Simulação de envio
            await new Promise(resolve => setTimeout(resolve, 1500));

            setStatus('success');
            setMessage('Relatório Enviado');
            setTimeout(() => {
                setIsOpen(false);
                setPin('');
                setStatus('idle');
            }, 3000);

        } catch (error) {
            setStatus('error');
            setMessage('Erro ao enviar');
        }
    };

    const handleRecover = () => {
        setStatus('loading');
        // Lógica de recuperação (enviar email ao admin cadastrado)
        setTimeout(() => {
            setStatus('success');
            setMessage('Senha enviada');
            setTimeout(() => {
                setPin('');
                setStatus('idle');
            }, 3000);
        }, 1500);
    };

    // Auto-submit ao atingir 4 dígitos
    useEffect(() => {
        if (pin.length === 4 && status === 'idle') {
            handleSubmit();
        }
    }, [pin]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#030712] border border-[#3347FF]/30 w-full max-w-sm rounded-3xl p-8 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#3347FF]"></div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#3347FF]/10 text-[#3347FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3347FF]/20">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Acesso Restrito</h2>
                    <p className="text-gray-400 text-sm mt-1">Insira o PIN Administrativo</p>
                </div>

                {/* Mostrador Numérico */}
                <div className={`mb-8 flex justify-center gap-3 ${status === 'error' ? 'animate-shake' : ''}`}>
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i
                                    ? status === 'error'
                                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                        : status === 'success'
                                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                            : 'bg-[#3347FF] shadow-[0_0_10px_rgba(51,71,255,0.5)]'
                                    : 'bg-gray-800'
                                }`}
                        />
                    ))}
                </div>

                {message && (
                    <div className={`text-center font-bold text-sm mb-6 ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </div>
                )}

                {/* Teclado */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            disabled={status !== 'idle' && status !== 'error'}
                            className="aspect-square rounded-2xl bg-gray-900 border border-gray-800 text-white font-bold text-2xl hover:bg-gray-800 hover:border-gray-700 active:bg-gray-700 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleRecover}
                        className="aspect-square rounded-2xl bg-transparent text-gray-500 hover:text-white transition-colors flex flex-col items-center justify-center text-xs font-bold"
                    >
                        <Mail className="w-5 h-5 mb-1" />
                        Recuperar
                    </button>
                    <button
                        onClick={() => handleNumberClick('0')}
                        disabled={status !== 'idle' && status !== 'error'}
                        className="aspect-square rounded-2xl bg-gray-900 border border-gray-800 text-white font-bold text-2xl hover:bg-gray-800 hover:border-gray-700 active:bg-gray-700 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={status !== 'idle' && status !== 'error' || pin.length === 0}
                        className="aspect-square rounded-2xl bg-transparent text-gray-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-20"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
            </div>
        </div>
    );
}
