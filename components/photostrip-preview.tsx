'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { generatePhotostrip, type BackgroundStyle, type LayoutType } from '@/lib/canvas-generator';
import type { FilterType } from '@/lib/image-filters';
import LivePhotoPreview from './live-photo-preview';
import { applyFilter } from '@/lib/image-filters';

interface PhotostripPreviewProps {
    photos: (string | null)[];
    livePhotos?: (Blob | null)[];
    currentSlot: number;
    onRemovePhoto?: (index: number) => void;
    maxPhotos?: number;
    filter: FilterType;
    background: BackgroundStyle;
    layout: LayoutType;
    customText?: string;
}

export default function PhotostripPreview({
    photos,
    livePhotos = [],
    currentSlot,
    onRemovePhoto,
    maxPhotos = 4,
    filter,
    background,
    layout,
    customText = '',
}: PhotostripPreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate preview whenever dependencies change
    useEffect(() => {
        let active = true;

        const generate = async () => {
            setIsGenerating(true);
            try {
                const canvas = await generatePhotostrip({
                    photos,
                    filter,
                    layout,
                    background,
                    customText
                });

                if (active) {
                    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for faster preview
                }
            } catch (error) {
                console.error('Preview generation failed:', error);
            } finally {
                if (active) setIsGenerating(false);
            }
        };

        // Debounce slightly to avoid rapid re-renders
        const timer = setTimeout(generate, 100);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [photos, filter, background, maxPhotos, layout]);

    // Calculate overlay positions dynamically based on photo count
    // Constants: PHOTO_HEIGHT = 390px, PADDING_TOP = 60px, GAP = 30px, BOTTOM_SPACE = 120px
    // Calculate overlay positions dynamically based on layout
    const calculateOverlayPositions = (layout: LayoutType) => {
        // Grid 2x2 Layout
        if (layout === 'grid-2x2') {
            const STRIP_WIDTH = 800;
            const PHOTO_SIZE = 350;
            const GAP = 30;
            const PADDING = 40;
            const BOTTOM_SPACE = 120;

            // Determine how many photos based on maxPhotos
            const photoCount = maxPhotos;
            const cols = 2;
            const rows = photoCount <= 2 ? 1 : 2;
            const TOTAL_HEIGHT = PADDING + (PHOTO_SIZE * rows) + (GAP * (rows - 1)) + BOTTOM_SPACE;

            return Array.from({ length: photoCount }, (_, i) => {
                let x = 0;
                let y = 0;

                if (photoCount === 3) {
                    // Special layout for 3 photos:
                    // 0: Top Left
                    // 1: Bottom Left  
                    // 2: Right (Centered Vertically)
                    if (i === 0) {
                        x = PADDING;
                        y = PADDING;
                    } else if (i === 1) {
                        x = PADDING;
                        y = PADDING + PHOTO_SIZE + GAP;
                    } else if (i === 2) {
                        x = PADDING + PHOTO_SIZE + GAP;
                        y = PADDING + (PHOTO_SIZE / 2) + (GAP / 2);
                    }
                } else {
                    // Standard Grid (2 or 4)
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    x = PADDING + col * (PHOTO_SIZE + GAP);
                    y = PADDING + row * (PHOTO_SIZE + GAP);
                }

                const leftPercent = (x / STRIP_WIDTH) * 100;
                const topPercent = (y / TOTAL_HEIGHT) * 100;
                const widthPercent = (PHOTO_SIZE / STRIP_WIDTH) * 100;
                const heightPercent = (PHOTO_SIZE / TOTAL_HEIGHT) * 100;

                return {
                    left: `${leftPercent.toFixed(1)}%`,
                    top: `${topPercent.toFixed(1)}%`,
                    width: `${widthPercent.toFixed(1)}%`,
                    height: `${heightPercent.toFixed(1)}%`
                };
            });
        }

        // Polaroid Layout
        if (layout === 'polaroid') {
            const CARD_WIDTH = 600;
            const PHOTO_WIDTH = 520;
            const PHOTO_HEIGHT = 520;
            const PADDING_TOP = 40;
            const BOTTOM_SPACE = 160;
            const TOTAL_HEIGHT = PADDING_TOP + PHOTO_HEIGHT + BOTTOM_SPACE;
            const PADDING_X = (CARD_WIDTH - PHOTO_WIDTH) / 2;

            // Only 1 photo for polaroid
            const leftPercent = (PADDING_X / CARD_WIDTH) * 100;
            const topPercent = (PADDING_TOP / TOTAL_HEIGHT) * 100;
            const widthPercent = (PHOTO_WIDTH / CARD_WIDTH) * 100;
            const heightPercent = (PHOTO_HEIGHT / TOTAL_HEIGHT) * 100;

            return [{
                left: `${leftPercent.toFixed(1)}%`,
                top: `${topPercent.toFixed(1)}%`,
                width: `${widthPercent.toFixed(1)}%`,
                height: `${heightPercent.toFixed(1)}%`
            }];
        }

        // Vertical Strip Layouts
        const count = layout === 'vertical-2' ? 2 : layout === 'vertical-3' ? 3 : 4;
        const STRIP_WIDTH = 600;
        const PHOTO_WIDTH = 520;
        const PHOTO_HEIGHT = 390;
        const PADDING_TOP = 60;
        const GAP = 30;
        const BOTTOM_SPACE = 120;
        const totalHeight = PADDING_TOP + (PHOTO_HEIGHT * count) + (GAP * (count - 1)) + BOTTOM_SPACE;
        const PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2;

        const leftPercent = (PADDING_X / STRIP_WIDTH) * 100;
        const widthPercent = (PHOTO_WIDTH / STRIP_WIDTH) * 100;

        return Array.from({ length: count }, (_, i) => {
            const photoTop = PADDING_TOP + i * (PHOTO_HEIGHT + GAP);
            const topPercent = (photoTop / totalHeight) * 100;
            const heightPercent = (PHOTO_HEIGHT / totalHeight) * 100;
            return {
                left: `${leftPercent.toFixed(1)}%`,
                top: `${topPercent.toFixed(1)}%`,
                width: `${widthPercent.toFixed(1)}%`,
                height: `${heightPercent.toFixed(1)}%`
            };
        });
    };

    const overlayPositions = calculateOverlayPositions(layout);

    // Map filter type to CSS filter string for video preview
    // Updated to match pixel-based filters more closely
    // Note: VintageJS filters use complex effects that can't be fully replicated with CSS
    const getFilterStyle = (type: FilterType): string => {
        switch (type) {
            case 'vintiq-warm':
                // Red boost, blue reduce, warm overlay
                return 'sepia(0.15) saturate(1.15) brightness(1.08) contrast(0.95)';
            case 'sepia-classic':
                // Traditional sepia
                return 'sepia(0.8) contrast(0.9)';
            case 'mono-film':
                // Grayscale with contrast
                return 'grayscale(1) contrast(1.1)';
            case 'polaroid-fade':
                // Fade with blue tint
                return 'brightness(1.1) contrast(0.9) saturate(0.85) hue-rotate(5deg)';
            case 'kodak-gold':
                // Warm yellow tones
                return 'sepia(0.1) saturate(1.2) brightness(1.05) contrast(1.05)';
            case 'fuji-superia':
                // Cool greens and magenta
                return 'saturate(1.1) hue-rotate(-8deg) contrast(1.02)';
            case 'drama-bw':
                // High contrast B&W
                return 'grayscale(1) contrast(1.3) brightness(1.05)';
            case 'cinematic-cool':
                // Teal and orange
                return 'saturate(1.15) hue-rotate(-5deg) contrast(1.1) brightness(1.05)';
            // VintageJS filters - approximate CSS representation
            case 'vintagejs-classic':
                return 'sepia(0.5) saturate(0.7) brightness(0.9) contrast(1.15)';
            case 'vintagejs-sepia':
                return 'sepia(0.8) saturate(0.5) brightness(0.85) contrast(1.2)';
            case 'vintagejs-bright':
                return 'brightness(1.1) saturate(0.8) contrast(1.1)';
            case 'vintagejs-dark':
                return 'brightness(0.8) contrast(1.25) saturate(0.6)';
            case 'vintagejs-warm':
                return 'sepia(0.2) saturate(0.9) brightness(0.95) contrast(1.15)';
            case 'vintagejs-cool':
                return 'brightness(0.9) saturate(0.8) contrast(1.15) hue-rotate(5deg)';
            case 'vintagejs-faded':
                return 'brightness(1.15) contrast(0.8) saturate(0.6)';
            case 'vintagejs-high-contrast':
                return 'brightness(0.9) contrast(1.3) saturate(0.9)';
            case 'vintagejs-soft':
                return 'brightness(1.05) contrast(0.9) saturate(0.7)';
            case 'vintagejs-vivid':
                return 'brightness(0.95) contrast(1.2) saturate(1.2)';
            // New Vintage filters - approximate CSS representation
            case 'vintage-warm':
                return 'sepia(0.6) saturate(0.8) brightness(0.9) contrast(1.1)';
            case 'vintage-sepia':
                return 'sepia(0.7) saturate(0.5) brightness(0.85) contrast(1.15)';
            case 'vintage-bw':
                return 'grayscale(1) brightness(0.9) contrast(1.2)';
            case 'vintage-fade':
                return 'sepia(0.5) brightness(1.1) contrast(0.8) saturate(0.6)';
            case 'vintage-classic':
                return 'sepia(0.6) saturate(0.7) brightness(0.9) contrast(1.1)';
            case 'vintage-old':
                return 'sepia(0.7) saturate(0.4) brightness(0.8) contrast(1.05)';
            case 'vintage-grainy':
                return 'sepia(0.6) saturate(0.6) brightness(0.85) contrast(1.2)';
            case 'vintage-soft':
                return 'brightness(1.05) contrast(0.9) saturate(0.8)';
            default: return '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-medium text-lg text-stone-800">
                    Live Preview
                </h3>
                <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                    {photos.filter(Boolean).length}/{maxPhotos}
                </span>
            </div>

            <div className="bg-stone-100 p-4 rounded-lg flex justify-center min-h-[400px] items-start overflow-hidden relative">
                {previewUrl ? (
                    <div className="relative w-full max-w-[200px] shadow-lg transition-all duration-300">
                        <img
                            src={previewUrl}
                            alt="Strip Preview"
                            className="w-full h-auto block"
                        />

                        {/* Interactive Overlay for Removing Photos */}
                        {onRemovePhoto && (
                            <div className="absolute inset-0">
                                {overlayPositions.map((pos, index) => {
                                    const hasPhoto = !!photos[index];
                                    if (!hasPhoto) return null;

                                    const livePhoto = livePhotos[index];

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                top: pos.top,
                                                height: pos.height,
                                                left: pos.left,
                                                width: pos.width
                                            }}
                                            className="absolute group cursor-pointer"
                                        >
                                            {/* Live Photo Overlay */}
                                            {livePhoto && (
                                                <div className="absolute inset-0 z-10">
                                                    <LivePhotoPreview
                                                        videoBlob={livePhoto}
                                                        stillImage={photos[index]!}
                                                        variant="compact"
                                                        filterType={filter}
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                            )}

                                            {/* Remove Button (Higher Z-Index) */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemovePhoto(index);
                                                    }}
                                                    className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 hover:scale-110 transition-all"
                                                    title="Remove photo"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Hover highlight if no live photo */}
                                            {!livePhoto && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-sm pointer-events-none" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[400px] text-stone-400">
                        <RotateCcw className="w-6 h-6 animate-spin" />
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-stone-400 mt-4">
                Click &apos;X&apos; on photo to retake
            </p>
        </div>
    );
}
