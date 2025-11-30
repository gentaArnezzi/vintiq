// Canvas generator for creating photostrips
import { format } from 'date-fns';
import { applyFilter, type FilterType } from './image-filters';
import { loadImageFromDataUrl } from './image-utils';

export interface PhotostripConfig {
    photos: string[]; // Array of data URLs (4 photos)
    filter: FilterType;
    layout: 'vertical-4' | '2x2'; // For future: more layouts
    brandingText?: string;
    date?: Date;
}

const STRIP_WIDTH = 600;
const STRIP_HEIGHT = 1800;
const PHOTO_WIDTH = 520;
const PHOTO_HEIGHT = 390;
const PHOTO_SPACING = 20;
const BORDER_WIDTH = 8;
const BRANDING_HEIGHT = 60;

/**
 * Generate photostrip from 4 photos
 */
export async function generatePhotostrip(
    config: PhotostripConfig
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to create canvas context');
    }

    // Set canvas dimensions for vertical 4-cut strip
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;

    // Draw vintage background
    const gradient = ctx.createLinearGradient(0, 0, 0, STRIP_HEIGHT);
    gradient.addColorStop(0, '#FFF8E7');
    gradient.addColorStop(1, '#FFE4B5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

    // Calculate positions for 4 photos vertically
    const startX = (STRIP_WIDTH - PHOTO_WIDTH) / 2;
    const startY = 40;

    // Load and draw each photo
    for (let i = 0; i < 4; i++) {
        if (!config.photos[i]) continue;

        const photoY = startY + i * (PHOTO_HEIGHT + PHOTO_SPACING);

        // Create temporary canvas for photo processing
        const photoCanvas = document.createElement('canvas');
        const photoCtx = photoCanvas.getContext('2d');

        if (!photoCtx) continue;

        // Load image
        const img = await loadImageFromDataUrl(config.photos[i]);

        // Set photo canvas size
        photoCanvas.width = PHOTO_WIDTH;
        photoCanvas.height = PHOTO_HEIGHT;

        // Calculate scaling to cover the photo area
        const scale = Math.max(
            PHOTO_WIDTH / img.width,
            PHOTO_HEIGHT / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (PHOTO_WIDTH - scaledWidth) / 2;
        const y = (PHOTO_HEIGHT - scaledHeight) / 2;

        // Fill background
        photoCtx.fillStyle = '#000';
        photoCtx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

        // Draw image
        photoCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Apply filter
        applyFilter(photoCanvas, config.filter);

        // Draw white border
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
            startX - BORDER_WIDTH,
            photoY - BORDER_WIDTH,
            PHOTO_WIDTH + BORDER_WIDTH * 2,
            PHOTO_HEIGHT + BORDER_WIDTH * 2
        );

        // Draw photo with filter
        ctx.drawImage(photoCanvas, startX, photoY);
    }

    // Add branding at bottom
    const brandingY = STRIP_HEIGHT - BRANDING_HEIGHT;

    // Branding background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, brandingY, STRIP_WIDTH, BRANDING_HEIGHT);

    // Branding text
    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';

    const brandingMainText = config.brandingText || 'Vintiq';
    ctx.fillText(brandingMainText, STRIP_WIDTH / 2, brandingY + 25);

    // Date
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#704214';
    const dateText = format(config.date || new Date(), 'dd MMM yyyy');
    ctx.fillText(`• ${dateText} •`, STRIP_WIDTH / 2, brandingY + 45);

    return canvas;
}

/**
 * Download canvas as image file
 */
export function downloadCanvas(
    canvas: HTMLCanvasElement,
    filename?: string
): void {
    const link = document.createElement('a');
    const timestamp = format(new Date(), 'yyyyMMdd-HHmm');
    link.download = filename || `vintiq-photostrip-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
