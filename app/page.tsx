'use client';

import { useState, useCallback } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CameraCapture from '@/components/camera-capture';
import PhotoUpload from '@/components/photo-upload';
import PhotostripPreview from '@/components/photostrip-preview';
import FilterSelector from '@/components/filter-selector';
import ResultModal from '@/components/result-modal';
import ErrorMessage from '@/components/error-message';
import { generatePhotostrip } from '@/lib/canvas-generator';
import type { FilterType } from '@/lib/image-filters';

type PhotoMode = 'select' | 'camera' | 'upload';

const MAX_PHOTOS = 4;

export default function Home() {
    const [mode, setMode] = useState<PhotoMode>('select');
    const [photos, setPhotos] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('vintiq-warm');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStrip, setGeneratedStrip] = useState<HTMLCanvasElement | null>(null);
    const [error, setError] = useState<string>('');

    const currentSlot = photos.findIndex((p) => p === null);
    const allPhotosCaptured = currentSlot === -1;

    // Handle photo capture from camera
    const handlePhotoCapture = useCallback((photoDataUrl: string) => {
        setPhotos((prev) => {
            const newPhotos = [...prev];
            const emptyIndex = newPhotos.findIndex((p) => p === null);
            if (emptyIndex !== -1) {
                newPhotos[emptyIndex] = photoDataUrl;
            }
            return newPhotos;
        });
    }, []);

    // Handle photo upload
    const handlePhotoUpload = useCallback((photoDataUrls: string[]) => {
        const newPhotos = Array(MAX_PHOTOS).fill(null);
        photoDataUrls.forEach((url, index) => {
            if (index < MAX_PHOTOS) {
                newPhotos[index] = url;
            }
        });
        setPhotos(newPhotos);
    }, []);

    // Remove photo from slot
    const handleRemovePhoto = useCallback((index: number) => {
        setPhotos((prev) => {
            const newPhotos = [...prev];
            newPhotos[index] = null;
            return newPhotos;
        });
    }, []);

    // Retake last photo (camera mode)
    const handleRetakeLast = useCallback(() => {
        setPhotos((prev) => {
            const newPhotos = [...prev];
            const lastFilledIndex = newPhotos.reduce(
                (lastIndex, photo, index) => (photo ? index : lastIndex),
                -1
            );
            if (lastFilledIndex >= 0) {
                newPhotos[lastFilledIndex] = null;
            }
            return newPhotos;
        });
    }, []);

    // Reset all
    const handleReset = useCallback(() => {
        setPhotos(Array(MAX_PHOTOS).fill(null));
        setMode('select');
        setGeneratedStrip(null);
        setError('');
    }, []);

    // Generate photostrip
    const handleGenerate = async () => {
        const validPhotos = photos.filter((p) => p !== null) as string[];

        if (validPhotos.length !== MAX_PHOTOS) {
            setError(`Please capture all ${MAX_PHOTOS} photos before generating.`);
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const canvas = await generatePhotostrip({
                photos: validPhotos,
                filter: selectedFilter,
                layout: 'vertical-4',
            });
            setGeneratedStrip(canvas);
        } catch (err) {
            if (err instanceof Error) {
                setError('Failed to generate photostrip: ' + err.message);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-vintage-cream vintage-gradient text-stone-800 font-sans selection:bg-stone-200">
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">

                {/* Header */}
                <header className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm">
                        <Sparkles className="w-4 h-4 text-vintage-gold" />
                        <span className="text-xs font-medium tracking-wider uppercase text-stone-500">Online Photobooth</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 mb-6 tracking-tight">
                        Vintiq Studio
                    </h1>
                    <p className="text-lg text-stone-500 max-w-xl mx-auto font-light leading-relaxed">
                        Capture moments in timeless vintage style. No app required, just pure nostalgia.
                    </p>
                </header>

                {/* Error Display */}
                {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                {/* Mode Selection */}
                {mode === 'select' && (
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto animate-fade-in delay-100">
                        <Card
                            className="group cursor-pointer hover:shadow-md transition-all duration-300 border-stone-200 hover:border-stone-300 bg-white/50 backdrop-blur-sm"
                            onClick={() => setMode('camera')}
                        >
                            <CardHeader className="text-center pt-10 pb-6">
                                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Camera className="w-8 h-8 text-stone-700" />
                                </div>
                                <CardTitle className="text-2xl mb-2">Use Camera</CardTitle>
                                <CardDescription>
                                    Take 4 photos sequentially with your webcam. Perfect for spontaneous selfies.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center pb-10">
                                <Button variant="vintage-outline" className="group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                    Start Session
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className="group cursor-pointer hover:shadow-md transition-all duration-300 border-stone-200 hover:border-stone-300 bg-white/50 backdrop-blur-sm"
                            onClick={() => setMode('upload')}
                        >
                            <CardHeader className="text-center pt-10 pb-6">
                                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className="w-8 h-8 text-stone-700" />
                                </div>
                                <CardTitle className="text-2xl mb-2">Upload Photos</CardTitle>
                                <CardDescription>
                                    Select 4 existing photos from your gallery. Ideal for curated memories.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center pb-10">
                                <Button variant="vintage-outline" className="group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                    Choose Files
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Interface */}
                {mode !== 'select' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="text-stone-500 hover:text-stone-900"
                            >
                                ← Back to Home
                            </Button>
                            <div className="text-sm font-medium text-stone-400 uppercase tracking-widest">
                                {mode === 'camera' ? 'Camera Session' : 'Upload Session'}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            {/* Left Panel */}
                            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                                <Card className="overflow-hidden border-stone-200 shadow-sm bg-white">
                                    <div className="p-1">
                                        {mode === 'camera' && (
                                            <CameraCapture
                                                onPhotoCapture={handlePhotoCapture}
                                                capturedCount={photos.filter(Boolean).length}
                                                maxPhotos={MAX_PHOTOS}
                                                onError={setError}
                                            />
                                        )}

                                        {mode === 'upload' && (
                                            <PhotoUpload
                                                onPhotoUpload={handlePhotoUpload}
                                                onError={setError}
                                                maxPhotos={MAX_PHOTOS}
                                            />
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-center gap-4">
                                    {mode === 'camera' && currentSlot > 0 && currentSlot < MAX_PHOTOS && (
                                        <Button variant="outline" onClick={handleRetakeLast}>
                                            Retake Last
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={handleReset} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        Reset Session
                                    </Button>
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                                <PhotostripPreview
                                    photos={photos}
                                    currentSlot={currentSlot === -1 ? MAX_PHOTOS : currentSlot}
                                    onRemovePhoto={handleRemovePhoto}
                                    maxPhotos={MAX_PHOTOS}
                                />

                                {allPhotosCaptured && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="border-t border-stone-200 pt-6">
                                            <h3 className="text-lg font-serif font-medium mb-4">Select Filter</h3>
                                            <FilterSelector
                                                selectedFilter={selectedFilter}
                                                onFilterChange={setSelectedFilter}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="w-full h-14 text-lg bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl shadow-lg shadow-stone-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center gap-2">
                                                    <RotateCcw className="w-5 h-5 animate-spin" /> Generating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Generate Photostrip <ArrowRight className="w-5 h-5" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Result Modal */}
            {generatedStrip && (
                <ResultModal
                    stripCanvas={generatedStrip}
                    onClose={() => setGeneratedStrip(null)}
                    onStartAgain={handleReset}
                />
            )}
        </div>
    );
}
