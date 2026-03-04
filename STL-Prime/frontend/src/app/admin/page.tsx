"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, Package, TrendingUp,
    Settings, Bell, Search, DollarSign, BarChart3,
    ArrowUpRight, ArrowDownRight, MoreVertical,
    CheckCircle2, XCircle, Clock, Shield, Download, Trash2, ShieldAlert, Edit, Eye, RefreshCw, Menu, X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [pendingModels, setPendingModels] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [stats, setStats] = useState({
        revenue: 0,
        subscribers: 0,
        downloads: 0,
        conversion: 0,
        salesCount: 0
    });

    const checkAdmin = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            router.push('/');
            return;
        }

        setIsAdmin(true);
        fetchData();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users
            const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (usersData) setUsers(usersData);

            // Fetch Models
            const { data: modelsData } = await supabase.from('models').select('*, author:users(username)').order('created_at', { ascending: false });
            if (modelsData) setModels(modelsData);

            // Fetch Purchases (Sales)
            const { data: salesData } = await supabase.from('purchases').select('*, user:users(full_name), model:models(title)').order('created_at', { ascending: false }).limit(10);
            if (salesData) setRecentSales(salesData);

            // Fetch Real Metrics
            const metricsRes = await fetch('/api/admin/metrics');
            if (metricsRes.ok) {
                const metrics = await metricsRes.json();
                const totalDownloads = modelsData?.reduce((acc, m) => acc + (m.downloads_count || 0), 0) || 0;
                setStats({
                    revenue: metrics.grossRevenue || 0,
                    subscribers: usersData?.filter(u => u.subscription_status !== 'free').length || 0,
                    downloads: totalDownloads,
                    conversion: metrics.totalUsers > 0 ? Number(((metrics.totalSales / metrics.totalUsers) * 100).toFixed(1)) : 0,
                    salesCount: metrics.totalSales || 0
                });
            }

            // Fetch Pending Models for Moderation
            const modsRes = await fetch('/api/admin/models');
            if (modsRes.ok) {
                const pending = await modsRes.json();
                setPendingModels(pending);
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAdmin();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) fetchData();
    };

    const handleDeleteModel = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este modelo?')) return;
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (!error) fetchData();
    };

    const togglePublication = async (model: any) => {
        const { error } = await supabase.from('models').update({ is_published: !model.is_published }).eq('id', model.id);
        if (!error) fetchData();
    };

    const handleModerateModel = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Deseja realmente ${status === 'approved' ? 'APROVAR' : 'REJEITAR'} este modelo?`)) return;

        try {
            const res = await fetch('/api/admin/models', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                fetchData(); // Refresh list
            } else {
                alert('Erro ao moderar modelo.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#3347FF]/20 border-t-[#3347FF] rounded-full animate-spin" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">A carregar laboratório admin...</span>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#F9F8F6] flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2B2B2B] text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3347FF] flex items-center justify-center">
                            <Shield size={18} />
                        </div>
                        <span className="font-black text-xl tracking-tight">STL<span className="text-[#3347FF]">Admin</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'users', label: 'Usuários', icon: Users },
                        { id: 'models', label: 'Catálogo', icon: Package },
                        { id: 'moderation', label: 'Moderação', icon: ShieldAlert },
                        { id: 'sales', label: 'Vendas', icon: TrendingUp },
                        { id: 'settings', label: 'Configurações', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-[#3347FF] text-white shadow-lg shadow-[#3347FF]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-xs font-black text-[#3347FF] uppercase mb-1">Status do Sistema</p>
                        <p className="text-xs text-gray-400 mb-3">{loading ? 'Atualizando dados...' : 'Dados sincronizados.'}</p>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Sincronizar Agora
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#3347FF] transition-colors">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#2B2B2B]">Painel Administrativo</h1>
                            <p className="text-gray-500 text-sm md:text-base font-medium">Benvindo de volta, Admin. Aqui está o resumo da plataforma.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3347FF]" />
                        </div>
                        <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#3347FF] relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Faturamento Total', value: `R$ ${stats.revenue.toFixed(2)}`, change: '+12.5%', isUp: true, icon: DollarSign },
                        { label: 'Assinantes Ativos', value: stats.subscribers.toString(), change: '+18.2%', isUp: true, icon: Users },
                        { label: 'Downloads Totais', value: stats.downloads.toLocaleString(), change: '+5.4%', isUp: true, icon: Download },
                        { label: 'Taxa de Conversão', value: `${stats.conversion}%`, change: '-0.8%', isUp: false, icon: BarChart3 },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-gray-50 text-[#3347FF]">
                                    <stat.icon size={24} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-green-600' : 'text-red-500'}`}>
                                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-[#2B2B2B] mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadein">
                        {/* Recent Sales Table */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-lg font-black text-[#2B2B2B]">Vendas Recentes</h3>
                                <button className="text-sm font-bold text-[#3347FF] hover:underline" onClick={() => setActiveTab('sales')}>Ver relatório completo</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Produto</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Cliente</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Preço</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentSales.length === 0 ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400 font-bold">Nenhuma venda encontrada.</td></tr>
                                        ) : (
                                            recentSales.map((sale) => (
                                                <tr key={sale.id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-sm text-[#2B2B2B]">{sale.model?.title || 'Modelo Removido'}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{sale.user?.full_name || 'Usuário Anon'}</td>
                                                    <td className="px-6 py-4 font-black text-sm text-[#2B2B2B]">R$ {Number(sale.amount_paid).toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700`}>
                                                            <CheckCircle2 size={12} />
                                                            Completed
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick Management */}
                        <div className="space-y-6">
                            <div className="bg-[#3347FF] p-6 rounded-3xl text-white shadow-xl shadow-[#3347FF]/20">
                                <h3 className="text-lg font-black mb-4">Meta de Vendas</h3>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-sm font-bold opacity-80">R$ 15.000 / R$ 20.000</span>
                                    <span className="text-2xl font-black">75%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-6">
                                    <div className="w-[75%] h-full bg-white"></div>
                                </div>
                                <button className="w-full py-3 bg-white text-[#3347FF] font-black text-sm rounded-xl hover:bg-gray-50 transition-all">Ver Detalhes</button>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-[#2B2B2B] mb-4">Ações Rápidas</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Novo Admin', icon: Shield },
                                        { label: 'Relatório PDF', icon: Package },
                                        { label: 'Moderar Posts', icon: Bell },
                                        { label: 'Emails Massivos', icon: DollarSign },
                                    ].map((action, i) => (
                                        <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#3347FF]/30 hover:bg-white hover:shadow-md transition-all group">
                                            <action.icon size={20} className="text-gray-400 group-hover:text-[#3347FF] mb-2" />
                                            <span className="text-[10px] font-black text-gray-500 group-hover:text-[#2B2B2B] uppercase text-center leading-tight">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fadein">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-[#2B2B2B]">Gerenciamento de Usuários</h3>
                            <button className="px-4 py-2 bg-[#3347FF] text-white rounded-xl text-sm font-bold hover:bg-[#2236ee] transition-colors">Exportar CSV</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Nome / Email</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Plano</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Membro desde</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400 font-bold">Nenhum usuário encontrado.</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-[#2B2B2B]">{user.full_name}</p>
                                                <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${user.subscription_status === 'premium' ? 'bg-amber-100 text-amber-700' : user.subscription_status === 'pro' ? 'bg-[#3347FF]/10 text-[#3347FF]' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.subscription_status || 'free'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase text-green-600`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-green-600`}></div>
                                                    Ativo
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#3347FF] transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'models' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fadein">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-[#2B2B2B]">Gerenciamento de Modelos</h3>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Filtrar</button>
                                <button className="px-4 py-2 bg-[#3347FF] text-white rounded-xl text-sm font-bold hover:bg-[#2236ee] transition-colors">Adicionar Modelo</button>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Título / Autor</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Preço</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Downloads</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {models.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400 font-bold">Nenhum modelo publicado.</td></tr>
                                ) : (
                                    models.map((model) => (
                                        <tr key={model.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-[#2B2B2B]">{model.title}</p>
                                                <p className="text-xs text-gray-400 font-medium">por @{model.author?.username}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-[#2B2B2B]">
                                                {model.price === 0 ? 'Grátis' : `R$ ${Number(model.price).toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{model.downloads_count?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${model.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {model.is_published ? 'Publicado' : 'Privado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => togglePublication(model)} className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${model.is_published ? 'text-yellow-500' : 'text-green-500'}`}>
                                                        {model.is_published ? <Eye size={16} /> : <CheckCircle2 size={16} />}
                                                    </button>
                                                    <button onClick={() => handleDeleteModel(model.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fadein">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-yellow-50/30">
                            <div>
                                <h3 className="text-lg font-black text-[#2B2B2B] flex items-center gap-2">
                                    <ShieldAlert size={20} className="text-yellow-600" /> Fila de Moderação
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Modelos de usuários sem Trust Level aguardando sua revisão.
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-black rounded-lg text-sm">
                                {pendingModels.length} Pendentes
                            </span>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Modelo</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Criador Data</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Infos</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingModels.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                                            Nenhum modelo na fila de aprovação! 🎉
                                        </td>
                                    </tr>
                                ) : (
                                    pendingModels.map((model) => (
                                        <tr key={model.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    <img src={model.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#2B2B2B]">{model.title}</p>
                                                    <span className="text-xs font-bold text-gray-500 px-2 py-0.5 rounded bg-gray-100">{model.format}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-[#2B2B2B]">@{model.author?.username}</p>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                                    Nível {model.author?.trust_level || 1} • {model.author?.subscription_status || 'Free'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-[#2B2B2B]">
                                                {model.price === 0 ? 'Grátis' : `R$ ${Number(model.price).toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => window.open(`/models/${model.id}`, '_blank')} className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1">
                                                        <Eye size={14} /> Ver
                                                    </button>
                                                    <button onClick={() => handleModerateModel(model.id, 'rejected')} className="px-3 py-1.5 rounded-lg text-red-500 font-bold text-xs border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1">
                                                        <XCircle size={14} /> Rejeitar
                                                    </button>
                                                    <button onClick={() => handleModerateModel(model.id, 'approved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 shadow-md shadow-green-600/20 transition-colors flex items-center gap-1">
                                                        <CheckCircle2 size={14} /> Aprovar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fadein">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-[#2B2B2B]">Relatório de Vendas</h3>
                            <button className="px-4 py-2 bg-[#2B2B2B] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">Relatório PDF</button>
                        </div>
                        <div className="p-6 bg-gray-50/50 flex gap-10">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Total Período</p>
                                <p className="text-2xl font-black text-[#2B2B2B]">R$ {stats.revenue.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Média por Venda</p>
                                <p className="text-2xl font-black text-[#2B2B2B]">R$ {stats.salesCount > 0 ? (stats.revenue / stats.salesCount).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Vendas Concluídas</p>
                                <p className="text-2xl font-black text-[#3347FF]">{stats.salesCount}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-t border-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Produto</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Cliente</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Preço</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentSales.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400 font-bold">Nenhuma venda encontrada.</td></tr>
                                    ) : (
                                        recentSales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-sm text-[#2B2B2B]">{sale.model?.title || 'Modelo Removido'}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">{sale.user?.full_name || 'Usuário Anon'}</td>
                                                <td className="px-6 py-4 font-black text-sm text-[#2B2B2B]">R$ {Number(sale.amount_paid).toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700`}>
                                                        <CheckCircle2 size={12} />
                                                        Completed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
