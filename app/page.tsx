'use client';

import { useState, useCallback } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, RotateCcw, Download, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CameraCapture, { type CapturedPhoto } from '@/components/camera-capture';
import PhotoUpload from '@/components/photo-upload';
import PhotostripPreview from '@/components/photostrip-preview';
import FilterSelector from '@/components/filter-selector';
import ResultModal from '@/components/result-modal';
import ErrorMessage from '@/components/error-message';
import BackgroundSelector from '@/components/background-selector';
import PhotoCountSelector from '@/components/photo-count-selector';
import LayoutSelector from '@/components/layout-selector';
import { generatePhotostrip, type BackgroundStyle, type LayoutType } from '@/lib/canvas-generator';
import type { FilterType } from '@/lib/image-filters';

type PhotoMode = 'select' | 'camera' | 'upload';

export default function Home() {
    const [mode, setMode] = useState<PhotoMode>('select');
    const [selectedPhotoCount, setSelectedPhotoCount] = useState<1 | 2 | 3 | 4>(4);
    // Track previous photo count when switching to Polaroid (to restore when switching back)
    const [previousPhotoCount, setPreviousPhotoCount] = useState<2 | 3 | 4>(4);
    // Always maintain 4 slots to preserve photos when switching layouts
    const [photos, setPhotos] = useState<(string | null)[]>(Array(4).fill(null));
    const [livePhotos, setLivePhotos] = useState<(Blob | null)[]>(Array(4).fill(null));
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('vintiq-warm');
    const [selectedBackground, setSelectedBackground] = useState<BackgroundStyle>('classic-cream');
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical-4');
    const [customText, setCustomText] = useState('');
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
    const handlePhotoCountChange = useCallback((count: 1 | 2 | 3 | 4) => {
        setSelectedPhotoCount(count);

        // Update layout if it's a strip
        if (count === 2 || count === 3 || count === 4) {
            setSelectedLayout(`vertical-${count}` as LayoutType);
        } else if (count === 1) {
            setSelectedLayout('polaroid');
        }

        // We no longer resize the photos array here to preserve data
        // The display logic will slice the array based on selectedPhotoCount
    }, []);

    // Handle photo upload
    const handlePhotoUpload = useCallback((photoDataUrls: string[]) => {
        const newPhotos = Array(selectedPhotoCount).fill(null);
        photoDataUrls.forEach((url, index) => {
            if (index < selectedPhotoCount) {
                newPhotos[index] = url;
            }
        });
        // Fill the rest with nulls up to 4 to maintain fixed size
        while (newPhotos.length < 4) {
            newPhotos.push(null);
        }
        setPhotos(newPhotos);
        // Clear live photos as uploads don't have them
        setLivePhotos(Array(4).fill(null));
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

    const handleLayoutChange = (layout: LayoutType) => {
        if (layout === 'polaroid') {
            // Polaroid is strictly 1 photo
            // Save current photo count before switching to Polaroid (if not already 1)
            if (selectedPhotoCount !== 1) {
                setPreviousPhotoCount(selectedPhotoCount as 2 | 3 | 4);
                handlePhotoCountChange(1);
            }
            setSelectedLayout('polaroid');
        } else if (layout === 'vertical-4' || layout.startsWith('vertical-')) {
            // For Strip layouts, respect the current photo count
            // If coming from Polaroid (1 photo), restore previous count
            if (selectedPhotoCount === 1) {
                setSelectedLayout(`vertical-${previousPhotoCount}` as LayoutType);
                handlePhotoCountChange(previousPhotoCount);
            } else {
                // Use the current photo count (2, 3, or 4)
                setSelectedLayout(`vertical-${selectedPhotoCount}` as LayoutType);
            }
        } else if (layout === 'grid-2x2') {
            // For Grid, keep current photo count
            // If coming from Polaroid (1 photo), restore previous count
            if (selectedPhotoCount === 1) {
                handlePhotoCountChange(previousPhotoCount);
            }
            setSelectedLayout('grid-2x2');
        } else {
            // Fallback for any other layouts
            setSelectedLayout(layout);
        }
    };

    // Reset all
    const handleReset = useCallback(() => {
        setPhotos(Array(4).fill(null));
        setLivePhotos(Array(4).fill(null));
        setMode('select');
        setGeneratedStrip(null);
        setError('');
        setSelectedPhotoCount(4); // Reset photo count to default
        setSelectedLayout('vertical-4'); // Reset layout to default
        setSelectedFilter('vintiq-warm'); // Reset filter to default
        setSelectedBackground('classic-cream'); // Reset background to default
        setCustomText(''); // Reset custom text
    }, []);

    // Generate photostrip
    const handleGenerate = async () => {
        // Only consider photos within the selected count
        const activePhotos = photos.slice(0, selectedPhotoCount);
        const validPhotos = activePhotos.filter((p) => p !== null) as string[];

        if (validPhotos.length !== selectedPhotoCount) {
            setError(`Please capture all ${selectedPhotoCount} photos before generating.`);
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const canvas = await generatePhotostrip({
                photos: validPhotos,
                filter: selectedFilter,
                layout: selectedLayout,
                background: selectedBackground,
                customText: customText,
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

                                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <h3 className="text-lg font-serif font-medium mb-4">3. Choose Layout</h3>
                                            <LayoutSelector
                                                selectedLayout={selectedLayout}
                                                onLayoutChange={handleLayoutChange}
                                            />
                                        </div>

                                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <h3 className="text-lg font-serif font-medium mb-4">4. Add Caption (Optional)</h3>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                    <Input
                                                        value={customText}
                                                        onChange={(e) => setCustomText(e.target.value)}
                                                        placeholder="Enter your name or message..."
                                                        className="pl-10 border-stone-200 focus:ring-stone-400 focus:border-stone-400"
                                                        maxLength={30}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-stone-400 mt-2">
                                                Replaces &quot;VINTIQ STUDIO&quot; with your custom text.
                                            </p>
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
                                {/* Photo Count Selector - Always visible now */}
                                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="text-lg font-serif font-medium mb-4">Number of Photos</h3>
                                    <PhotoCountSelector
                                        selectedCount={selectedPhotoCount as 2 | 3 | 4}
                                        onCountChange={(count) => handlePhotoCountChange(count)}
                                    />
                                </div>

                                <PhotostripPreview
                                    photos={photos.slice(0, selectedPhotoCount)}
                                    livePhotos={livePhotos.slice(0, selectedPhotoCount)}
                                    currentSlot={currentSlot === -1 ? selectedPhotoCount : currentSlot}
                                    onRemovePhoto={handleRemovePhoto}
                                    maxPhotos={selectedPhotoCount}
                                    filter={selectedFilter}
                                    background={selectedBackground}
                                    layout={selectedLayout}
                                    customText={customText}
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
                    layout={selectedLayout}
                    customText={customText}
                />
            )}
        </div>
    );
}
