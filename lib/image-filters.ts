export type FilterType =
    | 'vintiq-warm'
    | 'sepia-classic'
    | 'mono-film'
    | 'polaroid-fade'
    | 'kodak-gold'
    | 'fuji-superia'
    | 'drama-bw'
    | 'cinematic-cool';

export interface FilterConfig {
    name: string;
    displayName: string;
    description: string;
    apply: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const FILTERS: Record<FilterType, FilterConfig> = {
    'vintiq-warm': {
        name: 'vintiq-warm',
        displayName: 'Vintiq Warm',
        description: 'Soft warm tones with vintage fade',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Warmth + Fade
                data[i] = r * 1.1 + 10;     // Red boost
                data[i + 1] = g * 1.0 + 5;  // Green slight boost
                data[i + 2] = b * 0.9;      // Blue reduce
            }
            ctx.putImageData(imageData, 0, 0);

            // Overlay warm color
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(255, 200, 150, 0.15)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        },
    },
    'sepia-classic': {
        name: 'sepia-classic',
        displayName: 'Sepia Classic',
        description: 'Traditional brown photobooth look',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Sepia formula
                data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
            }
            ctx.putImageData(imageData, 0, 0);
        },
    },
    'mono-film': {
        name: 'mono-film',
        displayName: 'Mono Film',
        description: 'Soft B&W with subtle grain',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Grayscale
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // Add contrast
                const contrast = 1.1;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                const cGray = factor * (gray - 128) + 128;

                data[i] = cGray;
                data[i + 1] = cGray;
                data[i + 2] = cGray;
            }
            ctx.putImageData(imageData, 0, 0);
        },
    },
    'polaroid-fade': {
        name: 'polaroid-fade',
        displayName: 'Polaroid Fade',
        description: 'Washed out with blue shadows',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Lift blacks (fade)
                data[i] = r * 0.9 + 20;
                data[i + 1] = g * 0.9 + 20;
                data[i + 2] = b * 1.1 + 20; // Blue tint in shadows
            }
            ctx.putImageData(imageData, 0, 0);

            // Soft light overlay
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = 'rgba(200, 220, 255, 0.2)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        }
    },
    'kodak-gold': {
        name: 'kodak-gold',
        displayName: 'Kodak Gold',
        description: 'Vibrant yellows and rich contrast',
        apply: (ctx, width, height) => {
            // Warm overlay first
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(255, 220, 100, 0.2)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Increase saturation slightly
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                data[i] = r * 1.1;
                data[i + 1] = g * 1.05;
                data[i + 2] = b * 0.9;
            }
            ctx.putImageData(imageData, 0, 0);
        }
    },
    'fuji-superia': {
        name: 'fuji-superia',
        displayName: 'Fuji Superia',
        description: 'Cool greens and magenta tints',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                data[i] = r * 0.95;
                data[i + 1] = g * 1.05; // Green boost
                data[i + 2] = b * 1.05; // Blue boost
            }
            ctx.putImageData(imageData, 0, 0);

            // Magenta tint in highlights
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255, 0, 255, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        }
    },
    'drama-bw': {
        name: 'drama-bw',
        displayName: 'Drama B&W',
        description: 'High contrast black and white',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Grayscale
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // High contrast curve
                if (gray > 128) gray = gray * 1.2;
                else gray = gray * 0.8;

                // Clamp
                gray = Math.min(255, Math.max(0, gray));

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
        }
    },
    'cinematic-cool': {
        name: 'cinematic-cool',
        displayName: 'Cinematic',
        description: 'Teal and orange movie look',
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Shadows -> Teal, Highlights -> Orange
                // Simple approximation
                data[i] = r * 1.1; // Red boost (orange)
                data[i + 1] = g * 1.0;
                data[i + 2] = b * 1.2; // Blue boost (teal)
            }
            ctx.putImageData(imageData, 0, 0);
        }
    }
};

/**
 * Apply selected filter to canvas
 */
export function applyFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filterType: FilterType
): void {
    const filter = FILTERS[filterType];
    if (filter) {
        filter.apply(ctx, width, height);
    }
}
