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
    { id: 'vintage-brown', name: 'Rustic Terracotta', class: 'bg-[#a0462d]' },
    { id: 'vintage-brown-textured', name: 'Weathered Rust', class: 'bg-[#a0462d]' },
    { id: 'vintage-brown-brick', name: 'Brick Wall', class: 'bg-[#a0462d]' },
    { id: 'christmas-theme', name: 'Christmas Theme', class: 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]' },
    { id: 'christmas-red-theme', name: 'Christmas Red', class: 'bg-gradient-to-br from-[#7a0f0f] via-[#8b1a1a] to-[#6b0a0a]' },
    { id: 'pilates-theme', name: 'Pilates Theme', class: 'bg-gradient-to-br from-[#fce4ec] via-[#f8bbd0] to-[#f48fb1]' },
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
                    'vintage-brown-textured',
                    'vintage-brown-brick',
                    'christmas-theme',
                    'christmas-red-theme'
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

                        {/* Stickers Preview - only for themed backgrounds */}
                        {(bg.id === 'christmas-theme' || bg.id === 'christmas-red-theme') && (
                            <>
                                {/* Small stickers in corners */}
                                <img 
                                    src="/christmas1.png" 
                                    alt="" 
                                    className="absolute top-0.5 left-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/christmast2.png" 
                                    alt="" 
                                    className="absolute top-0.5 right-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/christmast3.png" 
                                    alt="" 
                                    className="absolute bottom-0.5 left-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/christmast4.png" 
                                    alt="" 
                                    className="absolute bottom-0.5 right-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                
                                {/* Small snowflakes scattered around */}
                                <svg className="absolute top-2 left-1/4 w-3 h-3 text-white/70" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 0 L10 4 M10 16 L10 20 M0 10 L4 10 M16 10 L20 10 M2.93 2.93 L5.66 5.66 M14.34 14.34 L17.07 17.07 M2.93 17.07 L5.66 14.34 M14.34 5.66 L17.07 2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                                </svg>
                                <svg className="absolute top-3 right-1/3 w-2.5 h-2.5 text-white/60" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 0 L10 4 M10 16 L10 20 M0 10 L4 10 M16 10 L20 10 M2.93 2.93 L5.66 5.66 M14.34 14.34 L17.07 17.07 M2.93 17.07 L5.66 14.34 M14.34 5.66 L17.07 2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                                </svg>
                                <svg className="absolute bottom-2 left-1/3 w-3 h-3 text-white/65" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 0 L10 4 M10 16 L10 20 M0 10 L4 10 M16 10 L20 10 M2.93 2.93 L5.66 5.66 M14.34 14.34 L17.07 17.07 M2.93 17.07 L5.66 14.34 M14.34 5.66 L17.07 2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                                </svg>
                                <svg className="absolute bottom-3 right-1/4 w-2.5 h-2.5 text-white/55" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 0 L10 4 M10 16 L10 20 M0 10 L4 10 M16 10 L20 10 M2.93 2.93 L5.66 5.66 M14.34 14.34 L17.07 17.07 M2.93 17.07 L5.66 14.34 M14.34 5.66 L17.07 2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                                </svg>
                            </>
                        )}

                        {/* Pilates Stickers Preview - only for Pilates theme */}
                        {bg.id === 'pilates-theme' && (
                            <>
                                {/* Small stickers in corners */}
                                <img 
                                    src="/pilates1.png" 
                                    alt="" 
                                    className="absolute top-0.5 right-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/pilates2.png" 
                                    alt="" 
                                    className="absolute top-0.5 left-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/pilates3.png" 
                                    alt="" 
                                    className="absolute bottom-0.5 right-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                                <img 
                                    src="/pilates4.png" 
                                    alt="" 
                                    className="absolute bottom-0.5 left-0.5 w-5 h-5 opacity-90 object-contain"
                                />
                            </>
                        )}

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
