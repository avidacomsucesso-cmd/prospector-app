'use client';

import { Hero } from '@/components/Hero';
import { ResultsTable } from '@/components/ResultsTable';
import { SettingsModal } from '@/components/SettingsModal';
import { MarketDemandCard } from '@/components/MarketDemandCard';
import Link from 'next/link';
import { searchBusinesses } from '@/lib/api/places';
import { Business } from '@/lib/types';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  // Market Data State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [marketMetrics, setMarketMetrics] = useState<any>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState<string | undefined>(undefined);
  const [currentSearch, setCurrentSearch] = useState({ category: '', location: '' });

  const handleSearch = async (category: string, location: string, directQuery?: string) => {
    setLoading(true);
    setLoadingMarket(true);
    setMarketError(undefined);
    setMarketMetrics(null);
    setCurrentSearch({ category, location });

    try {
      // 1. Start Business Search
      const businessPromise = searchBusinesses(category, location, directQuery);

      // 2. Start Keyword Volume Search (Parallel)
      // Construct a smart query: "Cafe in Cascais" or just "Cafe" if location is implied logic?
      // Google Ads works best with "Service City".
      const keywordTerm = directQuery ? directQuery : `${category} ${location}`;

      const marketPromise = fetch(`/api/keywords?term=${encodeURIComponent(keywordTerm)}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.code || 'API_ERROR');
          return data;
        })
        .catch(err => {
          console.warn("Market Data Fetch Error:", err);
          if (err.message === 'NO_CREDS') setMarketError('NO_CREDS');
          else setMarketError('GENERIC');
          return null;
        });

      // Await both
      const [results, metrics] = await Promise.all([businessPromise, marketPromise]);

      setBusinesses(results);
      setMarketMetrics(metrics);

    } catch (e) {
      console.error("Search Flow Error", e);
    } finally {
      setLoading(false);
      setLoadingMarket(false);
      setShowResults(true);
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 z-10" suppressHydrationWarning>
        <Link href="/crm" className="mr-2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors inline-flex items-center gap-2" title="CRM & Histórico">
          <span className="text-sm font-semibold hidden md:inline">CRM</span>
        </Link>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </div>

      <Hero onSearch={handleSearch} isSearching={loading} />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showResults && (
        <section className="container mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">

          {/* Market Demand Card (Above Results) */}
          <div className="mb-8">
            <MarketDemandCard
              keyword={currentSearch.category || 'Lead'}
              location={currentSearch.location}
              volume={marketMetrics?.avgMonthlySearches}
              competition={marketMetrics?.competition}
              cpc={marketMetrics?.lowTopPageBid}
              loading={loadingMarket}
              error={marketError}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Resultados da Análise</h2>
            <span className="text-sm text-muted-foreground">Encontradas {businesses.length} Empresas</span>
          </div>
          <ResultsTable businesses={businesses} />

          <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground border border-dashed">
            <p>⚠️ Dica: Use a chave de API em Settings para resultados reais ilimitados.</p>
          </div>
        </section>
      )}
    </main>
  );
}
