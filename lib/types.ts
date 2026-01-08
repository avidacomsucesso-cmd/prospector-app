export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CRMEntry {
    id: string; // Business ID
    businessName: string;
    contactDate: string; // ISO String
    status: 'Contacted' | 'Replied' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    notes: string;
    email: string; // The email used for contact
    city: string; // Relevant for context
    leadScore: number;
}

export interface Business {
    id: string;
    name: string;
    category: string;
    address: string;
    website?: string;
    rating: number;
    reviewCount: number;
    hasOwnerPhotos: boolean;
    isClaimed: boolean;
    hoursListed: boolean;
    phoneListed: boolean;
    issues: string[]; // List of identified deficits
    leadScore: number;
    priority: LeadPriority;
    outreachPitch: string;
    googleMapsRank: number;
    googleSearchRank?: number; // Optional, for future expansion or manual entry
    rankingInsights?: string[]; // Generated advice based on rank vs score
    phone?: string;
    googleMapsLink?: string;
    email?: string;
}

export interface SearchParams {
    category: string;
    location: string;
}
