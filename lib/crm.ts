import { CRMEntry } from './types';

const CRM_STORAGE_KEY = 'prospector_crm_data';

export const getCRMData = (): CRMEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CRM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const addCRMEntry = (entry: Omit<CRMEntry, 'status' | 'notes'>) => {
    if (typeof window === 'undefined') return;

    const existing = getCRMData();
    // Check if already exists to avoid duplicates (optional, or maybe we want a log of EVERY email?)
    // User asked for "monitoring report", suggesting strict entity tracking.
    // If sent multiple times, maybe update the date? Or allow duplicates? 
    // Let's UPDATE if exists, or ADD if new.

    const index = existing.findIndex(e => e.id === entry.id);

    if (index >= 0) {
        // Update existing interaction
        existing[index].contactDate = entry.contactDate;
        existing[index].email = entry.email; // Update email if different
        existing[index].leadScore = entry.leadScore; // Update score if changed directly
        localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));
    } else {
        // Create new
        const newEntry: CRMEntry = {
            ...entry,
            status: 'Contacted',
            notes: '',
        };
        localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify([newEntry, ...existing]));
    }
};

export const updateCRMStatus = (id: string, status: CRMEntry['status']) => {
    const data = getCRMData();
    const index = data.findIndex(e => e.id === id);
    if (index >= 0) {
        data[index].status = status;
        localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(data));
        return true;
    }
    return false;
};

export const updateCRMNotes = (id: string, notes: string) => {
    const data = getCRMData();
    const index = data.findIndex(e => e.id === id);
    if (index >= 0) {
        data[index].notes = notes;
        localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(data));
        return true;
    }
    return false;
};

export const deleteCRMEntry = (id: string) => {
    const data = getCRMData();
    const filtered = data.filter(e => e.id !== id);
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(filtered));
};
