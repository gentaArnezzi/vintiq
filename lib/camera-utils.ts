// Camera utility functions for accessing and managing webcam

export interface CameraStream {
    stream: MediaStream;
    videoTrack: MediaStreamTrack;
}

/**
 * Request camera permission and get media stream
 */
export async function requestCameraPermission(): Promise<CameraStream> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 1920 },
                facingMode: 'user',
            },
            audio: false,
        });

        const videoTrack = stream.getVideoTracks()[0];

        return { stream, videoTrack };
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera permission denied. Please allow camera access to use this feature.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera found on your device. Try Upload Photos instead.');
            } else {
                throw new Error('Failed to access camera: ' + error.message);
            }
        }
        throw new Error('Unknown error accessing camera');
    }
}

/**
 * Check if browser supports camera access
 */
export function checkBrowserSupport(): boolean {
    return !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    );
}

/**
 * Capture a single frame from video stream to canvas
 * Flips horizontally to correct mirrored preview
 */
export function captureFrame(
    videoElement: HTMLVideoElement,
    canvas: HTMLCanvasElement
): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Set canvas size to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Flip horizontal to correct mirrored selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Return as data URL
    return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Stop camera stream and release resources
 */
export function stopCameraStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
}

/**
 * Get available cameras (for camera switching feature - future)
 */
export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
        console.error('Failed to enumerate devices:', error);
        return [];
    }
}

/**
 * Capture frame without horizontal flip (for video buffer)
 */
export function captureFrameBuffer(
    videoElement: HTMLVideoElement,
    canvas: HTMLCanvasElement
): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw without flipping for buffer storage
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Live Photo Capture Manager
 * Manages continuous frame buffering and video generation
 */
export class LivePhotoCapture {
    private frameBuffer: string[] = [];
    private bufferSize: number;
    private fps: number;
    private intervalId: number | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private canvasElement: HTMLCanvasElement;

    constructor(bufferSizeSeconds: number = 1.5, fps: number = 15) {
        this.fps = fps;
        this.bufferSize = Math.floor(bufferSizeSeconds * fps);
        this.canvasElement = document.createElement('canvas');
    }

    /**
     * Start continuous frame buffering
     */
    start(videoElement: HTMLVideoElement): void {
        this.videoElement = videoElement;
        this.frameBuffer = [];

        // Capture frames at specified FPS
        this.intervalId = window.setInterval(() => {
            if (!this.videoElement) return;

            try {
                const frame = captureFrameBuffer(this.videoElement, this.canvasElement);

                // Circular buffer - remove oldest if full
                if (this.frameBuffer.length >= this.bufferSize) {
                    this.frameBuffer.shift();
                }

                this.frameBuffer.push(frame);
            } catch (error) {
                console.error('Frame capture error:', error);
            }
        }, 1000 / this.fps);
    }

    /**
     * Capture additional frames after shutter
     */
    async captureAfterFrames(additionalSeconds: number = 0.5): Promise<string[]> {
        const afterFrameCount = Math.floor(additionalSeconds * this.fps);
        const afterFrames: string[] = [];

        if (!this.videoElement) {
            return afterFrames;
        }

        for (let i = 0; i < afterFrameCount; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000 / this.fps));

            try {
                const frame = captureFrameBuffer(this.videoElement, this.canvasElement);
                afterFrames.push(frame);
            } catch (error) {
                console.error('After-frame capture error:', error);
            }
        }

        return afterFrames;
    }

    /**
     * Get current buffer and capture additional frames
     */
    async captureLivePhoto(): Promise<string[]> {
        // Get buffered frames (before)
        const beforeFrames = [...this.frameBuffer];

        // Capture additional frames (after)
        const afterFrames = await this.captureAfterFrames(0.5);

        // Combine all frames
        return [...beforeFrames, ...afterFrames];
    }

    /**
     * Stop buffering and cleanup
     */
    stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.frameBuffer = [];
        this.videoElement = null;
    }

    /**
     * Get buffer status
     */
    getBufferStatus(): { current: number; max: number; percentage: number } {
        return {
            current: this.frameBuffer.length,
            max: this.bufferSize,
            percentage: (this.frameBuffer.length / this.bufferSize) * 100
        };
    }
}

/**
 * Convert frames to video using MediaRecorder (modern approach)
 * Safari-compatible with codec detection
 */
export async function createVideoFromFrames(
    frames: string[],
    fps: number = 15
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            // Check if MediaRecorder is supported
            if (typeof MediaRecorder === 'undefined') {
                reject(new Error('MediaRecorder is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari 14+'));
                return;
            }

            // Check if captureStream is supported
            if (typeof HTMLCanvasElement.prototype.captureStream === 'undefined') {
                reject(new Error('Canvas captureStream is not supported in this browser'));
                return;
            }

            // Create a temporary video element and canvas
            const canvas = document.createElement('canvas');
            const video = document.createElement('video');
            const stream = canvas.captureStream(fps);

            // Detect supported codec (Safari needs H.264/MP4, Chrome/Firefox can use WebM)
            let mimeType = 'video/webm'; // Default fallback
            let blobType = 'video/webm';
            
            // Try MP4 with H.264 first (Safari/iOS compatible)
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
                mimeType = 'video/mp4;codecs=h264';
                blobType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
                mimeType = 'video/mp4;codecs=avc1.42E01E'; // H.264 baseline
                blobType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
                blobType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp9';
                blobType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                mimeType = 'video/webm;codecs=vp8';
                blobType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
                blobType = 'video/webm';
            }

            // Use MediaRecorder to create video
            let mediaRecorder: MediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: 2500000 // 2.5 Mbps
                });
            } catch (error) {
                reject(new Error(`Failed to create MediaRecorder with ${mimeType}. Your browser may not support this codec.`));
                return;
            }

            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                try {
                    const blob = new Blob(chunks, { type: blobType });
                    if (blob.size === 0) {
                        reject(new Error('Generated video is empty. This may be a browser compatibility issue.'));
                        return;
                    }
                    resolve(blob);
                } catch (error) {
                    reject(new Error('Failed to create video blob: ' + (error instanceof Error ? error.message : String(error))));
                }
            };

            mediaRecorder.onerror = (event) => {
                reject(new Error('MediaRecorder error: ' + (event.error?.message || 'Unknown error')));
            };

            // Start recording with error handling
            try {
                mediaRecorder.start(100); // Request data every 100ms for better Safari compatibility
            } catch (error) {
                reject(new Error('Failed to start MediaRecorder: ' + (error instanceof Error ? error.message : String(error))));
                return;
            }

            // Draw frames sequentially
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            let frameIndex = 0;
            const frameDuration = 1000 / fps;

            const drawFrame = () => {
                if (frameIndex >= frames.length) {
                    // All frames drawn, stop recording
                    setTimeout(() => {
                        mediaRecorder.stop();
                    }, frameDuration);
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    // Set canvas size from first frame
                    if (frameIndex === 0) {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }

                    // Flip horizontally for correct orientation
                    ctx.save();
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.restore();

                    frameIndex++;
                    setTimeout(drawFrame, frameDuration);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load frame image'));
                };

                img.src = frames[frameIndex];
            };

            drawFrame();

        } catch (error) {
            reject(error);
        }
    });
}
