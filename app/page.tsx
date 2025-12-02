'use client';

import { useState, useCallback } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CameraCapture, { type CapturedPhoto } from '@/components/camera-capture';
import PhotoUpload from '@/components/photo-upload';
import PhotostripPreview from '@/components/photostrip-preview';
import FilterSelector from '@/components/filter-selector';
import ResultModal from '@/components/result-modal';
import ErrorMessage from '@/components/error-message';
import BackgroundSelector from '@/components/background-selector';
import PhotoCountSelector from '@/components/photo-count-selector';
import { generatePhotostrip, type BackgroundStyle } from '@/lib/canvas-generator';
import type { FilterType } from '@/lib/image-filters';

type PhotoMode = 'select' | 'camera' | 'upload';

export default function Home() {
    const [mode, setMode] = useState<PhotoMode>('select');
    const [selectedPhotoCount, setSelectedPhotoCount] = useState<2 | 3 | 4>(4);
    const [photos, setPhotos] = useState<(string | null)[]>(Array(4).fill(null));
    const [livePhotos, setLivePhotos] = useState<(Blob | null)[]>(Array(4).fill(null));
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('vintiq-warm');
    const [selectedBackground, setSelectedBackground] = useState<BackgroundStyle>('classic-cream');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStrip, setGeneratedStrip] = useState<HTMLCanvasElement | null>(null);
    const [error, setError] = useState<string>('');

    const currentSlot = photos.findIndex((p) => p === null);
    const allPhotosCaptured = currentSlot === -1 || currentSlot >= selectedPhotoCount;

    // Handle photo capture from camera (with live photo support)
    // IMPORTANT: Use the same index for both photos and livePhotos to maintain order
    const handlePhotoCapture = useCallback((photo: CapturedPhoto) => {
        let capturedIndex = -1;
        
        setPhotos((prev) => {
            const newPhotos = [...prev];
            const emptyIndex = newPhotos.findIndex((p) => p === null);
            if (emptyIndex !== -1) {
                newPhotos[emptyIndex] = photo.stillImage;
                capturedIndex = emptyIndex; // Store the index for live photo
            }
            return newPhotos;
        });

        // Store live photo blob at the SAME index as the photo
        if (photo.livePhotoBlob && capturedIndex !== -1) {
            setLivePhotos((prev) => {
                const newLivePhotos = [...prev];
                // Use the same index as the photo to maintain order
                newLivePhotos[capturedIndex] = photo.livePhotoBlob || null;
                return newLivePhotos;
            });
        }
    }, []);

    // Handle photo count change
    const handlePhotoCountChange = useCallback((count: 2 | 3 | 4) => {
        setSelectedPhotoCount(count);
        
        setPhotos((prev) => {
            const newPhotos = [...prev];
            // Trim if new count is smaller
            if (count < newPhotos.length) {
                return newPhotos.slice(0, count);
            }
            // Extend if new count is larger
            if (count > newPhotos.length) {
                return [...newPhotos, ...Array(count - newPhotos.length).fill(null)];
            }
            return newPhotos;
        });
        
        setLivePhotos((prev) => {
            const newLivePhotos = [...prev];
            // Trim if new count is smaller
            if (count < newLivePhotos.length) {
                return newLivePhotos.slice(0, count);
            }
            // Extend if new count is larger
            if (count > newLivePhotos.length) {
                return [...newLivePhotos, ...Array(count - newLivePhotos.length).fill(null)];
            }
            return newLivePhotos;
        });
    }, []);

    // Handle photo upload
    const handlePhotoUpload = useCallback((photoDataUrls: string[]) => {
        const newPhotos = Array(selectedPhotoCount).fill(null);
        photoDataUrls.forEach((url, index) => {
            if (index < selectedPhotoCount) {
                newPhotos[index] = url;
            }
        });
        setPhotos(newPhotos);
    }, [selectedPhotoCount]);

    // Remove photo from slot
    const handleRemovePhoto = useCallback((index: number) => {
        setPhotos((prev) => {
            const newPhotos = [...prev];
            newPhotos[index] = null;
            return newPhotos;
        });
        setLivePhotos((prev) => {
            const newLivePhotos = [...prev];
            newLivePhotos[index] = null;
            return newLivePhotos;
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
        setLivePhotos((prev) => {
            const newLivePhotos = [...prev];
            const lastFilledIndex = newLivePhotos.reduce(
                (lastIndex, photo, index) => (photo ? index : lastIndex),
                -1
            );
            if (lastFilledIndex >= 0) {
                newLivePhotos[lastFilledIndex] = null;
            }
            return newLivePhotos;
        });
    }, []);

    // Reset all
    const handleReset = useCallback(() => {
        setPhotos(Array(selectedPhotoCount).fill(null));
        setLivePhotos(Array(selectedPhotoCount).fill(null));
        setMode('select');
        setGeneratedStrip(null);
        setError('');
    }, [selectedPhotoCount]);

    // Generate photostrip
    const handleGenerate = async () => {
        const validPhotos = photos.filter((p) => p !== null) as string[];

        if (validPhotos.length !== selectedPhotoCount) {
            setError(`Please capture all ${selectedPhotoCount} photos before generating.`);
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const layoutMap: Record<2 | 3 | 4, 'vertical-2' | 'vertical-3' | 'vertical-4'> = {
                2: 'vertical-2',
                3: 'vertical-3',
                4: 'vertical-4',
            };
            
            const canvas = await generatePhotostrip({
                photos: validPhotos,
                filter: selectedFilter,
                layout: layoutMap[selectedPhotoCount],
                background: selectedBackground,
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
        <div className="min-h-screen text-stone-800 font-sans selection:bg-stone-200">
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

                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                            {/* Left Panel */}
                            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                                <Card className="overflow-hidden border-stone-200 shadow-sm bg-white">
                                    <div className="p-6">
                                        {mode === 'camera' && (
                                            <CameraCapture
                                                onPhotoCapture={handlePhotoCapture}
                                                capturedCount={photos.filter(Boolean).length}
                                                maxPhotos={selectedPhotoCount}
                                                onError={setError}
                                            />
                                        )}

                                        {mode === 'upload' && (
                                            <PhotoUpload
                                                onPhotoUpload={handlePhotoUpload}
                                                onError={setError}
                                                maxPhotos={selectedPhotoCount}
                                            />
                                        )}
                                    </div>
                                </Card>

                                <div className="flex justify-center gap-4">
                                    {mode === 'camera' && currentSlot > 0 && currentSlot < selectedPhotoCount && (
                                        <Button variant="outline" onClick={handleRetakeLast}>
                                            Retake Last
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={handleReset} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        Reset Session
                                    </Button>
                                </div>

                                {/* Customization Controls */}
                                {allPhotosCaptured && (
                                    <div className="space-y-8 animate-fade-in pt-4">
                                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <h3 className="text-lg font-serif font-medium mb-4">1. Choose Filter</h3>
                                            <FilterSelector
                                                selectedFilter={selectedFilter}
                                                onFilterChange={setSelectedFilter}
                                            />
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <h3 className="text-lg font-serif font-medium mb-4">2. Choose Background</h3>
                                            <BackgroundSelector
                                                selectedBackground={selectedBackground}
                                                onBackgroundChange={setSelectedBackground}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="w-full h-16 text-xl bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl shadow-lg shadow-stone-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center gap-2">
                                                    <RotateCcw className="w-6 h-6 animate-spin" /> Processing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Finalize & Download <ArrowRight className="w-6 h-6" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel (Preview Only) */}
                            <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                                {/* Photo Count Selector - Near Live Preview */}
                                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="text-lg font-serif font-medium mb-4">Number of Photos</h3>
                                    <PhotoCountSelector
                                        selectedCount={selectedPhotoCount}
                                        onCountChange={handlePhotoCountChange}
                                    />
                                </div>

                                <PhotostripPreview
                                    photos={photos}
                                    livePhotos={livePhotos}
                                    currentSlot={currentSlot === -1 ? selectedPhotoCount : currentSlot}
                                    onRemovePhoto={handleRemovePhoto}
                                    maxPhotos={selectedPhotoCount}
                                    filter={selectedFilter}
                                    background={selectedBackground}
                                />
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
                    livePhotos={livePhotos}
                    photos={photos}
                    filter={selectedFilter}
                    background={selectedBackground}
                />
            )}
        </div>
    );
}
