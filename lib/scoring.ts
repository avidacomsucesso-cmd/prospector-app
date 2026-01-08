import { Business, LeadPriority } from './types';

export function calculateScore(data: Partial<Business>): { score: number; priority: LeadPriority; issues: string[] } {
    let score = 0;
    const issues: string[] = [];

    // 1. Website Check (+30)
    if (!data.website) {
        score += 30;
        issues.push('Nenhum site listado');
    }

    // 2. Review Count (+20)
    if ((data.reviewCount || 0) < 10) {
        score += 20;
        issues.push('Menos de 10 avaliações');
    } else if ((data.reviewCount || 0) < 50) {
        score += 10;
        issues.push('Baixo volume de avaliações (<50)');
    }

    // 3. Rating Check (+25)
    if (data.rating && data.rating < 3.8) {
        score += 25;
        issues.push('Avaliação abaixo de 3.8 estrelas');
    } else if (data.rating && data.rating < 4.2) {
        score += 10;
        issues.push('Avaliação pode ser melhorada (<4.2)');
    }

    // 4. Photos/Content (+10)
    if (!data.hasOwnerPhotos) {
        score += 10;
        issues.push('Faltam fotos do proprietário');
    }

    if (!data.hoursListed) {
        score += 10;
        issues.push('Faltam horários');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine Priority
    let priority: LeadPriority = 'LOW';
    if (score >= 60) priority = 'HIGH';
    else if (score >= 40) priority = 'MEDIUM';

    return { score, priority, issues };
}
