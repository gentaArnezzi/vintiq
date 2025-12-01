import { applyFilter, type FilterType } from './image-filters';
import { format } from 'date-fns';

export type LayoutType = 'vertical-4';
export type BackgroundStyle =
    | 'classic-cream'
    | 'film-noir'
    | 'vintage-paper'
    | 'retro-grid'
    | 'soft-pink'
    | 'sage-green';

interface GenerateOptions {
    photos: (string | null)[];
    filter: FilterType;
    layout: LayoutType;
    background?: BackgroundStyle;
}

export async function generatePhotostrip({
    photos,
    filter,
    layout,
    background = 'classic-cream'
}: GenerateOptions): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Constants for 4-strip layout
    const STRIP_WIDTH = 600;
    const PHOTO_WIDTH = 520; // Width of photo area
    const PHOTO_HEIGHT = 390; // 4:3 aspect ratio
    const PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2; // 40px
    const PADDING_TOP = 60;
    const GAP = 30;
    const BOTTOM_SPACE = 120; // Space for branding

    // Calculate total height
    const STRIP_HEIGHT = PADDING_TOP + (PHOTO_HEIGHT * 4) + (GAP * 3) + BOTTOM_SPACE;

    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;

    // 1. Draw Background
    drawBackground(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

    // 2. Process and Draw Photos
    for (let i = 0; i < photos.length; i++) {
        const photoUrl = photos[i];
        const y = PADDING_TOP + i * (PHOTO_HEIGHT + GAP);

        // Draw white border/frame effect for all slots
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(PADDING_X - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);

        if (photoUrl) {
            // Load and process image
            const img = await loadImage(photoUrl);

            // Create temp canvas for processing
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = PHOTO_WIDTH;
            tempCanvas.height = PHOTO_HEIGHT;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
                // Draw image covering the area (center crop)
                drawCover(tempCtx, img, PHOTO_WIDTH, PHOTO_HEIGHT);

                // Apply filter
                applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                // Draw photo
                ctx.drawImage(tempCanvas, PADDING_X, y);
            }
        } else {
            // Draw Placeholder
            ctx.fillStyle = '#f5f5f4'; // stone-100
            ctx.fillRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);

            // Draw dashed border
            ctx.strokeStyle = '#d6d3d1'; // stone-300
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.strokeRect(PADDING_X + 2, y + 2, PHOTO_WIDTH - 4, PHOTO_HEIGHT - 4);
            ctx.setLineDash([]);

            // Draw number
            ctx.fillStyle = '#a8a29e'; // stone-400
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${i + 1}`, PADDING_X + PHOTO_WIDTH / 2, y + PHOTO_HEIGHT / 2);
        }

        // Add inner shadow/vignette for depth (for both photos and placeholders)
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);
    }

    // 3. Draw Branding
    drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

    return canvas;
}

function drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    style: BackgroundStyle
) {
    switch (style) {
        case 'film-noir':
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);
            break;
        case 'soft-pink':
            ctx.fillStyle = '#fce7f3'; // pink-100
            ctx.fillRect(0, 0, width, height);
            break;
        case 'sage-green':
            ctx.fillStyle = '#e2e8f0'; // slate-200 (sage-ish)
            ctx.fillRect(0, 0, width, height);
            // Add subtle tint
            ctx.fillStyle = 'rgba(100, 150, 100, 0.1)';
            ctx.fillRect(0, 0, width, height);
            break;
        case 'vintage-paper':
            ctx.fillStyle = '#fdfbf7';
            ctx.fillRect(0, 0, width, height);
            // Add noise/grain
            addNoise(ctx, width, height, 0.05);
            break;
        case 'retro-grid':
            ctx.fillStyle = '#fdfbf7';
            ctx.fillRect(0, 0, width, height);
            // Draw grid
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            break;
        case 'classic-cream':
        default:
            // Vintage gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#FFF8E7');
            gradient.addColorStop(1, '#FFE4B5');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            break;
    }
}

function drawBranding(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    background: BackgroundStyle
) {
    const isDark = background === 'film-noir';
    const textColor = isDark ? '#FFFFFF' : '#2C2C2C';
    const accentColor = isDark ? '#888888' : '#8B4513';

    ctx.textAlign = 'center';

    // Date
    const dateStr = format(new Date(), 'dd • MM • yyyy');
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(dateStr, width / 2, height - 85);

    // Logo Text
    ctx.font = 'bold 32px Playfair Display, serif';
    ctx.fillStyle = textColor;
    ctx.fillText('VINTIQ STUDIO', width / 2, height - 45);

    // Website
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText('vintiq.studio', width / 2, height - 25);
}

function addNoise(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount * 255;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }

    ctx.putImageData(imageData, 0, 0);
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > targetRatio) {
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sy = 0;
        sx = (img.width - sWidth) / 2;
    } else {
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
}

export function downloadCanvas(canvas: HTMLCanvasElement) {
    const link = document.createElement('a');
    const timestamp = format(new Date(), 'yyyyMMdd-HHmm');
    link.download = `vintiq-photostrip-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

export function downloadVideo(blob: Blob) {
    const link = document.createElement('a');
    const timestamp = format(new Date(), 'yyyyMMdd-HHmm');
    // Always use .mp4 extension for Instagram and gallery compatibility
    // Even if the blob is WebM, we'll name it .mp4 (user can convert if needed)
    link.download = `vintiq-live-strip-${timestamp}.mp4`;
    link.href = URL.createObjectURL(blob);
    link.click();
    // Cleanup URL after a delay
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

interface LiveStripOptions extends GenerateOptions {
    livePhotos: (Blob | null)[];
}

export async function generateLiveStripVideo({
    photos,
    livePhotos,
    filter,
    layout,
    background = 'classic-cream'
}: LiveStripOptions): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        const videoElements: HTMLVideoElement[] = [];
        const videoUrls: string[] = [];
        const imageElements: HTMLImageElement[] = [];

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Constants (Same as static strip)
            const STRIP_WIDTH = 600;
            const PHOTO_WIDTH = 520;
            const PHOTO_HEIGHT = 390;
            const PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2;
            const PADDING_TOP = 60;
            const GAP = 30;
            const BOTTOM_SPACE = 120;
            const STRIP_HEIGHT = PADDING_TOP + (PHOTO_HEIGHT * 4) + (GAP * 3) + BOTTOM_SPACE;

            canvas.width = STRIP_WIDTH;
            canvas.height = STRIP_HEIGHT;

            // Pre-load static images for fallback
            const imagePromises = photos.map(async (photoUrl, index) => {
                if (photoUrl && !livePhotos[index]) {
                    const img = await loadImage(photoUrl);
                    imageElements[index] = img;
                }
            });
            await Promise.all(imagePromises);

            // Load all videos and wait for them to be ready
            const videoPromises = livePhotos.map(async (blob, index) => {
                if (blob) {
                    const video = document.createElement('video');
                    const url = URL.createObjectURL(blob);
                    videoUrls.push(url);
                    video.src = url;
                    video.muted = true;
                    video.playsInline = true;
                    video.loop = true;
                    video.preload = 'auto';

                    // Wait for video to be loaded and ready
                    await new Promise<void>((resolveVideo, rejectVideo) => {
                        video.onloadedmetadata = () => {
                            video.oncanplaythrough = () => {
                                resolveVideo();
                            };
                            video.onerror = rejectVideo;
                        };
                        video.onerror = rejectVideo;
                    });

                    videoElements[index] = video;
                }
            });

            await Promise.all(videoPromises);

            // Find the longest video duration (or use default 2 seconds)
            let maxDuration = 2000; // Default 2 seconds
            for (const video of videoElements) {
                if (video && video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
                    const durationMs = video.duration * 1000;
                    if (durationMs > maxDuration) {
                        maxDuration = durationMs;
                    }
                }
            }

            // Ensure minimum duration of 2 seconds
            const DURATION = Math.max(maxDuration, 2000);

            // Start all videos simultaneously
            const playPromises = videoElements.map(video => {
                if (video) {
                    video.currentTime = 0;
                    return video.play().catch(err => {
                        console.warn('Video play failed:', err);
                    });
                }
            });
            await Promise.all(playPromises);

            // Wait a bit for videos to start playing
            await new Promise(resolve => setTimeout(resolve, 100));

            // Setup MediaRecorder
            // Prioritize MP4 (H.264) for Instagram and gallery compatibility
            const stream = canvas.captureStream(30); // 30 FPS
            let mimeType = 'video/mp4'; // Default to MP4
            
            // Try MP4 with H.264 codec first (best for Instagram/gallery)
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
                mimeType = 'video/mp4;codecs=h264';
            } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
                mimeType = 'video/mp4;codecs=avc1.42E01E'; // H.264 baseline
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                // Fallback to WebM if MP4 not supported (rare)
                mimeType = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                // Cleanup
                videoElements.forEach(v => {
                    if (v) {
                        v.pause();
                        v.src = '';
                    }
                });
                videoUrls.forEach(url => URL.revokeObjectURL(url));
                resolve(blob);
            };

            mediaRecorder.onerror = (e) => {
                reject(new Error('MediaRecorder error'));
            };

            // Animation Loop
            const startTime = Date.now();
            let animationFrameId: number;

            const drawFrame = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= DURATION) {
                    mediaRecorder.stop();
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                    }
                    return;
                }

                // 1. Draw Background (Static)
                drawBackground(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

                // 2. Draw Photos/Videos
                for (let i = 0; i < 4; i++) {
                    const y = PADDING_TOP + i * (PHOTO_HEIGHT + GAP);

                    // Draw white frame
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(PADDING_X - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);

                    const video = videoElements[i];
                    const image = imageElements[i];

                    if (video && video.readyState >= 2) {
                        // Draw Video Frame
                        ctx.save();

                        // Apply Filter (using CSS filter string on context)
                        ctx.filter = getCanvasFilterString(filter);

                        // Draw video centered/covered
                        drawCoverVideo(ctx, video, PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);

                        ctx.restore();
                    } else if (image) {
                        // Fallback to static image
                        ctx.save();

                        // Create temp canvas for processing
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = PHOTO_WIDTH;
                        tempCanvas.height = PHOTO_HEIGHT;
                        const tempCtx = tempCanvas.getContext('2d');

                        if (tempCtx) {
                            // Draw image covering the area (center crop)
                            drawCover(tempCtx, image, PHOTO_WIDTH, PHOTO_HEIGHT);

                            // Apply filter
                            applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                            // Draw photo
                            ctx.drawImage(tempCanvas, PADDING_X, y);
                        }

                        ctx.restore();
                    } else {
                        // Placeholder
                        ctx.fillStyle = '#f5f5f4';
                        ctx.fillRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);

                        // Draw dashed border
                        ctx.strokeStyle = '#d6d3d1';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([10, 10]);
                        ctx.strokeRect(PADDING_X + 2, y + 2, PHOTO_WIDTH - 4, PHOTO_HEIGHT - 4);
                        ctx.setLineDash([]);

                        // Draw number
                        ctx.fillStyle = '#a8a29e';
                        ctx.font = 'bold 48px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`${i + 1}`, PADDING_X + PHOTO_WIDTH / 2, y + PHOTO_HEIGHT / 2);
                    }

                    // Inner shadow
                    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);
                }

                // 3. Draw Branding
                drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

                animationFrameId = requestAnimationFrame(drawFrame);
            };

            mediaRecorder.start();
            drawFrame();

        } catch (error) {
            // Cleanup on error
            videoElements.forEach(v => {
                if (v) {
                    v.pause();
                    v.src = '';
                }
            });
            videoUrls.forEach(url => URL.revokeObjectURL(url));
            reject(error);
        }
    });
}

