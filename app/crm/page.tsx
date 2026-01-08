'use client';

import { useEffect, useState } from 'react';
import { CRMEntry } from '@/lib/types';
import { getCRMData, updateCRMStatus, updateCRMNotes, deleteCRMEntry } from '@/lib/crm';
import { ArrowLeft, Trash2, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CRMPage() {
    const [leads, setLeads] = useState<CRMEntry[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setLeads(getCRMData());
        setMounted(true);
    }, []);

    const handleStatusChange = (id: string, newStatus: CRMEntry['status']) => {
        updateCRMStatus(id, newStatus);
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    };

    const handleNotesBlur = (id: string, newNotes: string) => {
        updateCRMNotes(id, newNotes);
        // State update handled by input onChange, but we sync effectively here
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem a certeza que deseja remover este lead do histórico?')) {
            deleteCRMEntry(id);
            setLeads(prev => prev.filter(l => l.id !== id));
        }
    };

    if (!mounted) return <div className="p-10 text-center">Carregando CRM...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Contacted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Replied': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Negotiation': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Closed Won': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Closed Lost': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                                CRM & Acompanhamento
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gestão de leads contactados e histórico de prospeção.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    {leads.length === 0 ? (
                        <div className="p-20 text-center text-muted-foreground">
                            <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-medium">Nenhum lead contactado ainda.</p>
                            <p className="mt-2">Use a pesquisa na página inicial e envie emails para começar a popular este relatório.</p>
                            <Link href="/">
                                <button className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-all">
                                    Voltar à Pesquisa
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                                        <th className="p-4 pl-6">Empresa</th>
                                        <th className="p-4">Contactado em</th>
                                        <th className="p-4">Email Enviado</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 w-1/3">Notas</th>
                                        <th className="p-4 text-right pr-6">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="font-semibold text-lg">{lead.businessName}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    {lead.city} • Score: {lead.leadScore}
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(lead.contactDate).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(lead.contactDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {lead.email}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value as CRMEntry['status'])}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 ring-primary/20 ${getStatusColor(lead.status)}`}
                                                >
                                                    <option value="Contacted" className="bg-popover text-popover-foreground">Contactado</option>
                                                    <option value="Replied" className="bg-popover text-popover-foreground">Respondeu</option>
                                                    <option value="Negotiation" className="bg-popover text-popover-foreground">Em Negociação</option>
                                                    <option value="Closed Won" className="bg-popover text-popover-foreground">Ganho 💰</option>
                                                    <option value="Closed Lost" className="bg-popover text-popover-foreground">Perdido</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    defaultValue={lead.notes}
                                                    placeholder="Adicionar notas..."
                                                    onBlur={(e) => handleNotesBlur(lead.id, e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/30 text-muted-foreground focus:text-foreground transition-all"
                                                />
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                                                    title="Remover do Histórico"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
