'use client';

import { useEffect, useRef, useState } from 'react';
import { downloadCanvas, downloadVideo, generateLiveStripVideo } from '@/lib/canvas-generator';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, X, Video } from 'lucide-react';
import type { FilterType } from '@/lib/image-filters';
import type { BackgroundStyle } from '@/lib/canvas-generator';

interface ResultModalProps {
    stripCanvas: HTMLCanvasElement | null;
    onClose: () => void;
    onStartAgain: () => void;
    livePhotos?: (Blob | null)[];
    photos?: (string | null)[];
    filter?: FilterType;
    background?: BackgroundStyle;
}

export default function ResultModal({
    stripCanvas,
    onClose,
    onStartAgain,
    livePhotos = [],
    photos = [],
    filter = 'vintiq-warm',
    background = 'classic-cream',
}: ResultModalProps) {
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

    useEffect(() => {
        if (stripCanvas && displayCanvasRef.current) {
            const displayCtx = displayCanvasRef.current.getContext('2d');
            if (displayCtx) {
                displayCanvasRef.current.width = stripCanvas.width;
                displayCanvasRef.current.height = stripCanvas.height;
                displayCtx.drawImage(stripCanvas, 0, 0);
            }
        }
    }, [stripCanvas]);

    const handleDownload = () => {
        if (stripCanvas) {
            downloadCanvas(stripCanvas);
        }
    };

    const hasLivePhotos = livePhotos.some(blob => blob !== null);

    const handleDownloadLiveStrip = async () => {
        // Check if we have any live photos
        if (!hasLivePhotos) {
            alert('Tidak ada live photo yang tersedia. Silakan gunakan kamera untuk mengambil live photo.');
            return;
        }

        setIsGeneratingVideo(true);
        try {
            const videoBlob = await generateLiveStripVideo({
                photos,
                livePhotos,
                filter,
                layout: 'vertical-4',
                background,
            });
            downloadVideo(videoBlob);
        } catch (error) {
            console.error('Error generating live strip:', error);
            alert('Gagal menghasilkan live strip video. Silakan coba lagi.');
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    if (!stripCanvas) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                {/* Left: Preview Area */}
                <div className="flex-1 bg-stone-100 p-8 flex items-center justify-center overflow-y-auto">
                    <div className="relative shadow-lg rotate-1 transition-transform hover:rotate-0 duration-500 bg-white p-2">
                        <canvas
                            ref={displayCanvasRef}
                            className="max-w-full h-auto max-h-[60vh]"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full md:w-[400px] p-8 flex flex-col bg-white">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-serif font-medium text-stone-900 mb-2">
                                Your Photostrip
                            </h2>
                            <p className="text-stone-500 text-sm">
                                Ready to save and share.
                            </p>
                        </div>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 justify-center">
                        <Button
                            onClick={handleDownload}
                            className="w-full h-12 text-base shadow-md"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download Image
                        </Button>

                        {hasLivePhotos && (
                            <Button
                                onClick={handleDownloadLiveStrip}
                                disabled={isGeneratingVideo}
                                variant="outline"
                                className="w-full h-12 text-base border-stone-300 hover:bg-stone-50"
                            >
                                {isGeneratingVideo ? (
                                    <>
                                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-4 h-4 mr-2" /> Download Live Strip (Video)
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={onStartAgain}
                            className="w-full h-12 text-base"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" /> Create Another
                        </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-xs text-stone-400">
                            Tag us <span className="font-medium text-stone-600">@ranyyftr</span> to be featured
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
