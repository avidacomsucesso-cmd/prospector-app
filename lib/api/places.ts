import { Business } from '@/lib/types';
import { calculateScore } from '@/lib/scoring';

export async function searchBusinesses(category: string, location: string, directQuery?: string): Promise<Business[]> {
    let apiKey = '';
    if (typeof window !== 'undefined') {
        apiKey = localStorage.getItem('google_places_api_key') || '';
    }

    if (!apiKey) {
        // console.warn("No client-side API Key found, relying on server-side env vars.");
    }

    try {
        // Debug Logging - Client Side
        const log = (msg: string) => console.log(`[DEBUG_RANKING] ${msg}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        let targetBusinessId: string | null = null;
        let inferredCategory = category;
        let inferredLocation = location;

        // 1. DIRECT SEARCH MODE logic
        if (directQuery) {
            // A. Fetch the specific business first
            const directResponse = await fetch(`/api/places?query=${encodeURIComponent(directQuery)}&key=${apiKey}`);
            const directData = await directResponse.json();

            if (directData.error || !directData.places || directData.places.length === 0) {
                console.warn("Direct search found no results.");
                return [];
            }

            const targetPlace = directData.places[0];
            targetBusinessId = targetPlace.id;

            // Log Target Details
            log(`Target: ${targetPlace.displayName?.text} (${targetBusinessId})`);
            log(`Target Types: ${JSON.stringify(targetPlace.types)}`);
            log(`DirectQuery: ${directQuery}`);

            // ... (keep heuristic logic)
            if (targetPlace.formattedAddress) {
                const parts = targetPlace.formattedAddress.split(',');
                if (parts.length >= 2) {
                    const cityPart = parts[parts.length - 2].trim();
                    const extractedLocation = cityPart.replace(/^\d{4}-\d{3}\s+/, '');

                    // Only overwrite if current location is empty OR extracted location is more specific
                    // For now, let's keep the user's location if it's already set and not "Unknown"
                    if (!inferredLocation || inferredLocation === 'Unknown' || inferredLocation === '') {
                        inferredLocation = extractedLocation || inferredLocation;
                    }
                }
            }

            // Map Google Types...
            if (targetPlace.types || directQuery) {
                // ... (existing mapping logic)
                const types = targetPlace.types || [];
                const nameLower = (targetPlace.displayName?.text || '').toLowerCase();
                const queryLower = (directQuery || '').toLowerCase();

                if (types.includes('dentist') || types.includes('dental_clinic') || nameLower.includes('dentista') || nameLower.includes('clínica dentária')) inferredCategory = 'Clínicas Dentárias';
                else if (types.includes('barber_shop') || nameLower.includes('barbearia') || queryLower.includes('barbearia')) inferredCategory = 'Barbearias';
                else if (types.includes('hair_salon') || nameLower.includes('cabeleireiro') || queryLower.includes('cabeleireiro')) inferredCategory = 'Cabeleireiros';
                else if (types.includes('beauty_salon') || types.includes('beautician') || types.includes('spa') || nameLower.includes('estética') || queryLower.includes('estética')) {
                    if (nameLower.includes('clínica') || queryLower.includes('clínica') || nameLower.includes('clinic') || queryLower.includes('clinic')) inferredCategory = 'Clínica de Estética';
                    else inferredCategory = 'Centro de Estética';
                }
                // ... (rest of mapping)
                else if (types.includes('doctor') || types.includes('physiotherapist') || types.includes('health') || nameLower.includes('clínica médica') || nameLower.includes('médico')) inferredCategory = 'Clínicas Médicas';
                else if (types.includes('restaurant') || types.includes('food') || nameLower.includes('restaurante')) inferredCategory = 'Restaurantes';
                else if (types.includes('cafe') || nameLower.includes('café') || queryLower.includes('cafe')) inferredCategory = 'Cafés';
                else if (types.includes('bakery') || nameLower.includes('pastelaria')) inferredCategory = 'Pastelarias';
                else if (types.includes('accounting') || nameLower.includes('contabilidade')) inferredCategory = 'Contabilidade';
                else if (types.includes('lawyer') || nameLower.includes('advogado')) inferredCategory = 'Advogados';
                else if (types.includes('plumber') || nameLower.includes('canalizador')) inferredCategory = 'Canalizadores';
                else if (types.includes('electrician') || nameLower.includes('eletricista')) inferredCategory = 'Eletricistas';
                else if (types.includes('gym') || nameLower.includes('ginásio') || queryLower.includes('ginasio') || queryLower.includes('fitness')) inferredCategory = 'Ginásios';
                else if (nameLower.includes('pilates') || queryLower.includes('pilates')) inferredCategory = 'Estúdios de Pilates';
                else if (nameLower.includes('yoga') || queryLower.includes('yoga')) inferredCategory = 'Estúdios de Yoga';
                else if (types.includes('real_estate_agency') || nameLower.includes('imobiliária')) inferredCategory = 'Imobiliárias';
                else if (types.includes('car_repair') || nameLower.includes('oficina') || queryLower.includes('oficina')) inferredCategory = 'Oficinas Automóveis';
                else if (types.includes('car_wash') || nameLower.includes('lavagem auto')) inferredCategory = 'Serviços Automóveis';
                else if (types.includes('laundry') || nameLower.includes('lavandaria')) inferredCategory = 'Lavandarias';
                else if (nameLower.includes('limpeza') || queryLower.includes('limpeza')) inferredCategory = 'Empresas de Limpeza';
                else if (nameLower.includes('tatuagem') || nameLower.includes('tattoo')) inferredCategory = 'Estúdios de Tatuagem';
                else if (nameLower.includes('fotografia') || nameLower.includes('studio')) inferredCategory = 'Estúdios de Fotografia';
                else if (types.includes('pet_store') || nameLower.includes('pet shop')) inferredCategory = 'Petshops';
                else if (nameLower.includes('grooming') || nameLower.includes('tosquias')) inferredCategory = 'Grooming de Animais';
                else if (nameLower.includes('música') || nameLower.includes('music school')) inferredCategory = 'Escolas de Música';
                else if (nameLower.includes('idiomas') || nameLower.includes('language')) inferredCategory = 'Escolas de Idiomas';
                else if (nameLower.includes('explicações') || nameLower.includes('apoio escolar')) inferredCategory = 'Centros de Explicações / Apoio Escolar';
                else if (types.includes('lodging') || types.includes('hotel') || nameLower.includes('hotel') || nameLower.includes('hostel')) {
                    if (nameLower.includes('hostel')) inferredCategory = 'Hostels';
                    else if (nameLower.includes('alojamento')) inferredCategory = 'Alojamento Local';
                    else inferredCategory = 'Pequenos Hotéis';
                }
                else if (types.includes('store') || nameLower.includes('loja') || nameLower.includes('mercado')) inferredCategory = 'Lojas de Bairro / Retalho Local';
            }

            // Fallback: If inferredCategory is still empty OR same as start, use API primaryType
            if (inferredCategory === category && targetPlace.primaryType) {
                // Convert "dental_clinic" to "dental clinic"
                inferredCategory = targetPlace.primaryType.replace(/_/g, ' ');
            }
            // If still empty, default to "Establishment"
            if (!inferredCategory) inferredCategory = 'Establishment';


            log(`Inferred Category: ${inferredCategory}`);
            log(`Inferred Location: ${inferredLocation}`);

            // C. Benchmark Search (The "Real" Market Search) - with Pagination
            const benchmarkQuery = `${inferredCategory} em ${inferredLocation}`;
            log(`Benchmark Query: ${benchmarkQuery}`);

            // Fetch up to 5 pages (approx 100 results) to find true rank
            let totalFetched = 0;
            let nextPageToken: string | undefined = undefined;
            let realRankIndex = -1;
            const MAX_PAGES = 5;

            for (let i = 0; i < MAX_PAGES; i++) {
                let url = `/api/places?query=${encodeURIComponent(benchmarkQuery)}&key=${apiKey}`;
                if (nextPageToken) url += `&pageToken=${encodeURIComponent(nextPageToken)}`;

                log(`Fetching Page ${i + 1}...`);

                const benchmarkResponse = await fetch(url);
                const benchmarkData = await benchmarkResponse.json();

                log(`PageToken present: ${!!benchmarkData.nextPageToken}`);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pageResults = (benchmarkData.places || []).filter((p: any) => {
                    return !p.types?.includes('locality') && !p.types?.includes('political') && !p.types?.includes('administrative_area_level_1') && !p.types?.includes('administrative_area_level_2');
                });

                log(`Page ${i + 1} Results: ${pageResults.length}`);
                if (pageResults.length > 0) log(`First Result: ${pageResults[0].displayName?.text}`);

                // Check if target is in this page
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const foundIndex = pageResults.findIndex((p: any) => p.id === targetBusinessId);

                if (foundIndex !== -1) {
                    realRankIndex = totalFetched + foundIndex;
                    log(`Found target at index ${foundIndex} (Total Rank: ${realRankIndex + 1})`);
                    // If found, we can stop fetching IF we just want the rank. 
                    // But if we want to populate the table with competitors, we might want at least Page 1 filled.
                    // For now, let's collect results to display.
                }

                results = [...results, ...pageResults];
                totalFetched += pageResults.length;

                nextPageToken = benchmarkData.nextPageToken;
                if (!nextPageToken || foundIndex !== -1) break; // Stop if end of list OR found (optimization: stop separate fetching if found, but we keep results)

                // Google Places API requires a short delay before the next_page_token is valid
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // If found, we broke. If not found and token exists, loop continues after delay.
            }

            // D. Determine Rank (already done in loop) - Logic check
            // If realRankIndex is still -1, it means we didn't find it in the top N pages.

            // E. Handle Target Display
            if (realRankIndex === -1) {
                // If not found in the fetched pages, it implies rank is > totalFetched
                // We use a high fallback to avoid the "21" trap if only 1 page was fetched
                targetPlace.inferredRank = totalFetched > 20 ? totalFetched + 1 : 101;
                results.unshift(targetPlace);
            } else {
                // Found in the list.
                // If it's deep in the list (e.g. Page 2), it's already in 'results'.
                // We want to bring it to top for UI visibility but keep its Rank property correct.

                // Find it in the accumulated 'results' array (re-find to be safe as page boundaries might differ after filter)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const indexInRefinedList = results.findIndex((p: any) => p.id === targetBusinessId);

                if (indexInRefinedList !== -1) {
                    const targetItem = results.splice(indexInRefinedList, 1)[0];
                    targetItem.inferredRank = realRankIndex + 1; // 1-based Rank
                    results.unshift(targetItem);
                } else {
                    // Start case fallback (Should be rare if foundIndex != -1)
                    targetPlace.inferredRank = totalFetched + 1;
                    results.unshift(targetPlace);
                }
            }

        } else {
            // 2. STANDARD SEARCH MODE
            const queryText = category + ' in ' + location;
            const response = await fetch(`/api/places?query=${encodeURIComponent(queryText)}&key=${apiKey}`);
            const data = await response.json();
            if (data.error) {
                console.error("API Error:", data.error);
                console.error(`Google API Error: ${data.error}`);
                return [];
            }
            results = data.places || [];
        }

        // Transform New Google Places API (v1) Results to Business Model
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const businessList = results.map((place: any, index: number) => {
            // If we did a direct search, we might have set an inferredRank property manually on the appended item
            // OR if we moved it, we set it.
            // For standard search, rank is index + 1.
            // For direct search:
            // - The first item is ALWAYS the target.
            // - Subsequent items are competitors.
            // Be careful: if we re-sort by leadScore later, we lose this 'First Item' privilege unless we flag it.

            // Actually, if we want to visualize 'Target' then 'Competitors', we should probably NOT sort by Lead Score for Direct Search?
            // Or we just flag it as 'isSearchTarget'.

            const rank = place.inferredRank || (directQuery && index === 0 ? place.inferredRank : index + 1);
            // rank used in following logic implicitly if we needed it, but here we just use index+1 or inferred.
            // Actually 'rank' var is unused in the mapping below, we use 'place.inferredRank' directly.
            // Let's keep it if we need to debug, or suppress if unused.
            // Suppressing unused var warning for build.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _unusedRank = rank;

            const businessData: Partial<Business> = {
                id: place.id,
                name: place.displayName?.text || 'Unknown',
                category: inferredCategory,
                address: place.formattedAddress,
                rating: place.rating || 0,
                reviewCount: place.userRatingCount || 0,
                hasOwnerPhotos: (place.photos?.length || 0) > 0,
                hoursListed: !!place.regularOpeningHours,
                website: place.websiteUri,
                phone: place.nationalPhoneNumber,
                phoneListed: !!place.nationalPhoneNumber,
                googleMapsLink: place.googleMapsUri,
                googleMapsRank: place.inferredRank || (index + 1) // Crucial: Use inferredRank if available (for Target)
            };

            const scoreResult = calculateScore(businessData);
            const insights = generateRankingInsights(businessData.googleMapsRank!, scoreResult.score, businessData.reviewCount || 0, businessData.rating || 0);

            return {
                ...businessData,
                leadScore: scoreResult.score,
                priority: scoreResult.priority,
                issues: scoreResult.issues,
                rankingInsights: insights,
                hasOwnerPhotos: businessData.hasOwnerPhotos!,
                isClaimed: true,
                hoursListed: businessData.hoursListed!,
                phoneListed: businessData.phoneListed!,
                googleMapsRank: businessData.googleMapsRank!,
                phone: businessData.phone,
                googleMapsLink: businessData.googleMapsLink,
                outreachPitch: generatePitch(businessData.name || '', scoreResult.issues, insights, businessData.googleMapsRank!),
                isSearchTarget: directQuery && index === 0 // Flag to identify the target
            } as Business;
        });

        // Sorting behavior:
        // Standard: Sort by Lead Score.
        // Direct: KEEP Target at top, sort others by Lead Score?
        if (directQuery) {
            const [target, ...competitors] = businessList;
            competitors.sort((a: Business, b: Business) => b.leadScore - a.leadScore);
            return [target, ...competitors];
        } else {
            return businessList.sort((a: Business, b: Business) => b.leadScore - a.leadScore);
        }

    } catch (error) {
        console.error("Failed to fetch businesses", error);
        return [];
    }
}

function generateRankingInsights(mapsRank: number, score: number, reviewCount: number, rating: number): string[] {
    const insights: string[] = [];

    // Maps Context
    if (mapsRank <= 3) {
        insights.push("🔥 Top 3 no Google Maps (Local Pack por Proximidade)");
    } else if (mapsRank > 60) {
        insights.push("⚠️ Fora do Top 60 no Google Maps (Invisível na pesquisa local)");
    } else {
        insights.push(`📍 Posição #${mapsRank} no Google Maps`);
    }

    // Proximity vs Prominence Analysis
    if (mapsRank <= 5 && score < 50) {
        insights.push("⚠️ Bom ranking local (proximidade) mas perfil digital fraco. Risco de perder clientes para concorrentes mais distantes com melhor reputação.");
    }

    // Search Authority Prediction
    if (reviewCount > 50 && rating >= 4.5) {
        insights.push("💎 Alta Autoridade: Provável bom posicionamento no Google Search (Orgânico).");
    } else if (reviewCount < 10) {
        insights.push("📉 Baixa Autoridade: Dificilmente aparecerá no Google Search (que prioriza os 'Especialistas' da cidade).");
    }

    return insights;
}

function generatePitch(name: string, issues: string[], insights: string[], mapsRank: number): string {
    // Pitch based on User's provided Knowledge Base (Maps vs Search)

    // Case 1: High potential but ignored by Google Search (Low Reviews)
    if (issues.includes('Menos de 10 avaliações') || issues.includes('Baixo volume de avaliações (<50)')) {
        return `Olá! Vi que o ${name} aparece bem para quem está muito perto (Maps), mas provavelmente o Google Search ignora-vos para clientes de outros bairros porque prioriza locais com mais avaliações. Tenho uma estratégia para aumentar a vossa autoridade e aparecerem como "Melhor Opção" da cidade.`;
    }

    // Case 2: Bad Maps Presence (Address/Profile issues)
    if (mapsRank > 10 && issues.includes('Faltam horários') || issues.includes('Faltam fotos do proprietário')) {
        return `Olá! O ${name} está a perder visibilidade no Google Maps para concorrentes com perfis mais completos. Preencher a ficha corretamente é o passo #1 para aparecer no topo do mapa. Posso resolver isso hoje.`;
    }

    // Case 3: Good Scores but no Website (Search Ranking killer)
    if (issues.includes('Nenhum site listado')) {
        return `Olá! Parabéns pelas vossas avaliações! Mas notaram que sem site, o Google Search tem dificuldade em recomendar-vos como autoridade na área? Um site simples ajudaria a captar aquele cliente que pesquisa "melhor ${name} na cidade" em vez de "perto de mim".`;
    }

    // Fallback based on generic issues
    if (issues.includes('Avaliação Baixa (<4.5)')) {
        return `Olá! Sou especialista em gestão de reputação. Notei que a nota do ${name} podia ser melhor para atrair mais turistas. Posso ajudar a gerir isso.`;
    }

    // General high performance
    return `Olá! O ${name} tem um excelente potencial. Gostaria de apresentar uma estratégia para consolidar a vossa liderança tanto no Mapa (vizinhança) quanto na Pesquisa (cidade toda).`;
}
