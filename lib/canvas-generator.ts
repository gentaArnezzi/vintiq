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
