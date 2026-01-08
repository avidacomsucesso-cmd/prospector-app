'use client';
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SettingsModal({ onClose }: { onClose: () => void }) {
    const [apiKey, setApiKey] = useState('');
    const [gmailUser, setGmailUser] = useState('');
    const [gmailPass, setGmailPass] = useState('');

    useEffect(() => {
        const key = localStorage.getItem('google_places_api_key');
        if (key) setApiKey(key);

        const storedGmailUser = localStorage.getItem('gmail_user');
        if (storedGmailUser) setGmailUser(storedGmailUser);

        const storedGmailPass = localStorage.getItem('gmail_app_password');
        if (storedGmailPass) setGmailPass(storedGmailPass);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = () => {
        localStorage.setItem('google_places_api_key', apiKey);
        localStorage.setItem('gmail_user', gmailUser);
        localStorage.setItem('gmail_app_password', gmailPass);
        onClose();
        window.location.reload(); // Reload to apply changes if needed specifically for key
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md border rounded-xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Definições</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Google Places API Key</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 ring-primary/20 outline-none transition-all"
                            placeholder="AIza..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Necessária para procurar locais reais.</p>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-sm">Configuração de Email (Nodemailer)</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Gmail</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 ring-primary/20 outline-none transition-all"
                                placeholder="seu.email@gmail.com"
                                value={gmailUser}
                                onChange={(e) => setGmailUser(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Senha de App (App Password)</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 ring-primary/20 outline-none transition-all"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={gmailPass}
                                onChange={(e) => setGmailPass(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Crie uma Senha de App em: <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-500 underline">myaccount.google.com/apppasswords</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2 -mx-6 -mb-6 rounded-b-xl mt-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm hover:underline text-muted-foreground">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
                        <Save size={16} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
