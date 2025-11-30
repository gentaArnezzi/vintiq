'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { generatePhotostrip, type BackgroundStyle } from '@/lib/canvas-generator';
import type { FilterType } from '@/lib/image-filters';

interface PhotostripPreviewProps {
    photos: (string | null)[];
    currentSlot: number;
    onRemovePhoto?: (index: number) => void;
    maxPhotos?: number;
    filter: FilterType;
    background: BackgroundStyle;
}

export default function PhotostripPreview({
    photos,
    currentSlot,
    onRemovePhoto,
    maxPhotos = 4,
    filter,
    background,
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
                    layout: 'vertical-4',
                    background,
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
    }, [photos, filter, background]);

    // Calculated positions for overlay buttons (based on canvas layout)
    // Total Height: 1830px
    // Photo Height: 390px
    // Top Padding: 60px
    // Gap: 30px
    const overlayPositions = [
        { top: '3.3%', height: '21.3%' },
        { top: '26.2%', height: '21.3%' },
        { top: '49.1%', height: '21.3%' },
        { top: '72.0%', height: '21.3%' },
    ];

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

                                    return (
                                        <div
                                            key={index}
                                            style={{ top: pos.top, height: pos.height }}
                                            className="absolute left-[6.6%] right-[6.6%] group cursor-pointer"
                                        >
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-sm pointer-events-none" />
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
                Click 'X' on photo to retake
            </p>
        </div>
    );
}