// Helper to map FilterType to Canvas filter string
function getCanvasFilterString(type: FilterType): string {
    switch (type) {
        case 'vintiq-warm': return 'sepia(0.2) contrast(0.9) brightness(1.1) saturate(1.1)';
        case 'sepia-classic': return 'sepia(0.8) contrast(0.9)';
        case 'mono-film': return 'grayscale(1) contrast(1.1)';
        case 'polaroid-fade': return 'brightness(1.1) contrast(0.9) saturate(0.8)';
        case 'kodak-gold': return 'saturate(1.2) contrast(1.1) sepia(0.1)';
        case 'fuji-superia': return 'saturate(1.1) hue-rotate(-10deg)';
        case 'drama-bw': return 'grayscale(1) contrast(1.3)';
        case 'cinematic-cool': return 'contrast(1.1) saturate(1.1)';
        default: return 'none';
    }
}

function drawCoverVideo(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const vidRatio = video.videoWidth / video.videoHeight;
    const targetRatio = width / height;
    let sx, sy, sWidth, sHeight;

    if (vidRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = video.videoHeight * targetRatio;
        sy = 0;
        sx = (video.videoWidth - sWidth) / 2;
    } else {
        sWidth = video.videoWidth;
        sHeight = video.videoWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight, x, y, width, height);
}
