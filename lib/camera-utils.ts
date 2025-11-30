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
