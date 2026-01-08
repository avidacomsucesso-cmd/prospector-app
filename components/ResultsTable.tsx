'use client';
import { Business } from '@/lib/types';
import { LeadScore } from './LeadScore';
import { MapPin, Globe, ExternalLink, Mail, MessageCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnalysisModal } from './AnalysisModal';
import { ContactModal } from './ContactModal';
import { OutreachModal } from './OutreachModal';
import { getCRMData, addCRMEntry, deleteCRMEntry } from '@/lib/crm';

export function ResultsTable({ businesses }: { businesses: Business[] }) {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [viewContact, setViewContact] = useState<Business | null>(null);
    const [outreachTarget, setOutreachTarget] = useState<{ business: Business; tab: 'email' | 'whatsapp' } | null>(null);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    // Load saved favorites on mount
    useEffect(() => {
        const crmData = getCRMData();
        const ids = new Set(crmData.map(e => e.id));
        setSavedIds(ids);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleFavorite = (business: Business) => {
        if (savedIds.has(business.id)) {
            // Remove
            deleteCRMEntry(business.id);
            const newSet = new Set(savedIds);
            newSet.delete(business.id);
            setSavedIds(newSet);
        } else {
            // Add
            addCRMEntry({
                id: business.id,
                businessName: business.name,
                contactDate: new Date().toISOString(),
                email: business.email || '',
                city: business.address.split(',').pop()?.trim() || '',
                leadScore: business.leadScore,
            });
            const newSet = new Set(savedIds);
            newSet.add(business.id);
            setSavedIds(newSet);
        }
    };

    return (
        <div className="w-full overflow-x-auto rounded-lg border shadow-sm">
            <div className="flex justify-end p-2 mb-2">
                <button
                    onClick={() => {
                        const headers = ['Maps Rank', 'Name', 'Phone', 'Address', 'Rating', 'Reviews', 'Score', 'Priority', 'Issues', 'Outreach'];

                        const escapeCsv = (field: unknown) => {
                            const stringField = String(field || '');
                            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                                return `"${stringField.replace(/"/g, '""')}"`;
                            }
                            return stringField;
                        };

                        const rows = businesses.map(b => [
                            b.googleMapsRank,
                            b.name,
                            b.phone,
                            b.address,
                            b.rating,
                            b.reviewCount,
                            b.leadScore,
                            b.priority,
                            b.issues.join('; '),
                            b.outreachPitch
                        ].map(escapeCsv).join(','));

                        const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'prospector_leads.csv';
                        link.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition"
                >
                    <ExternalLink size={16} /> Exportar Excel
                </button>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-medium uppercase text-xs">
                    <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="p-4 font-medium">Empresa</th>
                        <th className="p-4 font-medium">Score</th>
                        <th className="p-4 font-medium">Problemas GMB</th>
                        <th className="p-4 font-medium">Detalhes</th>
                        <th className="p-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {businesses.map((b) => (
                        <tr key={b.id} className="bg-card hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-4">
                                <LeadScore score={b.leadScore} />
                            </td>
                            <td className="px-4 py-4 max-w-xs">
                                <div className="flex items-start gap-2">
                                    <button
                                        onClick={() => toggleFavorite(b)}
                                        className={`mt-1 transition-colors ${savedIds.has(b.id) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                                        title={savedIds.has(b.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                                    >
                                        <Star size={18} fill={savedIds.has(b.id) ? "currentColor" : "none"} />
                                    </button>
                                    <div>
                                        <button onClick={() => setViewContact(b)} className="font-bold text-base hover:text-primary hover:underline text-left">
                                            {b.name}
                                        </button>
                                        <div className="text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin size={12} /> {b.address}
                                        </div>
                                        {b.website && (
                                            <a href={`https://${b.website}`} target="_blank" className="text-blue-500 flex items-center gap-1 mt-1 hover:underline">
                                                <Globe size={12} /> {b.website} <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold">Reviews: {b.reviewCount}</span>
                                    <span className="text-xs text-muted-foreground">Rating: {b.rating > 0 ? b.rating : 'N/A'}</span>
                                    {b.issues.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {b.issues.slice(0, 2).map((i, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] rounded-sm border border-red-200 dark:border-red-900">
                                                    {i}
                                                </span>
                                            ))}
                                            {b.issues.length > 2 && <span className="text-[10px] text-muted-foreground">+{b.issues.length - 2} more</span>}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => setSelectedBusiness(b)}
                                    className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded text-xs font-semibold transition"
                                >
                                    Detalhes
                                </button>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setOutreachTarget({ business: b, tab: 'email' })}
                                        className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-colors"
                                        title="Enviar Email"
                                    >
                                        <Mail size={16} />
                                    </button>
                                    <button
                                        onClick={() => setOutreachTarget({ business: b, tab: 'whatsapp' })}
                                        className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-colors"
                                        title="Enviar WhatsApp"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedBusiness && (
                <AnalysisModal
                    business={selectedBusiness}
                    allBusinesses={businesses}
                    onClose={() => setSelectedBusiness(null)}
                />
            )}

            {viewContact && (
                <ContactModal
                    business={viewContact}
                    onClose={() => setViewContact(null)}
                />
            )}

            {outreachTarget && (
                <OutreachModal
                    business={outreachTarget.business}
                    initialTab={outreachTarget.tab}
                    onClose={() => setOutreachTarget(null)}
                />
            )}
        </div>
    );
}
