'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
    "Advogados",
    "Agências de Real Estate",
    "Alojamento Local",
    "Barbearias",
    "Cabeleireiros",
    "Cafés",
    "Canalizadores",
    "Centros de Explicações / Apoio Escolar",
    "Centros de Estética",
    "Clínicas Dentárias",
    "Clínicas Estéticas",
    "Clínicas Médicas",
    "Contabilidade",
    "Eletricistas",
    "Empresas de Limpeza",
    "Escolas de Idiomas",
    "Escolas de Música",
    "Estúdios Criativos",
    "Estúdios de Fitness",
    "Estúdios de Fotografia",
    "Estúdios de Pilates",
    "Estúdios de Tatuagem",
    "Estúdios de Yoga",
    "Ginásios",
    "Grooming de Animais",
    "Hostels",
    "Imobiliárias",
    "Lavandarias",
    "Lojas de Bairro / Retalho Local",
    "Oficinas Automóveis",
    "Pastelarias",
    "Pequenos Hotéis",
    "Petshops",
    "Restaurantes",
    "Salões de Estética",
    "Serviços Automóveis"
].sort((a, b) => a.localeCompare(b));

const LOCATIONS = [
    "Alfama",
    "Almada",
    "Alvalade",
    "Amadora",
    "Anjos",
    "Arroios",
    "Avenidas Novas (Saldanha, Picoas, Av. da República)",
    "Baixa",
    "Beato",
    "Benfica",
    "Cacilhas",
    "Campo de Ourique",
    "Cascais",
    "Chiado",
    "Costa da Caparica",
    "Estoril",
    "Estrela",
    "Intendente",
    "Lapa",
    "Loures",
    "Marvila",
    "Mouraria",
    "Odivelas",
    "Oeiras",
    "Parque das Nações",
    "Restelo",
    "Santos",
    "Sintra",
    "Telheiras"
].sort((a, b) => a.localeCompare(b));

export function Hero({ onSearch, isSearching }: { onSearch: (category: string, location: string, directQuery?: string) => void; isSearching: boolean }) {
    const [searchMode, setSearchMode] = useState<'category' | 'name'>('category');
    const [directQuery, setDirectQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchMode === 'name') {
            if (!directQuery.trim()) return;
            onSearch('', '', directQuery);
        } else {
            // Get values from the select inputs (using IDs)
            const categoryElement = document.getElementById('category-select') as HTMLSelectElement;
            const locationElement = document.getElementById('location-select') as HTMLSelectElement;
            onSearch(categoryElement.value, locationElement.value);
        }
    };

    return (
        <div className="flex flex-col items-center text-center py-20 px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                CATBACK Prospector Pro
            </h1>
            <p className="text-muted-foreground max-w-xl mb-8 text-lg">
                Identifique oportunidades locais, automatize a qualificação de leads e gere abordagens em segundos.
            </p>

            {/* Search Type Toggle */}
            <div className="flex items-center bg-muted/50 p-1 rounded-full mb-6 border">
                <button
                    onClick={() => setSearchMode('category')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${searchMode === 'category' ? 'bg-primary shadow text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Por Categoria
                </button>
                <button
                    onClick={() => setSearchMode('name')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${searchMode === 'name' ? 'bg-primary shadow text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Por Nome Específico
                </button>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-card border p-2 rounded-full shadow-lg flex flex-col md:flex-row items-center transition-all focus-within:ring-2 ring-primary/20 gap-2 md:gap-0">

                {searchMode === 'category' ? (
                    <>
                        <div className="flex-1 w-full px-4">
                            <select
                                id="category-select"
                                className="w-full bg-transparent border-none focus:ring-0 py-3 outline-none text-foreground dark:bg-card"
                                defaultValue={CATEGORIES[0]}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-border mx-2"></div>
                        <div className="w-full md:hidden h-px bg-border my-2"></div>

                        <div className="flex-1 w-full px-4">
                            <select
                                id="location-select"
                                className="w-full bg-transparent border-none focus:ring-0 py-3 outline-none text-foreground dark:bg-card"
                                defaultValue="Campo de Ourique"
                            >
                                {LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 w-full px-4">
                        <input
                            type="text"
                            placeholder="Digite o nome da empresa e local (ex: Café Império Lisboa)"
                            className="w-full bg-transparent border-none focus:ring-0 py-3 outline-none text-foreground placeholder:text-muted-foreground"
                            value={directQuery}
                            onChange={(e) => setDirectQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                <button
                    disabled={isSearching}
                    type="submit"
                    className="w-full md:w-auto bg-primary text-primary-foreground rounded-full px-8 py-3 font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {isSearching ? 'Analisando...' : <><Search size={18} /> Analisar</>}
                </button>
            </form>
        </div>
    );
}
