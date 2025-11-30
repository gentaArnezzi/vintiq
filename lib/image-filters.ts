// Vintage filter implementations

export type FilterType = 'vintiq-warm' | 'sepia' | 'mono';

export interface FilterConfig {
    name: string;
    displayName: string;
    description: string;
}

export const FILTERS: Record<FilterType, FilterConfig> = {
    'vintiq-warm': {
        name: 'vintiq-warm',
        displayName: 'Vintiq Warm',
        description: 'Warm tones with vintage fade',
    },
    'sepia': {
        name: 'sepia',
        displayName: 'Sepia Classic',
        description: 'Classic sepia brown tones',
    },
    'mono': {
        name: 'mono',
        displayName: 'Mono Film',
        description: 'Soft black & white film',
    },
};

/**
 * Apply Vintiq Warm filter
 * Warm tone, slight fade, reduced contrast
 */
export function applyVintiqWarm(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Increase red channel
        data[i] = Math.min(255, data[i] * 1.15);

        // Slightly increase green
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);

        // Slightly decrease blue  
        data[i + 2] = data[i + 2] * 0.9;

        // Add slight fade (increase brightness of darker areas)
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (avg < 128) {
            data[i] = data[i] + (128 - avg) * 0.1;
            data[i + 1] = data[i + 1] + (128 - avg) * 0.1;
            data[i + 2] = data[i + 2] + (128 - avg) * 0.1;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply Sepia Classic filter
 * Traditional sepia tone effect
 */
export function applySepiaClassic(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Sepia formula
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // Red
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // Green
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply Mono Film filter
 * Soft black & white with subtle grain
 */
export function applyMonoFilm(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale using luminosity method
        const gray = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);

        // Add subtle grain (random noise)
        const noise = (Math.random() - 0.5) * 10;
        const grayWithNoise = Math.min(255, Math.max(0, gray + noise));

        // Soften by reducing contrast slightly
        const softGray = grayWithNoise * 0.95 + 12;

        data[i] = softGray;     // Red
        data[i + 1] = softGray; // Green
        data[i + 2] = softGray; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply selected filter to canvas
 */
export function applyFilter(
    canvas: HTMLCanvasElement,
    filterType: FilterType
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    switch (filterType) {
        case 'vintiq-warm':
            applyVintiqWarm(ctx, canvas.width, canvas.height);
            break;
        case 'sepia':
            applySepiaClassic(ctx, canvas.width, canvas.height);
            break;
        case 'mono':
            applyMonoFilm(ctx, canvas.width, canvas.height);
            break;
    }
}
