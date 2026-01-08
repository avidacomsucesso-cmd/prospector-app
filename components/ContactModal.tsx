import { Business } from '@/lib/types';
import { X, MapPin, Phone, Globe, Mail, MessageCircle, Navigation } from 'lucide-react';

interface ContactModalProps {
    business: Business;
    onClose: () => void;
}

export function ContactModal({ business, onClose }: ContactModalProps) {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Detalhes do Lead</h3>
                        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary font-bold text-2xl border-2 border-primary/20">
                                {business.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold">{business.name}</h2>
                            <p className="text-sm text-muted-foreground">{business.category}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                <MapPin className="text-primary mt-0.5" size={18} />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">Endereço</p>
                                    <p className="text-muted-foreground">{business.address}</p>
                                    {business.googleMapsLink && (
                                        <a href={business.googleMapsLink} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                            <Navigation size={12} /> Ver no Google Maps
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Phone className="text-green-500" size={18} />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">Telefone</p>
                                    <p className="text-muted-foreground">{business.phone || 'Não disponível'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Globe className="text-blue-500" size={18} />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">Website</p>
                                    {business.website ? (
                                        <a href={business.website} target="_blank" className="text-blue-500 hover:underline">{business.website}</a>
                                    ) : (
                                        <span className="text-orange-500/80 italic">Sem website registado</span>
                                    )}
                                </div>
                            </div>

                            {/* Placeholders for Email/WhatsApp as API doesn't provide them directly typically, but user asked for them */}
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-50">
                                <Mail className="text-purple-500" size={18} />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">Email</p>
                                    <p className="text-muted-foreground italic">Não disponível publicamente</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-50">
                                <MessageCircle className="text-green-600" size={18} />
                                <div className="text-sm">
                                    <p className="font-semibold text-foreground">WhatsApp</p>
                                    <p className="text-muted-foreground italic">Não identificado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-muted/20 text-center">
                        <button onClick={onClose} className="text-sm text-primary hover:underline font-medium">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
