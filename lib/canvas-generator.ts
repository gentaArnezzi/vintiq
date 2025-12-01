import { applyFilter, type FilterType } from './image-filters';
import { format } from 'date-fns';

export type LayoutType = 'vertical-4';
export type BackgroundStyle =
    | 'classic-cream'
    | 'vintage-paper'
    | 'retro-grid'
    | 'torn-paper'
    | 'tape-edges'
    | 'folded-corners'
    | 'stained-paper'
    | 'staples-edges'
    | 'worn-vintage'
    | 'wood-texture'
    | 'vintage-wood'
    | 'camera-roll-film'
    | 'aged-wood'
    | 'weathered-wood'
    | 'barn-wood';

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

        // Draw frame based on background type
        if (background === 'camera-roll-film') {
            // For film strip: no individual border, will be handled by film strip frame
        } else {
            // Normal white border for other backgrounds
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(PADDING_X - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);
        }

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

    // 3. Draw Film Strip Frame (after photos, so perforations are on top)
    // For camera-roll-film, extend to bottom including branding area
    if (background === 'camera-roll-film') {
        drawFilmStripFrame(ctx, STRIP_WIDTH, STRIP_HEIGHT, PADDING_TOP, PHOTO_HEIGHT, GAP, PHOTO_WIDTH, PADDING_X, true);
    }

    // 4. Draw Branding
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
        case 'torn-paper':
            // Base cream color with noise
            ctx.fillStyle = '#f5f1e8';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.08);
            // Draw torn edges
            drawTornEdges(ctx, width, height);
            break;
        case 'tape-edges':
            // Base paper color
            ctx.fillStyle = '#fef9e7';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.06);
            // Draw tape strips on edges
            drawTapeEdges(ctx, width, height);
            break;
        case 'folded-corners':
            // Base paper color
            ctx.fillStyle = '#faf8f3';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.07);
            // Draw folded corner effects
            drawFoldedCorners(ctx, width, height);
            break;
        case 'stained-paper':
            // Base paper color
            ctx.fillStyle = '#f9f6f0';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.08);
            // Add vintage stains
            drawStains(ctx, width, height);
            break;
        case 'staples-edges':
            // Base paper color
            ctx.fillStyle = '#fdfbf7';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.06);
            // Draw staples on edges
            drawStaples(ctx, width, height);
            break;
        case 'worn-vintage':
            // Base worn paper color
            ctx.fillStyle = '#f4f0e6';
            ctx.fillRect(0, 0, width, height);
            addNoise(ctx, width, height, 0.1);
            // Add worn effects (scratches, aging)
            drawWornEffects(ctx, width, height);
            break;
        case 'wood-texture':
            // Base wood color
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 0, width, height);
            // Draw wood grain texture
            drawWoodTexture(ctx, width, height, false);
            break;
        case 'vintage-wood':
            // Darker vintage wood color
            ctx.fillStyle = '#8b6f47';
            ctx.fillRect(0, 0, width, height);
            // Draw aged wood texture with more character
            drawWoodTexture(ctx, width, height, true);
            break;
        case 'camera-roll-film':
            // Full black background for camera-roll-film
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            // Film strip will be drawn on top, but background is already black
            break;
        case 'aged-wood':
            // Aged wood color
            ctx.fillStyle = '#6b5238';
            ctx.fillRect(0, 0, width, height);
            // Draw heavily aged wood texture
            drawAgedWood(ctx, width, height);
            break;
        case 'weathered-wood':
            // Weathered wood color
            ctx.fillStyle = '#5a4530';
            ctx.fillRect(0, 0, width, height);
            // Draw weathered wood texture
            drawWeatheredWood(ctx, width, height);
            break;
        case 'barn-wood':
            // Barn wood color
            ctx.fillStyle = '#7a5f42';
            ctx.fillRect(0, 0, width, height);
            // Draw barn wood texture
            drawBarnWood(ctx, width, height);
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
    // List of dark backgrounds that need light text
    const darkBackgrounds: BackgroundStyle[] = [
        'camera-roll-film', // Camera roll film has black background extending to bottom
        'vintage-wood',
        'aged-wood',
        'weathered-wood',
        'barn-wood'
    ];
    
    const isDark = darkBackgrounds.includes(background);
    const textColor = isDark ? '#FFFFFF' : '#2C2C2C';
    const accentColor = isDark ? '#D4D4D4' : '#6B7280'; // Darker gray for better visibility
    
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
    
    // Website - make it more visible
    ctx.font = '13px Inter, sans-serif';
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

