'use client';

import { X } from 'lucide-react';

interface PhotostripPreviewProps {
    photos: (string | null)[];
    currentSlot: number;
    onRemovePhoto?: (index: number) => void;
    maxPhotos?: number;
}

export default function PhotostripPreview({
    photos,
    currentSlot,
    onRemovePhoto,
    maxPhotos = 4,
}: PhotostripPreviewProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-medium text-lg text-stone-800">
                    Preview Strip
                </h3>
                <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                    {photos.filter(Boolean).length}/{maxPhotos}
                </span>
            </div>

            {/* The Strip Container */}
            <div className="bg-stone-100 p-4 rounded-lg flex justify-center">
                <div className="w-full max-w-[180px] bg-white p-3 shadow-md flex flex-col gap-3">
                    {Array.from({ length: maxPhotos }).map((_, index) => {
                        const photo = photos[index];
                        const isActive = index === currentSlot && !photo;
                        const isFilled = !!photo;

                        return (
                            <div key={index} className="relative group aspect-[4/3] bg-stone-50 overflow-hidden">
                                {isFilled ? (
                                    <>
                                        <img
                                            src={photo}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover grayscale-[0.1] contrast-[0.95]"
                                        />
                                        {onRemovePhoto && (
                                            <button
                                                onClick={() => onRemovePhoto(index)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center border border-dashed transition-colors ${isActive ? 'border-stone-400 bg-stone-100' : 'border-stone-200'
                                        }`}>
                                        <span className={`text-sm font-medium ${isActive ? 'text-stone-500' : 'text-stone-300'}`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Branding */}
                    <div className="pt-2 pb-1 text-center">
                        <span className="font-serif text-[10px] text-stone-400 tracking-widest uppercase">Vintiq Studio</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
