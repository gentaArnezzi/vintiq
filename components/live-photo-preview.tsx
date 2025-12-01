'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePhotoPreviewProps {
    videoBlob: Blob | null;
    stillImage: string;
    onDownload?: () => void;
    variant?: 'default' | 'compact';
    className?: string;
    filterStyle?: string;
}

export default function LivePhotoPreview({
    videoBlob,
    stillImage,
    onDownload,
    variant = 'default',
    className = '',
    filterStyle = '',
}: LivePhotoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isHovering, setIsHovering] = useState(false);

    // Create URL from blob
    useEffect(() => {
        if (videoBlob) {
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [videoBlob]);

    // Auto-play on hover (like iOS Photos)
    useEffect(() => {
        if (!videoRef.current) return;

        if (isHovering && videoUrl) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error('Auto-play failed:', err));
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isHovering, videoUrl]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling if used in clickable container
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error('Play failed:', err));
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    };

    const handleDownloadVideo = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoUrl) return;

        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `vintiq-livephoto-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (onDownload) {
            onDownload();
        }
    };

    if (!videoBlob) {
        return null;
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Preview Container */}
            <div
                className={`relative w-full h-full bg-stone-900 overflow-hidden shadow-lg cursor-pointer ${variant === 'default' ? 'aspect-[3/4] rounded-xl' : 'rounded-sm'
                    }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={togglePlay}
            >
                {/* Video Player */}
                <video
                    ref={videoRef}
                    src={videoUrl || undefined}
                    className="w-full h-full object-cover"
                    style={{ filter: filterStyle }}
                    loop
                    playsInline
                    muted
                    onEnded={handleVideoEnd}
                    poster={stillImage}
                />

                {/* LIVE Badge (top-left) */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-stone-900/60 backdrop-blur-sm rounded-md z-10">
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            <div className="w-0.5 h-0.5 rounded-full bg-yellow-400 animate-pulse" />
                            <div className="w-0.5 h-0.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-0.5 h-0.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-[8px] font-bold text-white tracking-wider uppercase">
                            Live
                        </span>
                    </div>
                </div>

                {/* Play/Pause Button Overlay */}
                {!isHovering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-10 h-10 rounded-full bg-stone-900/80 backdrop-blur-sm flex items-center justify-center">
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white fill-white" />
                            ) : (
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            )}
                        </div>
                    </div>
                )}

                {/* Compact Mode Download Button (Top Right) */}
                {variant === 'compact' && (
                    <button
                        onClick={handleDownloadVideo}
                        className="absolute top-2 right-2 p-1.5 bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        title="Download Live Photo"
                    >
                        <Download className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Default Mode Download Button */}
            {variant === 'default' && (
                <Button
                    onClick={() => handleDownloadVideo()}
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-stone-100 hover:bg-stone-200 border-stone-300"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Live Photo
                </Button>
            )}
        </div>
    );
}
