import vintagejs from 'vintagejs';

export type FilterType =
    | 'vintiq-warm'
    | 'sepia-classic'
    | 'mono-film'
    | 'polaroid-fade'
    | 'kodak-gold'
    | 'fuji-superia'
    | 'drama-bw'
    | 'cinematic-cool'
    | 'vintagejs-classic'
    | 'vintagejs-sepia'
    | 'vintagejs-bright'
    | 'vintagejs-dark'
    | 'vintagejs-warm'
    | 'vintagejs-cool'
    | 'vintagejs-faded'
    | 'vintagejs-high-contrast'
    | 'vintagejs-soft'
    | 'vintagejs-vivid'
    | 'vintage-warm'
    | 'vintage-sepia'
    | 'vintage-bw'
    | 'vintage-fade'
    | 'vintage-classic'
    | 'vintage-old'
    | 'vintage-grainy'
    | 'vintage-soft';

export interface FilterConfig {
    name: string;
    displayName: string;
    description: string;
    apply: (ctx: CanvasRenderingContext2D, width: number, height: number) => void | Promise<void>;
}

/**
 * Apply vintageJS effect to canvas
 * Helper function to use vintageJS library
 * Based on: https://github.com/rendro/vintageJS
 */
async function applyVintageJSEffect(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    effect: any
): Promise<void> {
    const canvas = ctx.canvas;
    
    try {
        // Create a copy of the current canvas content
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Create temporary canvas for vintageJS
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return;
        
        // Put image data to temp canvas
        tempCtx.putImageData(imageData, 0, 0);
        
        // Use vintageJS on the temp canvas
        const result = await vintagejs(tempCanvas, effect);
        const resultCanvas = result.getCanvas();
        
        // Copy result back to original canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(resultCanvas, 0, 0, width, height);
    } catch (error) {
        console.error('Error applying vintageJS effect:', error);
        // Fallback: continue without vintageJS
    }
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
    },
    // VintageJS Filters
    'vintagejs-classic': {
        name: 'vintagejs-classic',
        displayName: 'Vintage Classic',
        description: 'Classic vintage look with sepia and vignette',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.15,
                saturation: 0.7,
                sepia: true,
                vignette: 0.3
            });
        }
    },
    'vintagejs-sepia': {
        name: 'vintagejs-sepia',
        displayName: 'Vintage Sepia',
        description: 'Rich sepia tone with warm vintage feel',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.15,
                contrast: 0.2,
                saturation: 0.5,
                sepia: true,
                vignette: 0.4
            });
        }
    },
    'vintagejs-bright': {
        name: 'vintagejs-bright',
        displayName: 'Vintage Bright',
        description: 'Bright vintage look with soft tones',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: 0.1,
                contrast: 0.1,
                saturation: 0.8,
                sepia: false,
                lighten: 0.15,
                vignette: 0.2
            });
        }
    },
    'vintagejs-dark': {
        name: 'vintagejs-dark',
        displayName: 'Vintage Dark',
        description: 'Moody dark vintage with strong vignette',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.2,
                contrast: 0.25,
                saturation: 0.6,
                sepia: false,
                vignette: 0.5
            });
        }
    },
    'vintagejs-warm': {
        name: 'vintagejs-warm',
        displayName: 'Vintage Warm',
        description: 'Warm vintage tones with golden glow',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.05,
                contrast: 0.15,
                saturation: 0.9,
                sepia: false,
                vignette: 0.25,
                screen: {
                    r: 255,
                    g: 220,
                    b: 150,
                    a: 0.15
                }
            });
        }
    },
    'vintagejs-cool': {
        name: 'vintagejs-cool',
        displayName: 'Vintage Cool',
        description: 'Cool vintage tones with blue shadows',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.15,
                saturation: 0.8,
                sepia: false,
                vignette: 0.3,
                screen: {
                    r: 200,
                    g: 220,
                    b: 255,
                    a: 0.1
                }
            });
        }
    },
    'vintagejs-faded': {
        name: 'vintagejs-faded',
        displayName: 'Vintage Faded',
        description: 'Faded vintage look with lifted blacks',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: 0.15,
                contrast: -0.2,
                saturation: 0.6,
                sepia: false,
                lighten: 0.2,
                vignette: 0.15
            });
        }
    },
    'vintagejs-high-contrast': {
        name: 'vintagejs-high-contrast',
        displayName: 'Vintage High Contrast',
        description: 'High contrast vintage with dramatic look',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.3,
                saturation: 0.9,
                sepia: false,
                vignette: 0.4
            });
        }
    },
    'vintagejs-soft': {
        name: 'vintagejs-soft',
        displayName: 'Vintage Soft',
        description: 'Soft vintage with gentle tones',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: 0.05,
                contrast: -0.1,
                saturation: 0.7,
                sepia: false,
                lighten: 0.1,
                vignette: 0.2
            });
        }
    },
    'vintagejs-vivid': {
        name: 'vintagejs-vivid',
        displayName: 'Vintage Vivid',
        description: 'Vivid vintage with enhanced colors',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.05,
                contrast: 0.2,
                saturation: 1.2,
                sepia: false,
                vignette: 0.3
            });
        }
    },
    // New VintageJS Filters (specified configurations)
    'vintage-warm': {
        name: 'vintage-warm',
        displayName: 'Vintiq Warm',
        description: 'Warm vintage tones with sepia',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.1,
                saturation: 0.8,
                sepia: true,
                vignette: 0.2
            });
        }
    },
    'vintage-sepia': {
        name: 'vintage-sepia',
        displayName: 'Vintiq Sepia',
        description: 'Classic sepia with vintage feel',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.15,
                contrast: 0.15,
                saturation: 0.5,
                sepia: true,
                vignette: 0.3,
                lighten: 0.1
            });
        }
    },
    'vintage-bw': {
        name: 'vintage-bw',
        displayName: 'Vintiq B&W',
        description: 'Black and white vintage look',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.2,
                gray: true,
                vignette: 0.4
            });
        }
    },
    'vintage-fade': {
        name: 'vintage-fade',
        displayName: 'Vintiq Fade',
        description: 'Faded vintage with sepia tone',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: 0.1,
                contrast: -0.2,
                saturation: 0.6,
                sepia: true,
                lighten: 0.2,
                vignette: 0.3
            });
        }
    },
    'vintage-classic': {
        name: 'vintage-classic',
        displayName: 'Vintiq Classic',
        description: 'Classic vintage look',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.1,
                contrast: 0.1,
                saturation: 0.7,
                sepia: true,
                vignette: 0.3
            });
        }
    },
    'vintage-old': {
        name: 'vintage-old',
        displayName: 'Vintiq Old',
        description: 'Aged vintage photo effect',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.2,
                contrast: 0.05,
                saturation: 0.4,
                sepia: true,
                vignette: 0.5,
                lighten: 0.15
            });
        }
    },
    'vintage-grainy': {
        name: 'vintage-grainy',
        displayName: 'Vintiq Grainy',
        description: 'Grainy vintage with sepia',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: -0.15,
                contrast: 0.2,
                saturation: 0.6,
                sepia: true,
                vignette: 0.4
            });
        }
    },
    'vintage-soft': {
        name: 'vintage-soft',
        displayName: 'Vintiq Soft',
        description: 'Soft vintage tones',
        apply: async (ctx, width, height) => {
            await applyVintageJSEffect(ctx, width, height, {
                brightness: 0.05,
                contrast: -0.1,
                saturation: 0.8,
                sepia: false,
                vignette: 0.2,
                lighten: 0.1
            });
        }
    }
};

/**
 * Apply selected filter to canvas
 * Supports both sync and async filters
 */
export async function applyFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filterType: FilterType
): Promise<void> {
    const filter = FILTERS[filterType];
    if (filter) {
        const result = filter.apply(ctx, width, height);
        // If filter returns a Promise, wait for it
        if (result instanceof Promise) {
            await result;
        }
    }
}
