'use client';
import { cn } from '@/lib/utils';

export function LeadScore({ score }: { score: number }) {
    let color = 'text-green-500 border-green-500';
    if (score >= 60) color = 'text-red-500 border-red-500';
    else if (score >= 40) color = 'text-yellow-500 border-yellow-500';

    return (
        <div className={cn("relative flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-lg", color)}>
            {score}
        </div>
    );
}
