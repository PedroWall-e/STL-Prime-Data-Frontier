"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, ImageIcon, CheckCircle2, AlertCircle, ArrowLeft, Tag, DollarSign, AlignLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const [stlFile, setStlFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '0',
        isFree: true,
        format: 'STL',
        category_id: '',
    });

    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleStlDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.stl') || file.name.endsWith('.3mf'))) {
            setStlFile(file);
        }
    };

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbFile(file);
            setThumbPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stlFile) { setMessage('Adicione um arquivo STL ou 3MF.'); return; }
        if (!thumbFile) { setMessage('Adicione uma imagem de capa.'); return; }
        if (!form.title) { setMessage('Adicione um título ao modelo.'); return; }

        setStatus('uploading');
        setMessage('');

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('Usuário não autenticado.');

            // 1. Upload da Thumbnail
            const thumbExt = thumbFile.name.split('.').pop();
            const thumbPath = `${user.id}/${Date.now()}_thumb.${thumbExt}`;
            const { data: thumbData, error: thumbError } = await supabase.storage
                .from('models-thumbnails')
                .upload(thumbPath, thumbFile);

            if (thumbError) throw new Error('Erro no upload da capa: ' + thumbError.message);

            const { data: publicThumbUrl } = supabase.storage
                .from('models-thumbnails')
                .getPublicUrl(thumbData.path);

            // 2. Upload do Arquivo STL/3MF
            const fileExt = stlFile.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}_file.${fileExt}`;
            const { data: stlData, error: stlError } = await supabase.storage
                .from('models-files')
                .upload(filePath, stlFile);

            if (stlError) {
                // Rollback: se o STL falhar, deletamos a capa já upada
                await supabase.storage.from('models-thumbnails').remove([thumbData.path]);
                throw new Error('Erro no upload do modelo 3D: ' + stlError.message);
            }

            const { data: publicStlUrl } = supabase.storage
                .from('models-files')
                .getPublicUrl(stlData.path);

            // 3. Regras de Confiança (Auto-Aprovação vs. Moderado)
            const { data: profile } = await supabase
                .from('users')
                .select('trust_level, subscription_status')
                .eq('id', user.id)
                .single();

            const isTrusted = profile?.trust_level === 2 || ['pro', 'premium'].includes(profile?.subscription_status || '');
            const initialStatus = isTrusted ? 'approved' : 'pending';

            // 4. Inserir no Banco de Dados
            const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
            const { error: insertError } = await supabase.from('models').insert({
                title: form.title,
                slug,
                description: form.description,
                price: form.isFree ? 0 : parseFloat(form.price),
                is_free: form.isFree,
                format: form.format,
                thumbnail_url: publicThumbUrl.publicUrl,
                file_url: publicStlUrl.publicUrl,
                author_id: user.id,
                status: initialStatus
            });

            if (insertError) {
                // Rollback: se o DB falhar, apagamos tudo do Storage
                await supabase.storage.from('models-thumbnails').remove([thumbData.path]);
                await supabase.storage.from('models-files').remove([stlData.path]);
                throw new Error('Falha ao registrar no banco de dados. ' + insertError.message);
            }

            setStatus('success');
            setMessage(`Modelo publicado com sucesso! ${!isTrusted ? ' (Aguardando Moderação)' : ''}`);
            setTimeout(() => router.push('/dashboard'), 2000);

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Erro desconhecido ao publicar.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-[#2B2B2B] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-[#3347FF]" />
                        <span className="font-bold text-[#2B2B2B]">Publicar Modelo</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
                <h1 className="text-3xl font-black text-[#2B2B2B] mb-2">Compartilhe sua criação</h1>
                <p className="text-gray-500 mb-10">Faça upload do seu modelo 3D e configure seu preço.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* STL Drop Zone */}
                    <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                            Arquivo do Modelo <span className="text-red-400">*</span>
                        </label>
                        <div
                            onDrop={handleStlDrop}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-[#3347FF] bg-[#3347FF]/5' :
                                stlFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#3347FF] hover:bg-gray-50'
                                }`}
                        >
                            {stlFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <File className="w-8 h-8 text-green-600" />
                                    <div className="text-left">
                                        <p className="font-bold text-green-700">{stlFile.name}</p>
                                        <p className="text-green-500 text-sm">{(stlFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setStlFile(null); }} className="ml-4 text-gray-400 hover:text-red-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="font-semibold text-gray-500">Arraste ou clique para selecionar</p>
                                    <p className="text-sm text-gray-400 mt-1">Suporta .STL e .3MF</p>
                                </>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".stl,.3mf" className="hidden" onChange={(e) => e.target.files?.[0] && setStlFile(e.target.files[0])} />
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-3">Imagem de Capa</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {thumbPreview ? (
                                    <img src={thumbPreview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => thumbInputRef.current?.click()}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-600 hover:border-[#3347FF] hover:text-[#3347FF] transition-colors"
                            >
                                Escolher imagem
                            </button>
                        </div>
                        <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                    </div>

                    {/* Fields */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                                <Layers className="w-4 h-4 inline mr-1" /> Título <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="Ex: Vaso Orgânico Paramétrico"
                                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                                <AlignLeft className="w-4 h-4 inline mr-1" /> Descrição
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={4}
                                placeholder="Descreva o modelo, tamanho, configurações de impressão recomendadas..."
                                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                                <Tag className="w-4 h-4 inline mr-1" /> Formato do Arquivo
                            </label>
                            <div className="flex gap-3">
                                {['STL', '3MF', 'STL / 3MF'].map(fmt => (
                                    <button key={fmt} type="button"
                                        onClick={() => setForm(p => ({ ...p, format: fmt }))}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${form.format === fmt ? 'bg-[#3347FF] text-white border-[#3347FF]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#3347FF]'}`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                                <DollarSign className="w-4 h-4 inline mr-1" /> Preço
                            </label>
                            <div className="flex gap-4">
                                <button type="button"
                                    onClick={() => setForm(p => ({ ...p, isFree: true, price: '0' }))}
                                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${form.isFree ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-500'}`}
                                >
                                    Grátis
                                </button>
                                <button type="button"
                                    onClick={() => setForm(p => ({ ...p, isFree: false }))}
                                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${!form.isFree ? 'bg-[#3347FF] text-white border-[#3347FF]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#3347FF]'}`}
                                >
                                    Pago
                                </button>
                            </div>
                            {!form.isFree && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        min="0.50"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm focus:border-[#3347FF] focus:ring-2 focus:ring-[#3347FF]/20 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            {status === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'uploading'}
                        className="w-full py-4 rounded-2xl bg-[#3347FF] text-white font-bold text-base hover:bg-[#2236ee] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {status === 'uploading' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5" />
                                Publicar Modelo
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
