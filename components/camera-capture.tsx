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
        <div className="flex flex-col items-center gap-6 w-full">
            {/* Camera Preview Frame */}
            <div className="relative w-full aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden shadow-inner">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-10">
                        <div className="text-center text-stone-400">
                            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="font-medium text-sm">Accessing Camera...</p>
                        </div>
                    </div>
                )}

                {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20">
                        <div className="text-white text-8xl font-serif font-light animate-pulse drop-shadow-md">
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
            </div>

            {/* Controls */}
            <div className="w-full max-w-xs text-center space-y-3">
                <Button
                    onClick={handleCapture}
                    disabled={!canCapture}
                    className="w-full h-12 rounded-full text-base font-medium shadow-sm transition-all hover:shadow-md"
                    variant={!canCapture ? "secondary" : "default"}
                >
                    {capturedCount >= maxPhotos ? (
                        'Session Complete'
                    ) : (
                        <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            Capture Photo {capturedCount + 1}/{maxPhotos}
                        </span>
                    )}
                </Button>

                <p className="text-xs text-stone-400 font-medium">
                    Press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[10px] text-stone-500 font-sans mx-1">Space</kbd> to capture
                </p>
            </div>
        </div>
    );
}
