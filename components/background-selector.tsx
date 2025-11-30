'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BackgroundStyle } from '@/lib/canvas-generator';

interface BackgroundSelectorProps {
    selectedBackground: BackgroundStyle;
    onBackgroundChange: (bg: BackgroundStyle) => void;
}

const BACKGROUNDS: { id: BackgroundStyle; name: string; class: string }[] = [
    { id: 'classic-cream', name: 'Classic Cream', class: 'bg-[#FFF8E7]' },
    { id: 'film-noir', name: 'Film Noir', class: 'bg-[#1a1a1a]' },
    { id: 'vintage-paper', name: 'Vintage Paper', class: 'bg-[#fdfbf7] bg-[url("/noise.png")]' },
    { id: 'retro-grid', name: 'Retro Grid', class: 'bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px]' },
    { id: 'soft-pink', name: 'Soft Pink', class: 'bg-[#fce7f3]' },
    { id: 'sage-green', name: 'Sage Green', class: 'bg-[#e2e8f0]' },
];

export default function BackgroundSelector({
    selectedBackground,
    onBackgroundChange,
}: BackgroundSelectorProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BACKGROUNDS.map((bg) => {
                const isSelected = selectedBackground === bg.id;
                const isDark = bg.id === 'film-noir';

                return (
                    <button
                        key={bg.id}
                        onClick={() => onBackgroundChange(bg.id)}
                        className={cn(
                            "relative h-16 rounded-lg border transition-all duration-200 overflow-hidden group",
                            isSelected
                                ? "ring-2 ring-stone-900 ring-offset-2 border-transparent"
                                : "border-stone-200 hover:border-stone-300"
                        )}
                    >
                        {/* Background Preview */}
                        <div className={cn("absolute inset-0", bg.class)} />

                        {/* Label */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
                            <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm",
                                isDark ? "bg-white/20 text-white" : "bg-white/60 text-stone-800"
                            )}>
                                {bg.name}
                            </span>
                        </div>

                        {isSelected && (
                            <div className="absolute top-1 right-1 bg-stone-900 text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