// Draw torn/ripped paper edges
function drawTornEdges(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Create torn edge pattern on left and right sides
    const edgeWidth = 15;
    const tearFrequency = 8;
    
    // Left edge
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let y = 0; y < height; y += tearFrequency) {
        const offset = (Math.random() - 0.5) * edgeWidth;
        ctx.lineTo(offset, y);
    }
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();
    
    // Right edge
    ctx.beginPath();
    ctx.moveTo(width, 0);
    for (let y = 0; y < height; y += tearFrequency) {
        const offset = width + (Math.random() - 0.5) * edgeWidth;
        ctx.lineTo(offset, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(width, 0);
    ctx.fill();
    
    // Top and bottom edges with subtle tears
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x < width; x += tearFrequency * 2) {
        const offset = (Math.random() - 0.5) * edgeWidth * 0.5;
        ctx.lineTo(x, offset);
    }
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x < width; x += tearFrequency * 2) {
        const offset = height + (Math.random() - 0.5) * edgeWidth * 0.5;
        ctx.lineTo(x, offset);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
    
    ctx.restore();
}

// Draw tape strips on edges
function drawTapeEdges(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Semi-transparent beige tape color
    const tapeColor = 'rgba(255, 248, 220, 0.7)';
    const tapeWidth = 25;
    
    // Top tape
    ctx.fillStyle = tapeColor;
    ctx.fillRect(0, 0, width, tapeWidth);
    // Add tape texture (subtle lines)
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, tapeWidth / 3 * (i + 1));
        ctx.lineTo(width, tapeWidth / 3 * (i + 1));
        ctx.stroke();
    }
    
    // Bottom tape
    ctx.fillStyle = tapeColor;
    ctx.fillRect(0, height - tapeWidth, width, tapeWidth);
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height - tapeWidth + tapeWidth / 3 * (i + 1));
        ctx.lineTo(width, height - tapeWidth + tapeWidth / 3 * (i + 1));
        ctx.stroke();
    }
    
    // Left tape
    ctx.fillStyle = tapeColor;
    ctx.fillRect(0, 0, tapeWidth, height);
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(tapeWidth / 3 * (i + 1), 0);
        ctx.lineTo(tapeWidth / 3 * (i + 1), height);
        ctx.stroke();
    }
    
    // Right tape
    ctx.fillStyle = tapeColor;
    ctx.fillRect(width - tapeWidth, 0, tapeWidth, height);
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(width - tapeWidth + tapeWidth / 3 * (i + 1), 0);
        ctx.lineTo(width - tapeWidth + tapeWidth / 3 * (i + 1), height);
        ctx.stroke();
    }
    
    // Add tape shine/reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, width, tapeWidth * 0.3);
    ctx.fillRect(0, height - tapeWidth, width, tapeWidth * 0.3);
    ctx.fillRect(0, 0, tapeWidth * 0.3, height);
    ctx.fillRect(width - tapeWidth, 0, tapeWidth * 0.3, height);
    
    ctx.restore();
}

