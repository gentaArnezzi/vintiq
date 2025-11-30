'use client';

import { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    validateImageFile,
    fileToDataUrl,
} from '@/lib/image-utils';

interface PhotoUploadProps {
    onPhotoUpload: (photoDataUrls: string[]) => void;
    onError: (error: string) => void;
    maxPhotos?: number;
}

export default function PhotoUpload({
    onPhotoUpload,
    onError,
    maxPhotos = 4,
}: PhotoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        if (files.length > maxPhotos) {
            onError(`Please select up to ${maxPhotos} photos only.`);
            return;
        }

        const validationErrors: string[] = [];
        for (const file of files) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                validationErrors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (validationErrors.length > 0) {
            onError(validationErrors.join('\n'));
            return;
        }

        try {
            const dataUrls = await Promise.all(
                files.map(file => fileToDataUrl(file))
            );
            onPhotoUpload(dataUrls);
        } catch (error) {
            if (error instanceof Error) {
                onError('Failed to load images: ' + error.message);
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
            <div
                className="w-full max-w-md border border-dashed border-stone-300 rounded-xl p-12 hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer group"
                onClick={handleClick}
            >
                <div className="w-16 h-16 mx-auto bg-stone-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-8 h-8 text-stone-400 group-hover:text-stone-600 transition-colors" />
                </div>

                <h3 className="text-xl font-serif font-medium text-stone-800 mb-2">
                    Select Photos
                </h3>
                <p className="text-stone-500 mb-8 text-sm leading-relaxed">
                    Drag and drop your images here, <br />or click to browse from device
                </p>

                <Button variant="outline" className="w-full">
                    Browse Files
                </Button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="mt-8 flex gap-6 text-[10px] font-medium text-stone-400 uppercase tracking-widest">
                <span>JPG / PNG</span>
                <span>Max 10MB</span>
                <span>Up to 4 Photos</span>
            </div>
        </div>
    );
}
