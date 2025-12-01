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
 */
export async function createVideoFromFrames(
    frames: string[],
    fps: number = 15
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            // Create a temporary video element and canvas
            const canvas = document.createElement('canvas');
            const video = document.createElement('video');
            const stream = canvas.captureStream(fps);

            // Use MediaRecorder to create video
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });

            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };

            mediaRecorder.onerror = (e) => {
                reject(new Error('MediaRecorder error: ' + e));
            };

            // Start recording
            mediaRecorder.start();

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