// Draw folded corner effects
function drawFoldedCorners(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    const cornerSize = 80;
    const foldShadow = 'rgba(0, 0, 0, 0.15)';
    const foldHighlight = 'rgba(255, 255, 255, 0.4)';
    
    // Top-left corner fold
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.closePath();
    ctx.fillStyle = foldShadow;
    ctx.fill();
    
    // Top-right corner fold
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - cornerSize, 0);
    ctx.lineTo(width, cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-left corner fold
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(cornerSize, height);
    ctx.lineTo(0, height - cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-right corner fold
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - cornerSize, height);
    ctx.lineTo(width, height - cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Add fold lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, cornerSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - cornerSize, cornerSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(cornerSize, height - cornerSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - cornerSize, height - cornerSize);
    ctx.stroke();
    
    // Add highlights
    ctx.strokeStyle = foldHighlight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(cornerSize - 5, cornerSize - 5);
    ctx.stroke();
    
    ctx.restore();
}

// Draw vintage stains/spots
function drawStains(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Create random coffee/tea stains
    const stainCount = 4;
    const stainColors = [
        'rgba(139, 90, 43, 0.15)',  // Coffee brown
        'rgba(101, 67, 33, 0.12)',  // Darker brown
        'rgba(160, 120, 80, 0.1)',  // Lighter brown
    ];
    
    for (let i = 0; i < stainCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 30 + Math.random() * 50;
        const color = stainColors[Math.floor(Math.random() * stainColors.length)];
        
        // Create irregular stain shape
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color.replace('0.15', '0.08').replace('0.12', '0.06').replace('0.1', '0.05'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Create irregular circle
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const r = radius * (0.7 + Math.random() * 0.3);
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (angle === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    // Add some yellowing/aging spots
    ctx.fillStyle = 'rgba(255, 240, 200, 0.2)';
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 40 + Math.random() * 60;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 240, 200, 0.25)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw staples on edges
function drawStaples(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    const stapleColor = 'rgba(100, 100, 100, 0.6)';
    const stapleSize = 8;
    const stapleSpacing = 150;
    
    // Top edge staples
    for (let x = 50; x < width - 50; x += stapleSpacing) {
        ctx.fillStyle = stapleColor;
        // Draw staple shape (U shape)
        ctx.beginPath();
        ctx.arc(x, 5, stapleSize / 2, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(x - stapleSize / 2, 5, stapleSize, 3);
    }
    
    // Bottom edge staples
    for (let x = 50; x < width - 50; x += stapleSpacing) {
        ctx.fillStyle = stapleColor;
        ctx.beginPath();
        ctx.arc(x, height - 5, stapleSize / 2, Math.PI, 0, true);
        ctx.fill();
        ctx.fillRect(x - stapleSize / 2, height - 8, stapleSize, 3);
    }
    
    // Left edge staples
    for (let y = 50; y < height - 50; y += stapleSpacing) {
        ctx.fillStyle = stapleColor;
        ctx.beginPath();
        ctx.arc(5, y, stapleSize / 2, Math.PI / 2, -Math.PI / 2);
        ctx.fill();
        ctx.fillRect(5, y - stapleSize / 2, 3, stapleSize);
    }
    
    // Right edge staples
    for (let y = 50; y < height - 50; y += stapleSpacing) {
        ctx.fillStyle = stapleColor;
        ctx.beginPath();
        ctx.arc(width - 5, y, stapleSize / 2, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.fillRect(width - 8, y - stapleSize / 2, 3, stapleSize);
    }
    
    ctx.restore();
}

// Draw worn/aged effects
function drawWornEffects(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Add scratches
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const length = 20 + Math.random() * 80;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Add worn edges (darker areas)
    const edgeGradient = ctx.createLinearGradient(0, 0, 0, height);
    edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    edgeGradient.addColorStop(0.1, 'transparent');
    edgeGradient.addColorStop(0.9, 'transparent');
    edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(0, 0, width, height);
    
    const sideGradient = ctx.createLinearGradient(0, 0, width, 0);
    sideGradient.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
    sideGradient.addColorStop(0.1, 'transparent');
    sideGradient.addColorStop(0.9, 'transparent');
    sideGradient.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
    ctx.fillStyle = sideGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some random dark spots
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 5 + Math.random() * 15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw wood grain texture
function drawWoodTexture(ctx: CanvasRenderingContext2D, width: number, height: number, isVintage: boolean) {
    ctx.save();
    
    // Wood grain colors
    const lightWood = isVintage ? 'rgba(180, 140, 100, 0.4)' : 'rgba(220, 180, 140, 0.5)';
    const darkWood = isVintage ? 'rgba(60, 40, 25, 0.3)' : 'rgba(100, 70, 50, 0.3)';
    const mediumWood = isVintage ? 'rgba(120, 90, 65, 0.35)' : 'rgba(160, 120, 90, 0.4)';
    
    // Draw horizontal wood grain lines
    const grainSpacing = 3 + Math.random() * 2;
    for (let y = 0; y < height; y += grainSpacing) {
        const variation = (Math.random() - 0.5) * 2;
        const grainY = y + variation;
        
        // Create wavy grain pattern
        ctx.beginPath();
        ctx.moveTo(0, grainY);
        
        for (let x = 0; x < width; x += 5) {
            const wave = Math.sin(x / 30) * 0.5 + Math.sin(x / 15) * 0.3;
            ctx.lineTo(x, grainY + wave);
        }
        
        // Vary line width and opacity for natural look
        const opacity = 0.3 + Math.random() * 0.4;
        ctx.strokeStyle = isVintage 
            ? `rgba(${Math.floor(60 + Math.random() * 40)}, ${Math.floor(40 + Math.random() * 30)}, ${Math.floor(25 + Math.random() * 20)}, ${opacity})`
            : `rgba(${Math.floor(100 + Math.random() * 60)}, ${Math.floor(70 + Math.random() * 50)}, ${Math.floor(50 + Math.random() * 40)}, ${opacity})`;
        ctx.lineWidth = 0.5 + Math.random() * 0.5;
        ctx.stroke();
    }
    
    // Draw vertical wood planks/boards
    const plankWidth = 80 + Math.random() * 40;
    for (let x = 0; x < width; x += plankWidth) {
        const plankX = x + (Math.random() - 0.5) * 10;
        
        // Draw plank edge (darker line)
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plankX, 0);
        ctx.lineTo(plankX, height);
        ctx.stroke();
        
        // Add subtle variation within each plank
        const plankGradient = ctx.createLinearGradient(plankX, 0, plankX + plankWidth, 0);
        plankGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        plankGradient.addColorStop(0.5, 'transparent');
        plankGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        ctx.fillStyle = plankGradient;
        ctx.fillRect(plankX, 0, plankWidth, height);
    }
    
    // Add knots and natural imperfections
    const knotCount = isVintage ? 8 : 5;
    for (let i = 0; i < knotCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 8 + Math.random() * 15;
        
        // Draw knot (darker circle)
        const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        knotGradient.addColorStop(0, darkWood);
        knotGradient.addColorStop(0.5, mediumWood);
        knotGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = knotGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add ring around knot
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Add some random darker streaks for character
    for (let i = 0; i < (isVintage ? 12 : 8); i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 30 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    // Add subtle aging/wear for vintage wood
    if (isVintage) {
        // Add darker patches
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const w = 20 + Math.random() * 40;
            const h = 20 + Math.random() * 40;
            const gradient = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w, h));
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w, h);
        }
        
        // Add scratches
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const length = 15 + Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
            ctx.stroke();
        }
    }
    
    // Add overall noise for texture
    addNoise(ctx, width, height, isVintage ? 0.12 : 0.08);
    
    ctx.restore();
}

// Draw camera roll film strip frame with perforations
function drawFilmStripFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    paddingTop: number,
    photoHeight: number,
    gap: number,
    photoWidth: number,
    paddingX: number,
    extendToBottom: boolean = false
) {
    ctx.save();
    
    // Calculate film strip area - black strip covers all photos with FULL thick border
    const borderThickness = 40; // Much thicker black border for full effect
    const filmStripTop = paddingTop - borderThickness; // Full border above
    
    // If extendToBottom, extend to the very bottom of canvas (including branding area) - FULL BLACK
    const filmStripBottom = extendToBottom ? height : paddingTop + (photoHeight * 4) + (gap * 3) + borderThickness;
    const filmStripHeight = filmStripBottom - filmStripTop;
    const filmStripLeft = paddingX - borderThickness; // Full border on left
    const filmStripRight = paddingX + photoWidth + borderThickness; // Full border on right
    const filmStripWidth = filmStripRight - filmStripLeft;
    
    // Draw black film strip background (only border areas, not covering photos)
    // Top border
    ctx.fillStyle = '#000000';
    ctx.fillRect(filmStripLeft, filmStripTop, filmStripWidth, borderThickness);
    // Bottom border (if not extending to bottom)
    if (!extendToBottom) {
        ctx.fillRect(filmStripLeft, filmStripBottom - borderThickness, filmStripWidth, borderThickness);
    } else {
        // If extending to bottom, draw bottom border
        ctx.fillRect(filmStripLeft, height - borderThickness, filmStripWidth, borderThickness);
    }
    // Left border (excluding photo area)
    ctx.fillRect(filmStripLeft, paddingTop - borderThickness, borderThickness, (photoHeight * 4) + (gap * 3) + (borderThickness * 2));
    // Right border (excluding photo area)
    ctx.fillRect(filmStripRight - borderThickness, paddingTop - borderThickness, borderThickness, (photoHeight * 4) + (gap * 3) + (borderThickness * 2));
    
    // Draw black background for branding area if extending to bottom
    if (extendToBottom) {
        const brandingAreaTop = paddingTop + (photoHeight * 4) + (gap * 3) + borderThickness;
        ctx.fillRect(filmStripLeft, brandingAreaTop, filmStripWidth, height - brandingAreaTop);
    }
    
    // Draw rectangular perforations with rounded corners on LEFT side
    const holeWidth = 22; // Much larger width of rectangular hole
    const holeHeight = 32; // Much larger height of rectangular hole (vertical orientation)
    const holeSpacing = 65; // More spacing between holes vertically
    const cornerRadius = 5; // Larger rounded corner radius
    const holeXLeft = filmStripLeft + 20; // Position more towards center (moved from edge)
    
    ctx.fillStyle = '#FFFFFF'; // White holes (showing cream background through)
    for (let y = filmStripTop + 15; y < filmStripBottom - 15; y += holeSpacing) {
        // Draw rounded rectangle perforation on left (vertically oriented)
        const x = holeXLeft - holeWidth / 2;
        const yPos = y - holeHeight / 2;
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, yPos);
        ctx.lineTo(x + holeWidth - cornerRadius, yPos);
        ctx.arc(x + holeWidth - cornerRadius, yPos + cornerRadius, cornerRadius, -Math.PI / 2, 0);
        ctx.lineTo(x + holeWidth, yPos + holeHeight - cornerRadius);
        ctx.arc(x + holeWidth - cornerRadius, yPos + holeHeight - cornerRadius, cornerRadius, 0, Math.PI / 2);
        ctx.lineTo(x + cornerRadius, yPos + holeHeight);
        ctx.arc(x + cornerRadius, yPos + holeHeight - cornerRadius, cornerRadius, Math.PI / 2, Math.PI);
        ctx.lineTo(x, yPos + cornerRadius);
        ctx.arc(x + cornerRadius, yPos + cornerRadius, cornerRadius, Math.PI, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw rectangular perforations with rounded corners on RIGHT side
    const holeXRight = filmStripRight - 20; // Position more towards center (moved from edge)
    for (let y = filmStripTop + 15; y < filmStripBottom - 15; y += holeSpacing) {
        // Draw rounded rectangle perforation on right (vertically oriented)
        const x = holeXRight - holeWidth / 2;
        const yPos = y - holeHeight / 2;
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, yPos);
        ctx.lineTo(x + holeWidth - cornerRadius, yPos);
        ctx.arc(x + holeWidth - cornerRadius, yPos + cornerRadius, cornerRadius, -Math.PI / 2, 0);
        ctx.lineTo(x + holeWidth, yPos + holeHeight - cornerRadius);
        ctx.arc(x + holeWidth - cornerRadius, yPos + holeHeight - cornerRadius, cornerRadius, 0, Math.PI / 2);
        ctx.lineTo(x + cornerRadius, yPos + holeHeight);
        ctx.arc(x + cornerRadius, yPos + holeHeight - cornerRadius, cornerRadius, Math.PI / 2, Math.PI);
        ctx.lineTo(x, yPos + cornerRadius);
        ctx.arc(x + cornerRadius, yPos + cornerRadius, cornerRadius, Math.PI, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Add subtle shadow/depth effect on film strip edges
    const shadowGradient = ctx.createLinearGradient(filmStripLeft, 0, filmStripLeft + 10, 0);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(filmStripLeft, filmStripTop, 10, filmStripHeight);
    
    const shadowGradientRight = ctx.createLinearGradient(filmStripRight - 10, 0, filmStripRight, 0);
    shadowGradientRight.addColorStop(0, 'transparent');
    shadowGradientRight.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = shadowGradientRight;
    ctx.fillRect(filmStripRight - 10, filmStripTop, 10, filmStripHeight);
    
    // Add subtle film texture/grain on the black strip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let i = 0; i < 300; i++) {
        const x = filmStripLeft + Math.random() * filmStripWidth;
        const y = filmStripTop + Math.random() * filmStripHeight;
        ctx.fillRect(x, y, 1, 1);
    }
    
    // Add horizontal scan lines for film texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 0.5;
    for (let y = filmStripTop; y < filmStripBottom; y += 2) {
        ctx.beginPath();
        ctx.moveTo(filmStripLeft, y);
        ctx.lineTo(filmStripRight, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw camera roll film strip background (old function, kept for compatibility)
function drawFilmStrip(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Draw film strip perforations on top and bottom
    const holeSize = 8;
    const holeSpacing = 20;
    const holeYTop = 15;
    const holeYBottom = height - 15;
    
    ctx.fillStyle = '#000000';
    
    // Top perforations
    for (let x = 20; x < width - 20; x += holeSpacing) {
        ctx.beginPath();
        ctx.arc(x, holeYTop, holeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Bottom perforations
    for (let x = 20; x < width - 20; x += holeSpacing) {
        ctx.beginPath();
        ctx.arc(x, holeYBottom, holeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add film grain
    addNoise(ctx, width, height, 0.15);
    
    // Add subtle film texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw aged wood texture
function drawAgedWood(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Base aged wood color
    const lightWood = 'rgba(120, 90, 65, 0.5)';
    const darkWood = 'rgba(40, 25, 15, 0.4)';
    const mediumWood = 'rgba(80, 60, 40, 0.45)';
    
    // Draw horizontal wood grain with more aging
    const grainSpacing = 2 + Math.random() * 1.5;
    for (let y = 0; y < height; y += grainSpacing) {
        const variation = (Math.random() - 0.5) * 3;
        const grainY = y + variation;
        
        ctx.beginPath();
        ctx.moveTo(0, grainY);
        
        for (let x = 0; x < width; x += 4) {
            const wave = Math.sin(x / 25) * 0.8 + Math.sin(x / 12) * 0.4;
            ctx.lineTo(x, grainY + wave);
        }
        
        const opacity = 0.4 + Math.random() * 0.3;
        ctx.strokeStyle = `rgba(${Math.floor(40 + Math.random() * 50)}, ${Math.floor(25 + Math.random() * 40)}, ${Math.floor(15 + Math.random() * 30)}, ${opacity})`;
        ctx.lineWidth = 0.8 + Math.random() * 0.6;
        ctx.stroke();
    }
    
    // Draw vertical planks with aging
    const plankWidth = 70 + Math.random() * 35;
    for (let x = 0; x < width; x += plankWidth) {
        const plankX = x + (Math.random() - 0.5) * 12;
        
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plankX, 0);
        ctx.lineTo(plankX, height);
        ctx.stroke();
        
        // Add aging patches
        for (let i = 0; i < 3; i++) {
            const patchY = Math.random() * height;
            const patchH = 30 + Math.random() * 50;
            const gradient = ctx.createLinearGradient(plankX, patchY, plankX + plankWidth, patchY + patchH);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(plankX, patchY, plankWidth, patchH);
        }
    }
    
    // Add more knots
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 10 + Math.random() * 20;
        
        const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        knotGradient.addColorStop(0, darkWood);
        knotGradient.addColorStop(0.5, mediumWood);
        knotGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = knotGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Heavy noise for aged look
    addNoise(ctx, width, height, 0.15);
    
    ctx.restore();
}

// Draw weathered wood texture
function drawWeatheredWood(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Weathered wood has more gray tones
    const lightWood = 'rgba(100, 80, 60, 0.4)';
    const darkWood = 'rgba(30, 20, 15, 0.5)';
    const grayWood = 'rgba(60, 50, 40, 0.45)';
    
    // Draw horizontal grain with weathering
    const grainSpacing = 2.5 + Math.random() * 1.5;
    for (let y = 0; y < height; y += grainSpacing) {
        const variation = (Math.random() - 0.5) * 4;
        const grainY = y + variation;
        
        ctx.beginPath();
        ctx.moveTo(0, grainY);
        
        for (let x = 0; x < width; x += 5) {
            const wave = Math.sin(x / 20) * 1.0 + Math.sin(x / 10) * 0.5;
            ctx.lineTo(x, grainY + wave);
        }
        
        const opacity = 0.45 + Math.random() * 0.35;
        ctx.strokeStyle = `rgba(${Math.floor(30 + Math.random() * 70)}, ${Math.floor(20 + Math.random() * 60)}, ${Math.floor(15 + Math.random() * 45)}, ${opacity})`;
        ctx.lineWidth = 1 + Math.random() * 0.7;
        ctx.stroke();
    }
    
    // Draw weathered planks
    const plankWidth = 65 + Math.random() * 40;
    for (let x = 0; x < width; x += plankWidth) {
        const plankX = x + (Math.random() - 0.5) * 15;
        
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plankX, 0);
        ctx.lineTo(plankX, height);
        ctx.stroke();
        
        // Add weathering streaks
        for (let i = 0; i < 5; i++) {
            const streakY = Math.random() * height;
            const streakH = 40 + Math.random() * 80;
            const gradient = ctx.createLinearGradient(plankX, streakY, plankX + plankWidth, streakY + streakH);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
            gradient.addColorStop(0.5, 'rgba(50, 40, 30, 0.2)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(plankX, streakY, plankWidth, streakH);
        }
    }
    
    // Add cracks and splits
    ctx.strokeStyle = darkWood;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y1 = Math.random() * height * 0.3;
        const y2 = height - Math.random() * height * 0.3;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x + (Math.random() - 0.5) * 20, (y1 + y2) / 2);
        ctx.lineTo(x, y2);
        ctx.stroke();
    }
    
    // Heavy noise
    addNoise(ctx, width, height, 0.18);
    
    ctx.restore();
}

// Draw barn wood texture
function drawBarnWood(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    // Barn wood has warm, rustic tones
    const lightWood = 'rgba(140, 100, 70, 0.5)';
    const darkWood = 'rgba(50, 35, 25, 0.4)';
    const mediumWood = 'rgba(90, 65, 45, 0.45)';
    
    // Draw horizontal grain
    const grainSpacing = 3 + Math.random() * 2;
    for (let y = 0; y < height; y += grainSpacing) {
        const variation = (Math.random() - 0.5) * 3.5;
        const grainY = y + variation;
        
        ctx.beginPath();
        ctx.moveTo(0, grainY);
        
        for (let x = 0; x < width; x += 4) {
            const wave = Math.sin(x / 30) * 0.9 + Math.sin(x / 15) * 0.4;
            ctx.lineTo(x, grainY + wave);
        }
        
        const opacity = 0.4 + Math.random() * 0.4;
        ctx.strokeStyle = `rgba(${Math.floor(50 + Math.random() * 90)}, ${Math.floor(35 + Math.random() * 65)}, ${Math.floor(25 + Math.random() * 45)}, ${opacity})`;
        ctx.lineWidth = 0.9 + Math.random() * 0.8;
        ctx.stroke();
    }
    
    // Draw barn wood planks (wider spacing)
    const plankWidth = 90 + Math.random() * 50;
    for (let x = 0; x < width; x += plankWidth) {
        const plankX = x + (Math.random() - 0.5) * 10;
        
        ctx.strokeStyle = darkWood;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plankX, 0);
        ctx.lineTo(plankX, height);
        ctx.stroke();
        
        // Add rustic variations
        const plankGradient = ctx.createLinearGradient(plankX, 0, plankX + plankWidth, 0);
        plankGradient.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
        plankGradient.addColorStop(0.5, 'transparent');
        plankGradient.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
        ctx.fillStyle = plankGradient;
        ctx.fillRect(plankX, 0, plankWidth, height);
    }
    
    // Add knots and nail holes
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 8 + Math.random() * 18;
        
        const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        knotGradient.addColorStop(0, darkWood);
        knotGradient.addColorStop(0.6, mediumWood);
        knotGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = knotGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Nail holes
        if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add noise
    addNoise(ctx, width, height, 0.13);
    
    ctx.restore();
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
        // Initialize arrays with fixed length to maintain exact order
        const videoElements: (HTMLVideoElement | undefined)[] = new Array(4);
        const videoUrls: string[] = [];
        const imageElements: (HTMLImageElement | undefined)[] = new Array(4);

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

            // Pre-load static images for fallback (always load if photo exists, regardless of live photo)
            const imagePromises = photos.map(async (photoUrl, index) => {
                if (photoUrl) {
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

            // Reset all videos to first frame for consistent capture
            videoElements.forEach(video => {
                if (video) {
                    video.currentTime = 0;
                }
            });
            
            // Wait for videos to seek to frame 0
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Start all videos simultaneously
            const playPromises = videoElements.map(video => {
                if (video) {
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

            const drawFrame = async () => {
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
                // IMPORTANT: Maintain exact order from input arrays (photos and livePhotos)
                // Index i corresponds to the same position in both arrays
                for (let i = 0; i < 4; i++) {
                    const y = PADDING_TOP + i * (PHOTO_HEIGHT + GAP);

                    // Draw frame based on background type
                    if (background === 'camera-roll-film') {
                        // For film strip: black border around each photo
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(PADDING_X - 8, y - 8, PHOTO_WIDTH + 16, PHOTO_HEIGHT + 16);
                    } else {
                        // Normal white border for other backgrounds
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(PADDING_X - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);
                    }

                    // Get video and image for this exact index (maintains order)
                    // IMPORTANT: Use exact index to preserve order from input arrays
                    const video = videoElements[i];
                    const image = imageElements[i];

                    // For live photo: use video (animated)
                    // For static photo: use image (static)
                    if (video && video.readyState >= 2) {
                        // Live photo: use video frame that's currently playing (animated)
                        // Ensure video is playing for animation
                        if (video.paused) {
                            video.play().catch(() => {});
                        }

                        ctx.save();

                        // Create temp canvas for video frame processing
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = PHOTO_WIDTH;
                        tempCanvas.height = PHOTO_HEIGHT;
                        const tempCtx = tempCanvas.getContext('2d');

                        if (tempCtx) {
                            // Draw current video frame (video is playing, so frame changes each animation frame)
                            drawCoverVideo(tempCtx, video, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

                            // Apply filter using same method as static photos
                            applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                            // Draw processed video frame
                            ctx.drawImage(tempCanvas, PADDING_X, y);
                        }

                        ctx.restore();
                    } else if (image) {
                        // Static photo: use static image (not animated)
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

                // 3. Draw Film Strip Frame (after photos, so perforations are on top)
                // For camera-roll-film, extend to bottom including branding area
                if (background === 'camera-roll-film') {
                    drawFilmStripFrame(ctx, STRIP_WIDTH, STRIP_HEIGHT, PADDING_TOP, PHOTO_HEIGHT, GAP, PHOTO_WIDTH, PADDING_X, true);
                }

                // 4. Draw Branding
                drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

                animationFrameId = requestAnimationFrame(() => {
                    drawFrame().catch(err => {
                        console.error('Error in drawFrame:', err);
                    });
                });
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
// Note: This function is deprecated - filters are now applied using pixel-based processing
// Keeping for backward compatibility but should not be used
function getCanvasFilterString(type: FilterType): string {
    switch (type) {
        case 'vintiq-warm': return 'sepia(0.2) contrast(0.9) brightness(1.1) saturate(1.1)';
        case 'sepia-classic': return 'sepia(0.8) contrast(0.9)';
        case 'mono-film': return 'grayscale(1) contrast(1.1)';
        case 'polaroid-fade': return 'brightness(1.1) contrast(0.9) saturate(0.8)';
        case 'kodak-gold': return 'saturate(1.2) contrast(1.1) sepia(0.1)';
        case 'fuji-superia': return 'saturate(1.1) hue-rotate(-10deg)';
        case 'drama-bw': return 'grayscale(1) contrast(1.3)';
        case 'cinematic-cool': return 'saturate(1.15) hue-rotate(-5deg) contrast(1.1) brightness(1.05)';
        default: return '';
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
