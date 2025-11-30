'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    requestCameraPermission,
    checkBrowserSupport,
    captureFrame,
    stopCameraStream,
    type CameraStream,
} from '@/lib/camera-utils';

interface CameraCaptureProps {
    onPhotoCapture: (photoDataUrl: string) => void;
    capturedCount: number;
    maxPhotos?: number;
    onError: (error: string) => void;
}

export default function CameraCapture({
    onPhotoCapture,
    capturedCount,
    maxPhotos = 4,
    onError,
}: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<CameraStream | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [flashActive, setFlashActive] = useState(false);

    // Check browser support
    useEffect(() => {
        if (!checkBrowserSupport()) {
            onError(
                'Your browser does not support camera access. Please try Upload Photos instead.'
            );
        }
    }, [onError]);

    // Initialize camera
    const initCamera = async () => {
        setIsLoading(true);
        try {
            const stream = await requestCameraPermission();

            // Check if component is still mounted
            if (!videoRef.current) {
                stopCameraStream(stream.stream);
                return;
            }

            setCameraStream(stream);
            videoRef.current.srcObject = stream.stream;

            // Handle play() promise safely
            try {
                await videoRef.current.play();
            } catch (playError) {
                if ((playError as Error).name !== 'AbortError') {
                    console.error('Video play failed:', playError);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                onError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-start camera on mount
    useEffect(() => {
        let mounted = true;
        initCamera();

        return () => {
            mounted = false;
            if (cameraStream) {
                stopCameraStream(cameraStream.stream);
            }
            // Stop video element if it exists
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.srcObject = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle photo capture with countdown
    const handleCapture = () => {
        if (countdown !== null) return;
        setCountdown(3);
    };

    // Handle countdown timer
    useEffect(() => {
        if (countdown === null || countdown === 0) return;

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    // Capture photo when countdown reaches 0
    useEffect(() => {
        if (countdown !== 0) return;

        // Trigger flash
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 150);

        if (videoRef.current && canvasRef.current) {
            try {
                const dataUrl = captureFrame(videoRef.current, canvasRef.current);
                onPhotoCapture(dataUrl);
            } catch (error) {
                if (error instanceof Error) {
                    onError(error.message);
                }
            }
        }

        setCountdown(null);
    }, [countdown, onPhotoCapture, onError]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space' && cameraStream && capturedCount < maxPhotos) {
                e.preventDefault();
                handleCapture();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [cameraStream, capturedCount, maxPhotos, countdown]);

    const canCapture = cameraStream && capturedCount < maxPhotos && countdown === null;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            {/* Camera Body Frame */}
            <div className="relative w-full bg-stone-900 rounded-3xl p-4 shadow-2xl border border-stone-800">

                {/* Viewfinder Area */}
                <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-inner ring-1 ring-white/10">

                    {/* Flash Overlay */}
                    <div
                        className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150 ease-out ${flashActive ? 'opacity-100' : 'opacity-0'
                            }`}
                    />

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-10">
                            <div className="text-center text-stone-500">
                                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
                                <p className="font-medium text-xs tracking-widest uppercase">Initializing Lens...</p>
                            </div>
                        </div>
                    )}

                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                            <div className="text-white text-9xl font-serif font-light animate-pulse drop-shadow-2xl">
                                {countdown}
                            </div>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Viewfinder Crosshair/Grid (Optional Aesthetic) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/50 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
                    </div>
                </div>

                {/* Camera Branding/Details */}
                <div className="absolute top-6 right-6 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                </div>
            </div>

            {/* Controls Area */}
            <div className="flex flex-col items-center gap-6 w-full">

                {/* Progress Indicators */}
                <div className="flex gap-3">
                    {Array.from({ length: maxPhotos }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${i < capturedCount
                                    ? 'bg-stone-800 scale-100'
                                    : i === capturedCount
                                        ? 'bg-stone-300 scale-110 ring-2 ring-stone-200 ring-offset-2'
                                        : 'bg-stone-200 scale-90'
                                }`}
                        />
                    ))}
                </div>

                {/* Shutter Button */}
                <div className="relative group">
                    <button
                        onClick={handleCapture}
                        disabled={!canCapture}
                        className={`
                            relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200
                            ${!canCapture
                                ? 'bg-stone-200 cursor-not-allowed opacity-50'
                                : 'bg-stone-200 hover:bg-stone-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl'
                            }
                        `}
                        aria-label="Capture Photo"
                    >
                        {/* Inner Shutter Circle */}
                        <div className={`
                            w-16 h-16 rounded-full border-4 transition-all duration-200
                            ${!canCapture
                                ? 'border-stone-300 bg-stone-100'
                                : 'border-stone-400 bg-white group-hover:border-stone-500'
                            }
                        `} />
                    </button>

                    {/* Spacebar Hint */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-1 rounded-full">
                            Press Space
                        </span>
                    </div>
                </div>

                {/* Status Text */}
                <div className="h-6">
                    {capturedCount >= maxPhotos ? (
                        <p className="text-stone-800 font-medium animate-fade-in">Session Complete!</p>
                    ) : (
                        <p className="text-stone-400 text-sm font-light">
                            {countdown !== null ? 'Get Ready...' : 'Ready to Capture'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
