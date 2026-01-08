import { Business } from '@/lib/types';
import { X, Check, Copy, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { LeadScore } from './LeadScore';

interface AnalysisModalProps {
    business: Business;
    allBusinesses: Business[];
    onClose: () => void;
}

export function AnalysisModal({ business, allBusinesses, onClose }: AnalysisModalProps) {
    const [copied, setCopied] = useState(false);

    // 1. Calculate Rank - NOW USING REAL API RANK
    const rank = business.googleMapsRank;

    // 2. Ranking Benchmark Logic
    // Find the actual Top 3 based on Google Maps Rank
    const sortedByRank = [...allBusinesses].sort((a, b) => a.googleMapsRank - b.googleMapsRank);
    const top3 = sortedByRank.slice(0, 3);

    // Construct the display list: Top 3 + Selected Business (if not in top 3)
    const displayList = [...top3];
    const isClientInTop3 = top3.some(b => b.id === business.id);

    if (!isClientInTop3) {
        displayList.push(business);
    }

    // 3. Compare Stats (Benchmark against Top 3)
    const avgTopRating = top3.reduce((acc, curr) => acc + curr.rating, 0) / top3.length;
    const avgTopReviews = top3.reduce((acc, curr) => acc + curr.reviewCount, 0) / top3.length;

    const handleCopy = () => {
        navigator.clipboard.writeText(business.outreachPitch);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-card border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">

                    {/* Header */}
                    <div className="p-6 border-b bg-muted/20 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">{business.name}</h2>
                                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                                    Google Maps Rank {rank > 60 ? '> 60' : `#${rank}`}
                                </div>
                                {business.googleSearchRank && (
                                    <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                                        Search Rank #{business.googleSearchRank}
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm">{business.address}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Left Column: Issues & Suggestions */}
                        <div className="p-6 border-r border-border/50 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2"><AlertTriangle size={18} className="text-orange-500" /> Diagnóstico & Problemas</h3>
                                <LeadScore score={business.leadScore} />
                            </div>

                            <div className="space-y-3">
                                {/* Ranking Insights - NEW */}
                                {business.rankingInsights && business.rankingInsights.length > 0 && (
                                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Análise de Ranking</h4>
                                        <ul className="space-y-2">
                                            {business.rankingInsights.map((insight, idx) => (
                                                <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                                                    <span>•</span> {insight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {business.issues.length === 0 ? (
                                    <p className="text-sm text-green-500">Nenhum problema crítico encontrado. Parabéns!</p>
                                ) : (
                                    business.issues.map((issue, idx) => (
                                        <div key={idx} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-red-200">{issue}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Sugestão: {getSuggestion(issue)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Check size={18} className="text-green-500" /> Pitch de Venda Sugerido</h3>
                                <div className="bg-muted p-4 rounded-lg relative font-mono text-sm leading-relaxed border group">
                                    {business.outreachPitch}
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-2 right-2 p-2 bg-background border rounded-md hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                        title="Copiar"
                                    >
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Comparative Analysis */}
                        <div className="p-6 bg-muted/5 space-y-6">
                            <h3 className="font-semibold flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Benchmark (Top 3 vs Você)</h3>

                            <div className="space-y-4">
                                {displayList.map((comp) => {
                                    const isUser = comp.id === business.id;
                                    return (
                                        <div key={comp.id} className={`flex items-center justify-between p-3 border rounded-lg text-sm ${isUser ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs ${comp.googleMapsRank <= 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                                                    {comp.googleMapsRank > 60 ? '>60' : comp.googleMapsRank}
                                                </span>
                                                <span className={isUser ? 'font-bold text-primary' : 'text-foreground'}>
                                                    {comp.name} {isUser && '(Você)'}
                                                </span>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <div>{comp.rating} ⭐ ({comp.reviewCount})</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2"><TrendingUp size={16} /> Plano de Ação</h4>
                                <p className="text-sm text-muted-foreground">
                                    Para alcançar os líderes, o <strong>{business.name}</strong> precisa:
                                </p>
                                <ul className="text-sm space-y-2 list-disc pl-4 text-foreground/80">
                                    {business.reviewCount < avgTopReviews && (
                                        <li>Aumentar volume de reviews (Média Top 4: <strong>{Math.round(avgTopReviews)}</strong> vs Atual: {business.reviewCount})</li>
                                    )}
                                    {business.rating < avgTopRating && (
                                        <li>Melhorar nota média (Média Top 4: <strong>{avgTopRating.toFixed(1)}</strong> vs Atual: {business.rating})</li>
                                    )}
                                    {!business.website && (
                                        <li>Criar Website profissional (Essencial para Top Ranking)</li>
                                    )}
                                    {!business.hoursListed && (
                                        <li>Atualizar horários de funcionamento no GMB</li>
                                    )}
                                    {business.leadScore < 50 && (
                                        <li>Reivindicar e otimizar completamente o perfil GMB</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getSuggestion(issue: string): React.ReactNode {
    if (issue.includes('Menos de 10 avaliações') || issue.includes('Baixo volume de avaliações')) {
        return (
            <span>
                Oferecer <a href="https://catback.app/nfc-display" target="_blank" className="underline text-blue-400 hover:text-blue-300 font-bold">Display NFC Google Reviews</a> para facilitar avaliações no local.
            </span>
        );
    }
    if (issue.includes('Website')) return "Criar landing page de alta conversão.";
    if (issue.includes('Avaliação') || issue.includes('Rating')) return "Gestão de reputação e resposta a clientes insatisfeitos.";
    if (issue.includes('Fotos')) return "Sessão fotográfica profissional do local e equipa.";
    return "Otimização completa do perfil Google My Business.";
}
