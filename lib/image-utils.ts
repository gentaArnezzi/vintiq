// Image processing utilities

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate uploaded image file
 */
export function validateImageFile(file: File): ImageValidationResult {
    // Check file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file format. Please use JPG or PNG. Got: ${file.type}`,
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            error: `File too large (${sizeMB}MB). Maximum size is 10MB.`,
        };
    }

    return { valid: true };
}

/**
 * Load image file to canvas
 */
export async function loadImageToCanvas(
    file: File,
    canvas: HTMLCanvasElement
): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) {
                reject(new Error('Failed to read file'));
                return;
            }

            img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = e.target.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Load image from data URL
 */
export async function loadImageFromDataUrl(
    dataUrl: string
): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        img.src = dataUrl;
    });
}

/**
 * Resize image to fit target dimensions while maintaining aspect ratio
 */
export function resizeImage(
    sourceCanvas: HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number
): HTMLCanvasElement {
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Calculate scaling to cover the target area
    const scale = Math.max(
        targetWidth / sourceCanvas.width,
        targetHeight / sourceCanvas.height
    );

    const scaledWidth = sourceCanvas.width * scale;
    const scaledHeight = sourceCanvas.height * scale;

    // Center the image
    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;

    // Fill background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw scaled image
    ctx.drawImage(sourceCanvas, x, y, scaledWidth, scaledHeight);

    return outputCanvas;
}

/**
 * Convert File to data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error('Failed to read file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
