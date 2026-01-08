import { TrendingUp, Users, DollarSign, Activity, AlertCircle } from 'lucide-react';

interface MarketDemandProps {
    keyword: string;
    location: string;
    volume: number | null;
    competition: string;
    cpc?: number;
    loading: boolean;
    error?: string;
}

export function MarketDemandCard({ keyword, location, volume, competition, cpc, loading, error }: MarketDemandProps) {
    if (loading) {
        return (
            <div className="w-full bg-card border rounded-xl p-6 shadow-sm animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-10 w-10 bg-muted rounded-full"></div>
            </div>
        );
    }

    if (error) {
        // Don't show scary errors, just a subtle "Data Unavailable" or "Setup Needed"
        if (error === 'NO_CREDS') {
            return (
                <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4 text-sm">
                    <AlertCircle className="text-blue-500 shrink-0" size={20} />
                    <div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">Ativar Volume de Pesquisas</p>
                        <p className="text-muted-foreground">Configure as chaves do Google Ads para ver a demanda real.</p>
                    </div>
                </div>
            );
        }
        return null; // Hide if generic error
    }

    if (volume === null) return null;

    // Determine Logic
    // If volume is null or 0, it might be low demand or niche
    const intensityColor = volume > 1000 ? 'text-green-500' : (volume > 200 ? 'text-yellow-500' : 'text-muted-foreground');
    const intensityBg = volume > 1000 ? 'bg-green-500/10' : (volume > 200 ? 'bg-yellow-500/10' : 'bg-muted/10');
    const label = volume > 1000 ? 'Alta Procura' : (volume > 200 ? 'Procura Moderada' : 'Nicho');

    return (
        <div className="w-full bg-card border rounded-xl p-6 shadow-sm relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={100} />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Volume Section */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${intensityBg} ${intensityColor}`}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Volume Mensal</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{volume.toLocaleString()}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${intensityBg} ${intensityColor}`}>
                                {label}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Buscas no Google por &quot;{keyword}&quot;</p>
                    </div>
                </div>

                {/* Competition Section */}
                <div className="flex items-center gap-4 border-l border-border/50 pl-0 md:pl-6">
                    <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Competição Ads</p>
                        <span className="text-2xl font-bold text-foreground">{competition}</span>
                        <p className="text-xs text-muted-foreground mt-1">Dificuldade de Anúncio</p>
                    </div>
                </div>

                {/* CPC Section */}
                <div className="flex items-center gap-4 border-l border-border/50 pl-0 md:pl-6">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Custo p/ Clique</p>
                        <span className="text-2xl font-bold text-foreground">
                            {cpc ? `€${cpc.toFixed(2)}` : 'N/A'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Estimativa de topo de página</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
