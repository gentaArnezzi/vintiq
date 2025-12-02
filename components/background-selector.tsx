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
    { id: 'vintage-paper', name: 'Vintage Paper', class: 'bg-[#fdfbf7] bg-[url("/noise.png")]' },
    { id: 'retro-grid', name: 'Retro Grid', class: 'bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px]' },
    { id: 'torn-paper', name: 'Torn Paper', class: 'bg-[#f5f1e8]' },
    { id: 'tape-edges', name: 'Tape Edges', class: 'bg-[#fef9e7]' },
    { id: 'folded-corners', name: 'Folded Corners', class: 'bg-[#faf8f3]' },
    { id: 'stained-paper', name: 'Stained Paper', class: 'bg-[#f9f6f0]' },
    { id: 'staples-edges', name: 'Staples Edges', class: 'bg-[#fdfbf7]' },
    { id: 'worn-vintage', name: 'Worn Vintage', class: 'bg-[#f4f0e6]' },
    { id: 'wood-texture', name: 'Wood Texture', class: 'bg-[#d4a574]' },
    { id: 'vintage-wood', name: 'Vintage Wood', class: 'bg-[#8b6f47]' },
    { id: 'camera-roll-film', name: 'Camera Roll Film', class: 'bg-[#1a1a1a]' },
    { id: 'aged-wood', name: 'Aged Wood', class: 'bg-[#6b5238]' },
    { id: 'weathered-wood', name: 'Weathered Wood', class: 'bg-[#5a4530]' },
    { id: 'barn-wood', name: 'Barn Wood', class: 'bg-[#7a5f42]' },
    { id: 'vintage-brown', name: 'Vintage Brown', class: 'bg-[#a0462d]' },
    { id: 'vintage-brown-textured', name: 'Vintage Brown Textured', class: 'bg-[#a0462d]' },
];

export default function BackgroundSelector({
    selectedBackground,
    onBackgroundChange,
}: BackgroundSelectorProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BACKGROUNDS.map((bg) => {
                const isSelected = selectedBackground === bg.id;
                // Dark backgrounds that need light text
                const darkBackgrounds: BackgroundStyle[] = [
                    'camera-roll-film',
                    'vintage-wood',
                    'aged-wood',
                    'weathered-wood',
                    'barn-wood',
                    'vintage-brown',
                    'vintage-brown-textured'
                ];
                const isDark = darkBackgrounds.includes(bg.id);

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
