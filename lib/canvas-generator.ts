import { applyFilter, type FilterType } from './image-filters';
import { format } from 'date-fns';

export type LayoutType = 'vertical-2' | 'vertical-3' | 'vertical-4' | 'grid-2x2' | 'polaroid';
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
    | 'barn-wood'
    | 'vintage-brown'
    | 'vintage-brown-textured'
    | 'vintage-brown-brick'
    | 'christmas-theme'
    | 'christmas-red-theme';

interface GenerateOptions {
    photos: (string | null)[];
    filter: FilterType;
    layout: LayoutType;
    background?: BackgroundStyle;
    customText?: string;
}

export async function generatePhotostrip({
    photos,
    filter,
    layout,
    background = 'classic-cream',
    customText = ''
}: GenerateOptions): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Constants for strip layout
    const STRIP_WIDTH = 600;
    const PHOTO_WIDTH = 520; // Width of photo area
    const PHOTO_HEIGHT = 390; // 4:3 aspect ratio
    const PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2; // 40px
    const PADDING_TOP = 60;
    const GAP = 30;
    const BOTTOM_SPACE = 120; // Space for branding

    // Determine photo count
    // For vertical layouts, it's strict. For grid/polaroid, it depends on input photos
    let photoCount = 4;
    if (layout === 'vertical-2') photoCount = 2;
    else if (layout === 'vertical-3') photoCount = 3;
    else if (layout === 'vertical-4') photoCount = 4;
    else {
        // For grid and polaroid, use the length of the provided photos array
        // But we need to handle the case where photos array might have nulls if coming from preview
        // However, usually validPhotos are passed here. 
        // If photos has nulls (preview mode), we count total slots?
        // Let's assume photos.length is the intended count for Grid/Polaroid if not vertical
        photoCount = photos.length;
    }

    if (layout === 'grid-2x2') {
        return generateGridLayout(ctx, photos, filter, background, customText, photoCount);
    } else if (layout === 'polaroid') {
        return generatePolaroidLayout(ctx, photos, filter, background, customText, photoCount);
    }

    // Calculate total height dynamically based on photo count
    const STRIP_HEIGHT = PADDING_TOP + (PHOTO_HEIGHT * photoCount) + (GAP * (photoCount - 1)) + BOTTOM_SPACE;

    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;

    // 1. Draw Background
    await drawBackground(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

    // 2. Process and Draw Photos
    for (let i = 0; i < photoCount; i++) {
        const photoUrl = i < photos.length ? photos[i] : null;
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
                await applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                // Draw photo
                ctx.drawImage(tempCanvas, PADDING_X, y);
            }
            
            // Add vintage photo corners with tape (only for non-film backgrounds)
            if (background !== 'camera-roll-film' && Math.random() > 0.4) {
                drawPhotoCorners(ctx, PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);
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

    // 3.5. Draw Christmas overlay elements (snowflakes and stickers on top layer)
    if (background === 'christmas-theme' || background === 'christmas-red-theme') {
        await drawChristmasOverlay(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);
    }

    // 4. Draw Branding
    drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background, customText);

    return canvas;
}

async function generateGridLayout(
    ctx: CanvasRenderingContext2D,
    photos: (string | null)[],
    filter: FilterType,
    background: BackgroundStyle,
    customText: string = '',
    photoCount: number = 4
): Promise<HTMLCanvasElement> {
    const STRIP_WIDTH = 800;
    const PHOTO_SIZE = 350; // Square photos
    const GAP = 30;
    const PADDING = 40;
    const BOTTOM_SPACE = 120;

    // Define cols and rows based on photoCount
    const cols = 2;
    const rows = photoCount <= 2 ? 1 : 2;

    const STRIP_HEIGHT = PADDING + (PHOTO_SIZE * rows) + (GAP * (rows - 1)) + BOTTOM_SPACE;

    ctx.canvas.width = STRIP_WIDTH;
    ctx.canvas.height = STRIP_HEIGHT;

    // 1. Draw Background
    await drawBackground(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

    // 2. Draw Photos (Grid)
    for (let i = 0; i < photoCount; i++) {
        const photoUrl = i < photos.length ? photos[i] : null;

        let x = 0;
        let y = 0;

        if (photoCount === 3) {
            // Special layout for 3 photos:
            // 0: Top Left
            // 1: Bottom Left
            // 2: Right (Centered Vertically)

            if (i === 0) {
                x = PADDING;
                y = PADDING;
            } else if (i === 1) {
                x = PADDING;
                y = PADDING + PHOTO_SIZE + GAP;
            } else if (i === 2) {
                x = PADDING + PHOTO_SIZE + GAP;
                y = PADDING + (PHOTO_SIZE / 2) + (GAP / 2); // Centered vertically relative to the 2 rows
            }
        } else {
            // Standard Grid (2 or 4)
            const col = i % cols;
            const row = Math.floor(i / cols);
            x = PADDING + col * (PHOTO_SIZE + GAP);
            y = PADDING + row * (PHOTO_SIZE + GAP);
        }

        // Draw frame
        if (background !== 'camera-roll-film') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 10, y - 10, PHOTO_SIZE + 20, PHOTO_SIZE + 20);
        }

        if (photoUrl) {
            const img = await loadImage(photoUrl);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = PHOTO_SIZE;
            tempCanvas.height = PHOTO_SIZE;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
                drawCover(tempCtx, img, PHOTO_SIZE, PHOTO_SIZE);
                await applyFilter(tempCtx, PHOTO_SIZE, PHOTO_SIZE, filter);
                ctx.drawImage(tempCanvas, x, y);
            }
        } else {
            // Placeholder
            ctx.fillStyle = '#f5f5f4';
            ctx.fillRect(x, y, PHOTO_SIZE, PHOTO_SIZE);
            ctx.strokeStyle = '#d6d3d1';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.strokeRect(x + 2, y + 2, PHOTO_SIZE - 4, PHOTO_SIZE - 4);
            ctx.setLineDash([]);

            ctx.fillStyle = '#a8a29e';
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${i + 1}`, x + PHOTO_SIZE / 2, y + PHOTO_SIZE / 2);
        }

        // Inner shadow
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, PHOTO_SIZE, PHOTO_SIZE);
    }

    // 3. Draw Film Strip Frame (if camera-roll-film)
    if (background === 'camera-roll-film') {
        const contentWidth = (PHOTO_SIZE * 2) + GAP;
        const contentHeight = (PHOTO_SIZE * rows) + (GAP * (rows - 1));
        drawGenericFilmStripFrame(
            ctx,
            STRIP_WIDTH,
            STRIP_HEIGHT,
            PADDING,
            PADDING,
            contentWidth,
            contentHeight,
            true
        );
    }

    // 3.5. Draw Christmas overlay elements (snowflakes and stickers on top layer)
    if (background === 'christmas-theme' || background === 'christmas-red-theme') {
        await drawChristmasOverlay(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);
    }

    // 4. Draw Branding
    drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background, customText);

    return ctx.canvas;
}

async function generatePolaroidLayout(
    ctx: CanvasRenderingContext2D,
    photos: (string | null)[],
    filter: FilterType,
    background: BackgroundStyle,
    customText: string = '',
    photoCount: number = 1
): Promise<HTMLCanvasElement> {
    const CARD_WIDTH = 600;
    const PHOTO_WIDTH = 520;
    const PHOTO_HEIGHT = 520; // Square photo for polaroid
    const PADDING_X = (CARD_WIDTH - PHOTO_WIDTH) / 2;
    const PADDING_TOP = 40;
    const BOTTOM_SPACE = 160; // Larger space for writing

    const CARD_HEIGHT = PADDING_TOP + PHOTO_HEIGHT + BOTTOM_SPACE;

    ctx.canvas.width = CARD_WIDTH;
    ctx.canvas.height = CARD_HEIGHT;

    // 1. Draw Background (usually white for polaroid, but let's support others)
    await drawBackground(ctx, CARD_WIDTH, CARD_HEIGHT, background);

    // 2. Draw Photo (Use the first photo only)
    const photoUrl = photos.length > 0 ? photos[0] : null;
    const y = PADDING_TOP;

    // Draw frame
    if (background !== 'camera-roll-film') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(PADDING_X - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);
    }

    if (photoUrl) {
        const img = await loadImage(photoUrl);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = PHOTO_WIDTH;
        tempCanvas.height = PHOTO_HEIGHT;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
            drawCover(tempCtx, img, PHOTO_WIDTH, PHOTO_HEIGHT);
            await applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);
            ctx.drawImage(tempCanvas, PADDING_X, y);
        }
        
        // Add vintage photo corners with tape
        if (background !== 'camera-roll-film' && Math.random() > 0.4) {
            drawPhotoCorners(ctx, PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);
        }
    } else {
        // Placeholder
        ctx.fillStyle = '#f5f5f4';
        ctx.fillRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(PADDING_X + 2, y + 2, PHOTO_WIDTH - 4, PHOTO_HEIGHT - 4);
        ctx.setLineDash([]);

        ctx.fillStyle = '#a8a29e';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', PADDING_X + PHOTO_WIDTH / 2, y + PHOTO_HEIGHT / 2);
    }

    // Inner shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PADDING_X, y, PHOTO_WIDTH, PHOTO_HEIGHT);

    // 3. Draw Film Strip Frame (if camera-roll-film)
    if (background === 'camera-roll-film') {
        drawGenericFilmStripFrame(
            ctx,
            CARD_WIDTH,
            CARD_HEIGHT,
            PADDING_X,
            PADDING_TOP,
            PHOTO_WIDTH,
            PHOTO_HEIGHT,
            true
        );
    }

    // 3.5. Draw Christmas overlay elements (snowflakes and stickers on top layer)
    if (background === 'christmas-theme' || background === 'christmas-red-theme') {
        await drawChristmasOverlay(ctx, CARD_WIDTH, CARD_HEIGHT, background);
    }

    // 4. Draw Branding (smaller/subtle for polaroid)
    drawBranding(ctx, CARD_WIDTH, CARD_HEIGHT, background, customText);

    return ctx.canvas;
}

async function drawBackground(
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
            // Add decorative vintage elements
            drawDecorativeTapes(ctx, width, height);
            drawTornPaperPieces(ctx, width, height);
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
            // Add subtle decorative elements
            addNoise(ctx, width, height, 0.03);
            drawDecorativeTapes(ctx, width, height);
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
        case 'vintage-brown':
            // Vintage brown background with color #a0462d
            ctx.fillStyle = '#a0462d';
            ctx.fillRect(0, 0, width, height);
            // Add vintage texture and noise
            addNoise(ctx, width, height, 0.08);
            // Add subtle vintage effects
            drawVintageBrownTexture(ctx, width, height);
            break;
        case 'vintage-brown-textured':
            // Vintage brown background with color #a0462d and heavy texture
            ctx.fillStyle = '#a0462d';
            ctx.fillRect(0, 0, width, height);
            // Add heavy noise for texture - INCREASED for more visibility
            addNoise(ctx, width, height, 0.18);
            // Add heavy vintage texture effects
            drawVintageBrownTextured(ctx, width, height);
            break;
        case 'vintage-brown-brick':
            // Vintage brown background with color #a0462d and brick texture
            ctx.fillStyle = '#a0462d';
            ctx.fillRect(0, 0, width, height);
            // Add noise for texture
            addNoise(ctx, width, height, 0.1);
            // Add brick texture
            drawBrickTexture(ctx, width, height);
            break;
        case 'christmas-theme':
            // Christmas theme background (elements drawn in overlay layer above photos)
            // Create festive gradient background
            const christmasGradient = ctx.createLinearGradient(0, 0, width, height);
            christmasGradient.addColorStop(0, '#1a1a2e');
            christmasGradient.addColorStop(0.5, '#16213e');
            christmasGradient.addColorStop(1, '#0f3460');
            ctx.fillStyle = christmasGradient;
            ctx.fillRect(0, 0, width, height);
            // Snowflakes and stickers are drawn in overlay layer after photos
            break;
        case 'christmas-red-theme':
            // Christmas red theme background (elements drawn in overlay layer above photos)
            // Create festive red gradient background
            const christmasRedGradient = ctx.createLinearGradient(0, 0, width, height);
            christmasRedGradient.addColorStop(0, '#7a0f0f');
            christmasRedGradient.addColorStop(0.5, '#8b1a1a');
            christmasRedGradient.addColorStop(1, '#6b0a0a');
            ctx.fillStyle = christmasRedGradient;
            ctx.fillRect(0, 0, width, height);
            // Snowflakes and stickers are drawn in overlay layer after photos
            break;
        case 'classic-cream':
        default:
            // Vintage gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#FFF8E7');
            gradient.addColorStop(1, '#FFE4B5');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            // Add subtle noise for texture
            addNoise(ctx, width, height, 0.04);
            // Add decorative vintage elements
            drawDecorativeTapes(ctx, width, height);
            drawTornPaperPieces(ctx, width, height);
            break;
    }
}

// Draw decorative tape strips at various positions (for vintage look)
function drawDecorativeTapes(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    const tapeColor = 'rgba(255, 248, 220, 0.65)'; // Semi-transparent beige tape
    const tapeShadow = 'rgba(200, 180, 150, 0.25)';

    // Random positions for 2-4 tape strips
    const tapeCount = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < tapeCount; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.3; // Slight rotation
        const tapeLength = 60 + Math.random() * 80;
        const tapeWidth = 18 + Math.random() * 6;
        
        // Position tapes near edges or corners, but not exactly on them
        let x, y;
        const edge = Math.random();
        if (edge < 0.25) {
            // Top edge
            x = 30 + Math.random() * (width - 60);
            y = 20 + Math.random() * 40;
        } else if (edge < 0.5) {
            // Right edge
            x = width - 50 - Math.random() * 40;
            y = 30 + Math.random() * (height - 60);
        } else if (edge < 0.75) {
            // Bottom edge
            x = 30 + Math.random() * (width - 60);
            y = height - 50 - Math.random() * 40;
        } else {
            // Left edge
            x = 20 + Math.random() * 40;
            y = 30 + Math.random() * (height - 60);
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Draw tape shadow
        ctx.fillStyle = tapeShadow;
        ctx.fillRect(-tapeLength / 2 + 1, -tapeWidth / 2 + 1, tapeLength, tapeWidth);

        // Draw main tape
        ctx.fillStyle = tapeColor;
        ctx.fillRect(-tapeLength / 2, -tapeWidth / 2, tapeLength, tapeWidth);

        // Add tape texture lines
        ctx.strokeStyle = 'rgba(200, 180, 150, 0.4)';
        ctx.lineWidth = 1;
        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.moveTo(-tapeLength / 2, -tapeWidth / 2 + (tapeWidth / 3) * (j + 1));
            ctx.lineTo(tapeLength / 2, -tapeWidth / 2 + (tapeWidth / 3) * (j + 1));
            ctx.stroke();
        }

        // Add tape shine/highlight
        const shineGradient = ctx.createLinearGradient(-tapeLength / 2, -tapeWidth / 2, -tapeLength / 2, tapeWidth / 2);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shineGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = shineGradient;
        ctx.fillRect(-tapeLength / 2, -tapeWidth / 2, tapeWidth * 0.4, tapeWidth);

        ctx.restore();
    }

    ctx.restore();
}

// Draw torn paper pieces scattered around (subtle vintage detail)
function drawTornPaperPieces(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    const pieceCount = 3 + Math.floor(Math.random() * 3);
    const paperColor = 'rgba(250, 245, 235, 0.6)';
    const paperShadow = 'rgba(0, 0, 0, 0.08)';

    for (let i = 0; i < pieceCount; i++) {
        const size = 25 + Math.random() * 40;
        const angle = Math.random() * Math.PI * 2;
        
        // Position pieces near corners or edges
        let x, y;
        const corner = Math.random();
        if (corner < 0.25) {
            // Top-left area
            x = 15 + Math.random() * 80;
            y = 15 + Math.random() * 80;
        } else if (corner < 0.5) {
            // Top-right area
            x = width - 95 - Math.random() * 80;
            y = 15 + Math.random() * 80;
        } else if (corner < 0.75) {
            // Bottom-left area
            x = 15 + Math.random() * 80;
            y = height - 95 - Math.random() * 80;
        } else {
            // Bottom-right area
            x = width - 95 - Math.random() * 80;
            y = height - 95 - Math.random() * 80;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Draw shadow
        ctx.fillStyle = paperShadow;
        ctx.beginPath();
        drawIrregularShape(ctx, size, 1.5, 1.5);
        ctx.fill();

        // Draw torn paper piece
        ctx.fillStyle = paperColor;
        ctx.beginPath();
        drawIrregularShape(ctx, size, 0, 0);
        ctx.fill();

        // Add torn edge texture
        ctx.strokeStyle = 'rgba(200, 180, 160, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        drawIrregularShape(ctx, size, 0, 0);
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

// Helper to draw irregular/torn shape
function drawIrregularShape(ctx: CanvasRenderingContext2D, size: number, offsetX: number, offsetY: number) {
    const sides = 6 + Math.floor(Math.random() * 4);
    ctx.moveTo(offsetX, offsetY - size / 2);
    
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const radius = (size / 2) * (0.7 + Math.random() * 0.3);
        const x = offsetX + Math.cos(angle) * radius;
        const y = offsetY + Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

// Draw photo corners with tape (vintage photo album style)
function drawPhotoCorners(ctx: CanvasRenderingContext2D, photoX: number, photoY: number, photoWidth: number, photoHeight: number) {
    ctx.save();

    const cornerSize = 25 + Math.random() * 10;
    const tapeColor = 'rgba(255, 248, 220, 0.7)';
    const cornerTapeWidth = 12;

    // Top-left corner
    if (Math.random() > 0.3) {
        ctx.fillStyle = tapeColor;
        ctx.beginPath();
        ctx.moveTo(photoX - cornerTapeWidth, photoY - cornerTapeWidth);
        ctx.lineTo(photoX + cornerSize, photoY - cornerTapeWidth);
        ctx.lineTo(photoX + cornerSize, photoY);
        ctx.lineTo(photoX, photoY + cornerSize);
        ctx.lineTo(photoX - cornerTapeWidth, photoY + cornerSize);
        ctx.closePath();
        ctx.fill();
        
        // Add tape texture
        ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Top-right corner
    if (Math.random() > 0.3) {
        ctx.fillStyle = tapeColor;
        ctx.beginPath();
        ctx.moveTo(photoX + photoWidth + cornerTapeWidth, photoY - cornerTapeWidth);
        ctx.lineTo(photoX + photoWidth - cornerSize, photoY - cornerTapeWidth);
        ctx.lineTo(photoX + photoWidth - cornerSize, photoY);
        ctx.lineTo(photoX + photoWidth, photoY + cornerSize);
        ctx.lineTo(photoX + photoWidth + cornerTapeWidth, photoY + cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
        ctx.stroke();
    }

    ctx.restore();
}

function drawBranding(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    background: BackgroundStyle,
    customText: string = '',
    offsetX: number = 0,
    offsetY: number = 0
) {
    // List of dark backgrounds that need light text
    const darkBackgrounds: BackgroundStyle[] = [
        'camera-roll-film', // Camera roll film has black background extending to bottom
        'vintage-wood',
        'aged-wood',
        'weathered-wood',
        'barn-wood',
        'vintage-brown',
        'vintage-brown-textured',
        'vintage-brown-brick',
        'christmas-theme',
        'christmas-red-theme'
    ];

    const isDark = darkBackgrounds.includes(background);
    const textColor = isDark ? '#FFFFFF' : '#2C2C2C';
    const accentColor = isDark ? '#D4D4D4' : '#6B7280'; // Darker gray for better visibility

    ctx.textAlign = 'center';

    // Apply offset for branding within a sub-area (like for polaroids)
    const centerX = offsetX + width / 2;
    const bottomY = offsetY + height;

    // Logo Text or Custom Text
    if (customText) {
        // Custom Text (Handwritten) - Main focus
        ctx.font = '400 42px "Caveat", "Brush Script MT", cursive';
        ctx.fillStyle = textColor;
        ctx.fillText(customText, centerX, bottomY - 80);

        // Vintiq Studio (Smaller, below)
        ctx.font = 'bold 20px Playfair Display, serif';
        ctx.fillStyle = accentColor;
        ctx.fillText('VINTIQ STUDIO', centerX, bottomY - 45);

        // Date & Website (Combined, Small)
        const dateStr = format(new Date(), 'dd.MM.yy');
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(`${dateStr} • vintiq.studio`, centerX, bottomY - 20);
    } else {
        // Date
        const dateStr = format(new Date(), 'dd • MM • yyyy');
        ctx.font = '500 16px Inter, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(dateStr, centerX, bottomY - 85);

        // Logo Text
        ctx.font = 'bold 32px Playfair Display, serif';
        ctx.fillStyle = textColor;
        ctx.fillText('VINTIQ STUDIO', centerX, bottomY - 45);

        // Website
        ctx.font = '13px Inter, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText('vintiq.studio', centerX, bottomY - 25);
    }
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
            const gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h));
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

// Generic function to draw film strip frame around any content area
function drawGenericFilmStripFrame(
    ctx: CanvasRenderingContext2D,
    width: number, // Total width of the canvas area this frame is drawn on
    height: number, // Total height of the canvas area this frame is drawn on
    contentX: number, // X position of the content relative to the canvas
    contentY: number, // Y position of the content relative to the canvas
    contentWidth: number, // Width of the content area
    contentHeight: number, // Height of the content area
    extendToBottom: boolean = false,
    globalOffsetX: number = 0, // Global offset for drawing multiple frames
    globalOffsetY: number = 0 // Global offset for drawing multiple frames
) {
    ctx.save();

    const borderThickness = 40;
    const filmStripLeft = globalOffsetX + contentX - borderThickness;
    const filmStripRight = globalOffsetX + contentX + contentWidth + borderThickness;
    const filmStripTop = globalOffsetY + contentY - borderThickness;

    // Calculate bottom based on content or canvas height
    const filmStripBottom = extendToBottom ? globalOffsetY + height : globalOffsetY + contentY + contentHeight + borderThickness;
    const filmStripWidth = filmStripRight - filmStripLeft;
    const filmStripHeight = filmStripBottom - filmStripTop;

    // Draw black film strip background
    // Top border
    ctx.fillStyle = '#000000';
    ctx.fillRect(filmStripLeft, filmStripTop, filmStripWidth, borderThickness);

    // Bottom border (if not extending to bottom)
    if (!extendToBottom) {
        ctx.fillRect(filmStripLeft, filmStripBottom - borderThickness, filmStripWidth, borderThickness);
    } else {
        // If extending to bottom, draw bottom border area
        ctx.fillRect(filmStripLeft, globalOffsetY + height - borderThickness, filmStripWidth, borderThickness);
    }

    // Left border
    ctx.fillRect(filmStripLeft, globalOffsetY + contentY - borderThickness, borderThickness, contentHeight + (borderThickness * 2));

    // Right border
    ctx.fillRect(filmStripRight - borderThickness, globalOffsetY + contentY - borderThickness, borderThickness, contentHeight + (borderThickness * 2));

    // Fill branding area if extending
    if (extendToBottom) {
        const brandingAreaTop = globalOffsetY + contentY + contentHeight + borderThickness;
        ctx.fillRect(filmStripLeft, brandingAreaTop, filmStripWidth, (globalOffsetY + height) - brandingAreaTop);
    }

    // Draw perforations
    const holeWidth = 22;
    const holeHeight = 32;
    const holeSpacing = 65;
    const cornerRadius = 5;

    const holeXLeft = filmStripLeft + 20;
    const holeXRight = filmStripRight - 20;

    ctx.fillStyle = '#FFFFFF';

    // Left Perforations
    for (let y = filmStripTop + 15; y < filmStripBottom - 15; y += holeSpacing) {
        drawRoundedRect(ctx, holeXLeft - holeWidth / 2, y - holeHeight / 2, holeWidth, holeHeight, cornerRadius);
    }

    // Right Perforations
    for (let y = filmStripTop + 15; y < filmStripBottom - 15; y += holeSpacing) {
        drawRoundedRect(ctx, holeXRight - holeWidth / 2, y - holeHeight / 2, holeWidth, holeHeight, cornerRadius);
    }

    // Add texture/noise
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

    // Noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let i = 0; i < 300; i++) {
        const x = filmStripLeft + Math.random() * filmStripWidth;
        const y = filmStripTop + Math.random() * filmStripHeight;
        ctx.fillRect(x, y, 1, 1);
    }

    ctx.restore();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();
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

// Draw snowflakes for Christmas theme
function drawSnowflakes(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    const snowflakeCount = 40 + Math.floor(Math.random() * 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    
    // Border width - area where snowflakes can appear
    const borderWidth = 40;
    
    for (let i = 0; i < snowflakeCount; i++) {
        let x, y;
        const positionType = Math.random();
        
        // Place snowflakes in border areas (edges) or corners
        if (positionType < 0.25) {
            // Top border
            x = Math.random() * width;
            y = Math.random() * borderWidth;
        } else if (positionType < 0.5) {
            // Right border
            x = width - borderWidth + Math.random() * borderWidth;
            y = Math.random() * height;
        } else if (positionType < 0.75) {
            // Bottom border
            x = Math.random() * width;
            y = height - borderWidth + Math.random() * borderWidth;
        } else {
            // Left border
            x = Math.random() * borderWidth;
            y = Math.random() * height;
        }
        
        const size = 5 + Math.random() * 15;
        const rotation = Math.random() * Math.PI * 2;
        const opacity = 0.4 + Math.random() * 0.5;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;
        
        // Draw snowflake pattern (6 arms)
        const arms = 6;
        for (let j = 0; j < arms; j++) {
            ctx.save();
            ctx.rotate((j * Math.PI * 2) / arms);
            
            // Main arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size);
            ctx.stroke();
            
            // Side branches
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.6);
            ctx.lineTo(-size * 0.3, -size * 0.5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.6);
            ctx.lineTo(size * 0.3, -size * 0.5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.3);
            ctx.lineTo(-size * 0.2, -size * 0.25);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.3);
            ctx.lineTo(size * 0.2, -size * 0.25);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    ctx.restore();
}

// Draw Christmas stickers on background
async function drawChristmasStickers(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const stickerPaths = [
        '/christmas1.png',
        '/christmast2.png',
        '/christmast3.png',
        '/christmast4.png'
    ];
    
    // Load all sticker images
    const stickerImages: (HTMLImageElement | null)[] = [];
    for (const path of stickerPaths) {
        try {
            const img = await loadImage(path);
            stickerImages.push(img);
        } catch (error) {
            console.warn(`Failed to load sticker: ${path}`, error);
            stickerImages.push(null);
        }
    }
    
    ctx.save();
    
    // Position stickers at border edges and corners
    const stickerCount = 4 + Math.floor(Math.random() * 3); // 4-6 stickers
    const borderWidth = 80; // Wider border area for stickers
    
    for (let i = 0; i < stickerCount && i < stickerImages.length; i++) {
        const img = stickerImages[i];
        if (!img) continue;
        
        let x, y;
        const positionType = Math.random();
        const size = 70 + Math.random() * 100; // 70-170px (larger stickers)
        const rotation = (Math.random() - 0.5) * 0.6; // More rotation variation
        
        // Scale image to fit size
        const scale = size / Math.max(img.width, img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Place stickers at border edges, with some overlap allowed
        if (positionType < 0.25) {
            // Top border - can overlap with top of photos
            x = Math.random() * (width - scaledWidth);
            y = Math.random() * borderWidth - scaledHeight * 0.3; // Allow overlap
        } else if (positionType < 0.5) {
            // Right border - can overlap with photos
            x = width - borderWidth + Math.random() * (borderWidth - scaledWidth * 0.5) - scaledWidth * 0.3;
            y = Math.random() * height;
        } else if (positionType < 0.75) {
            // Bottom border - can overlap with bottom of photos
            x = Math.random() * (width - scaledWidth);
            y = height - borderWidth + Math.random() * (borderWidth - scaledHeight * 0.5) - scaledHeight * 0.3;
        } else {
            // Left border - can overlap with photos
            x = Math.random() * (borderWidth - scaledWidth * 0.5) - scaledWidth * 0.3;
            y = Math.random() * height;
        }
        
        // Ensure stickers don't go completely off canvas
        x = Math.max(-scaledWidth * 0.3, Math.min(x, width - scaledWidth * 0.7));
        y = Math.max(-scaledHeight * 0.3, Math.min(y, height - scaledHeight * 0.7));
        
        // Draw sticker with rotation and opacity
        ctx.save();
        ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
        ctx.rotate(rotation);
        ctx.globalAlpha = 0.75 + Math.random() * 0.2; // 0.75-0.95 opacity (more visible)
        ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
    }
    
    ctx.restore();
}

// Draw Christmas overlay elements on top of photos (snowflakes and stickers)
async function drawChristmasOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, background: BackgroundStyle) {
    if (background !== 'christmas-theme' && background !== 'christmas-red-theme') return;
    
    ctx.save();
    
    // Draw snowflakes on border areas and can overlap photos
    drawSnowflakesOverlay(ctx, width, height);
    
    // Draw stickers on border areas and can overlap photos
    await drawChristmasStickersOverlay(ctx, width, height);
    
    ctx.restore();
}

// Draw snowflakes overlay (on top layer, can overlap photos)
function drawSnowflakesOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    
    const snowflakeCount = 50 + Math.floor(Math.random() * 30); // More snowflakes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    
    // Border width - area where snowflakes primarily appear
    const borderWidth = 60;
    
    for (let i = 0; i < snowflakeCount; i++) {
        let x, y;
        const positionType = Math.random();
        
        // Place snowflakes primarily in border areas, but some can overlap with photos
        if (positionType < 0.25) {
            // Top border - can extend into photo area
            x = Math.random() * width;
            y = Math.random() * borderWidth * 1.5;
        } else if (positionType < 0.5) {
            // Right border - can extend into photo area
            x = width - borderWidth * 1.5 + Math.random() * borderWidth * 1.5;
            y = Math.random() * height;
        } else if (positionType < 0.75) {
            // Bottom border - can extend into photo area
            x = Math.random() * width;
            y = height - borderWidth * 1.5 + Math.random() * borderWidth * 1.5;
        } else {
            // Left border - can extend into photo area
            x = Math.random() * borderWidth * 1.5;
            y = Math.random() * height;
        }
        
        const size = 4 + Math.random() * 12;
        const rotation = Math.random() * Math.PI * 2;
        const opacity = 0.5 + Math.random() * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;
        
        // Draw snowflake pattern (6 arms)
        const arms = 6;
        for (let j = 0; j < arms; j++) {
            ctx.save();
            ctx.rotate((j * Math.PI * 2) / arms);
            
            // Main arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size);
            ctx.stroke();
            
            // Side branches
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.6);
            ctx.lineTo(-size * 0.3, -size * 0.5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.6);
            ctx.lineTo(size * 0.3, -size * 0.5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.3);
            ctx.lineTo(-size * 0.2, -size * 0.25);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.3);
            ctx.lineTo(size * 0.2, -size * 0.25);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    ctx.restore();
}

// Draw Christmas stickers overlay (on top layer, can overlap photos)
async function drawChristmasStickersOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const stickerConfigs = [
        { path: '/christmas1.png', position: 'top-left' },
        { path: '/christmast2.png', position: 'top-right' },
        { path: '/christmast3.png', position: 'bottom-left' },
        { path: '/christmast4.png', position: 'bottom-right' }
    ];
    
    // Load all sticker images
    const stickerImages: { img: HTMLImageElement | null; position: string }[] = [];
    for (const config of stickerConfigs) {
        try {
            const img = await loadImage(config.path);
            stickerImages.push({ img, position: config.position });
        } catch (error) {
            console.warn(`Failed to load sticker: ${config.path}`, error);
            stickerImages.push({ img: null, position: config.position });
        }
    }
    
    ctx.save();
    
    // Fixed size for stickers (consistent every time)
    const baseSize = 120; // Base size in pixels
    
    // Fixed positions for each sticker (percentages of canvas dimensions)
    const positions: Record<string, { xPercent: number; yPercent: number; rotation: number; size: number }> = {
        'top-left': { xPercent: 0.05, yPercent: 0.08, rotation: -0.15, size: baseSize },
        'top-right': { xPercent: 0.92, yPercent: 0.05, rotation: 0.2, size: baseSize * 0.95 },
        'bottom-left': { xPercent: 0.03, yPercent: 0.88, rotation: 0.12, size: baseSize * 1.1 },
        'bottom-right': { xPercent: 0.90, yPercent: 0.90, rotation: -0.18, size: baseSize * 0.9 }
    };
    
    // Draw each sticker at fixed position
    for (const { img, position } of stickerImages) {
        if (!img) continue;
        
        const posConfig = positions[position];
        if (!posConfig) continue;
        
        // Calculate fixed position based on percentages
        const x = width * posConfig.xPercent;
        const y = height * posConfig.yPercent;
        
        // Scale image to fixed size
        const scale = posConfig.size / Math.max(img.width, img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Draw sticker with fixed rotation and opacity
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(posConfig.rotation);
        ctx.globalAlpha = 1.0; // Full opacity - very visible
        ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
    }
    
    ctx.restore();
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
    background = 'classic-cream',
    customText = ''
}: LiveStripOptions): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        // Determine photo count and canvas dimensions based on layout
        let photoCount: number;
        let STRIP_WIDTH: number;
        let STRIP_HEIGHT: number;
        let PHOTO_WIDTH: number;
        let PHOTO_HEIGHT: number;
        let PADDING_X: number;
        let PADDING_TOP: number;
        let GAP: number;
        let BOTTOM_SPACE: number;

        // Determine layout-specific constants
        if (layout === 'grid-2x2') {
            photoCount = Math.min(photos.length, 4);
            STRIP_WIDTH = 800;
            PHOTO_WIDTH = 350;
            PHOTO_HEIGHT = 350;
            GAP = 30;
            PADDING_X = 40; // For grid, this means padding from edges
            PADDING_TOP = 40;
            BOTTOM_SPACE = 120;
            const rows = photoCount <= 2 ? 1 : 2;
            STRIP_HEIGHT = PADDING_TOP + (PHOTO_HEIGHT * rows) + (GAP * (rows - 1)) + BOTTOM_SPACE;
        } else if (layout === 'polaroid') {
            photoCount = 1;
            STRIP_WIDTH = 600;
            PHOTO_WIDTH = 520;
            PHOTO_HEIGHT = 520;
            PADDING_TOP = 40;
            BOTTOM_SPACE = 160;
            STRIP_HEIGHT = PADDING_TOP + PHOTO_HEIGHT + BOTTOM_SPACE;
            PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2;
            GAP = 0; // No gap for single photo
        } else {
            // Vertical layouts
            photoCount = layout === 'vertical-2' ? 2 : layout === 'vertical-3' ? 3 : 4;
            STRIP_WIDTH = 600;
            PHOTO_WIDTH = 520;
            PHOTO_HEIGHT = 390;
            PADDING_X = (STRIP_WIDTH - PHOTO_WIDTH) / 2;
            PADDING_TOP = 60;
            GAP = 30;
            BOTTOM_SPACE = 120;
            STRIP_HEIGHT = PADDING_TOP + (PHOTO_HEIGHT * photoCount) + (GAP * (photoCount - 1)) + BOTTOM_SPACE;
        }

        // Initialize arrays with fixed length to maintain exact order
        const videoElements: (HTMLVideoElement | undefined)[] = new Array(photoCount);
        const videoUrls: string[] = [];
        const imageElements: (HTMLImageElement | undefined)[] = new Array(photoCount);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

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

            // Pre-load Christmas sticker images if needed (for overlay on top layer)
            let preloadedStickers: { img: HTMLImageElement; position: string; config: { xPercent: number; yPercent: number; rotation: number; size: number } }[] = [];
            if (background === 'christmas-theme' || background === 'christmas-red-theme') {
                const stickerConfigs = [
                    { path: '/christmas1.png', position: 'top-left' },
                    { path: '/christmast2.png', position: 'top-right' },
                    { path: '/christmast3.png', position: 'bottom-left' },
                    { path: '/christmast4.png', position: 'bottom-right' }
                ];
                
                const baseSize = 120;
                const positions: Record<string, { xPercent: number; yPercent: number; rotation: number; size: number }> = {
                    'top-left': { xPercent: 0.05, yPercent: 0.08, rotation: -0.15, size: baseSize },
                    'top-right': { xPercent: 0.92, yPercent: 0.05, rotation: 0.2, size: baseSize * 0.95 },
                    'bottom-left': { xPercent: 0.03, yPercent: 0.88, rotation: 0.12, size: baseSize * 1.1 },
                    'bottom-right': { xPercent: 0.90, yPercent: 0.90, rotation: -0.18, size: baseSize * 0.9 }
                };

                for (const config of stickerConfigs) {
                    try {
                        const img = await loadImage(config.path);
                        const posConfig = positions[config.position];
                        if (posConfig) {
                            preloadedStickers.push({ img, position: config.position, config: posConfig });
                        }
                    } catch (error) {
                        console.warn(`Failed to load sticker: ${config.path}`, error);
                    }
                }
            }

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
                await drawBackground(ctx, STRIP_WIDTH, STRIP_HEIGHT, background);

                // 2. Draw Photos/Videos
                // IMPORTANT: Maintain exact order from input arrays (photos and livePhotos)
                // Index i corresponds to the same position in both arrays
                for (let i = 0; i < photoCount; i++) {
                    let x = 0;
                    let y = 0;

                    // Calculate position based on layout
                    if (layout === 'grid-2x2') {
                        // Grid positioning
                        const cols = 2;

                        if (photoCount === 3) {
                            // Special layout for 3 photos
                            if (i === 0) {
                                x = PADDING_X;
                                y = PADDING_TOP;
                            } else if (i === 1) {
                                x = PADDING_X;
                                y = PADDING_TOP + PHOTO_HEIGHT + GAP;
                            } else if (i === 2) {
                                x = PADDING_X + PHOTO_HEIGHT + GAP;
                                y = PADDING_TOP + (PHOTO_HEIGHT / 2) + (GAP / 2);
                            }
                        } else {
                            // Standard Grid (2 or 4)
                            const col = i % cols;
                            const row = Math.floor(i / cols);
                            x = PADDING_X + col * (PHOTO_HEIGHT + GAP);
                            y = PADDING_TOP + row * (PHOTO_HEIGHT + GAP);
                        }
                    } else if (layout === 'polaroid') {
                        // Polaroid - single centered photo
                        x = PADDING_X;
                        y = PADDING_TOP;
                    } else {
                        // Vertical strip positioning
                        x = PADDING_X;
                        y = PADDING_TOP + i * (PHOTO_HEIGHT + GAP);
                    }

                    // Draw frame based on background type
                    if (background === 'camera-roll-film') {
                        // For film strip: black border around each photo
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(x - 8, y - 8, PHOTO_WIDTH + 16, PHOTO_HEIGHT + 16);
                    } else {
                        // Normal white border for other backgrounds
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(x - 10, y - 10, PHOTO_WIDTH + 20, PHOTO_HEIGHT + 20);
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
                            video.play().catch(() => { });
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
                            await applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                            // Draw processed video frame
                            ctx.drawImage(tempCanvas, x, y);
                        }

                        ctx.restore();
                        
                        // Add vintage photo corners with tape
                        if (background !== 'camera-roll-film' && Math.random() > 0.4) {
                            drawPhotoCorners(ctx, x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
                        }
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
                            await applyFilter(tempCtx, PHOTO_WIDTH, PHOTO_HEIGHT, filter);

                            // Draw photo
                            ctx.drawImage(tempCanvas, x, y);
                        }

                        ctx.restore();
                        
                        // Add vintage photo corners with tape
                        if (background !== 'camera-roll-film' && Math.random() > 0.4) {
                            drawPhotoCorners(ctx, x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
                        }
                    } else {
                        // Placeholder
                        ctx.fillStyle = '#f5f5f4';
                        ctx.fillRect(x, y, PHOTO_WIDTH, PHOTO_HEIGHT);

                        // Draw dashed border
                        ctx.strokeStyle = '#d6d3d1';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([10, 10]);
                        ctx.strokeRect(x + 2, y + 2, PHOTO_WIDTH - 4, PHOTO_HEIGHT - 4);
                        ctx.setLineDash([]);

                        // Draw number
                        ctx.fillStyle = '#a8a29e';
                        ctx.font = 'bold 48px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`${i + 1}`, x + PHOTO_WIDTH / 2, y + PHOTO_HEIGHT / 2);
                    }

                    // Inner shadow
                    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, PHOTO_WIDTH, PHOTO_HEIGHT);
                }

                // 3. Draw Film Strip Frame (after photos, so perforations are on top)
                // For camera-roll-film, extend to bottom including branding area
                if (background === 'camera-roll-film') {
                    drawFilmStripFrame(ctx, STRIP_WIDTH, STRIP_HEIGHT, PADDING_TOP, PHOTO_HEIGHT, GAP, PHOTO_WIDTH, PADDING_X, true);
                }

                // 3.5. Draw Christmas overlay elements (snowflakes and stickers on top layer)
                // Draw AFTER all photos/videos are drawn, so overlay appears on top
                if (background === 'christmas-theme' || background === 'christmas-red-theme') {
                    // Draw snowflakes (sync)
                    drawSnowflakesOverlay(ctx, STRIP_WIDTH, STRIP_HEIGHT);
                    
                    // Draw preloaded stickers (sync - no async needed)
                    if (preloadedStickers.length > 0) {
                        ctx.save();
                        for (const { img, config } of preloadedStickers) {
                            const x = STRIP_WIDTH * config.xPercent;
                            const y = STRIP_HEIGHT * config.yPercent;
                            const scale = config.size / Math.max(img.width, img.height);
                            const scaledWidth = img.width * scale;
                            const scaledHeight = img.height * scale;
                            
                            ctx.save();
                            ctx.translate(x, y);
                            ctx.rotate(config.rotation);
                            ctx.globalAlpha = 1.0;
                            ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                            ctx.restore();
                        }
                        ctx.restore();
                    }
                }

                // 4. Draw Branding
                drawBranding(ctx, STRIP_WIDTH, STRIP_HEIGHT, background, customText);

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

// Draw vintage brown texture with aging effects
function drawVintageBrownTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // Add subtle texture with lighter and darker variations
    const lightBrown = 'rgba(180, 90, 60, 0.15)';
    const darkBrown = 'rgba(70, 30, 20, 0.2)';
    const mediumBrown = 'rgba(130, 60, 40, 0.12)';

    // Draw subtle horizontal texture lines
    const textureSpacing = 4 + Math.random() * 3;
    for (let y = 0; y < height; y += textureSpacing) {
        const variation = (Math.random() - 0.5) * 2;
        const textureY = y + variation;

        ctx.beginPath();
        ctx.moveTo(0, textureY);

        for (let x = 0; x < width; x += 5) {
            const wave = Math.sin(x / 40) * 0.5 + Math.sin(x / 20) * 0.3;
            ctx.lineTo(x, textureY + wave);
        }

        ctx.strokeStyle = Math.random() > 0.5 ? lightBrown : mediumBrown;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // Add some vintage stains/spots
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 20 + Math.random() * 40;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, darkBrown);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add subtle vertical grain
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        ctx.strokeStyle = darkBrown;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 2, height);
        ctx.stroke();
    }

    ctx.restore();
}

// Draw vintage brown with heavy texture effects
function drawVintageBrownTextured(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // Much more pronounced texture colors with higher opacity
    const lightBrown = 'rgba(220, 130, 100, 0.5)';
    const darkBrown = 'rgba(50, 15, 10, 0.55)';
    const mediumBrown = 'rgba(170, 80, 60, 0.45)';
    const accentBrown = 'rgba(140, 60, 40, 0.48)';
    const highlightBrown = 'rgba(240, 150, 120, 0.35)';
    const shadowBrown = 'rgba(30, 10, 5, 0.6)';

    // Draw heavy horizontal texture lines with more variation - MORE VISIBLE
    const textureSpacing = 1.5 + Math.random() * 1.5;
    for (let y = 0; y < height; y += textureSpacing) {
        const variation = (Math.random() - 0.5) * 4;
        const textureY = y + variation;

        ctx.beginPath();
        ctx.moveTo(0, textureY);

        for (let x = 0; x < width; x += 2) {
            const wave = Math.sin(x / 25) * 1.2 + Math.sin(x / 12) * 0.7 + Math.sin(x / 6) * 0.4;
            ctx.lineTo(x, textureY + wave);
        }

        // Vary the color for more texture depth - MORE CONTRAST
        const colorChoice = Math.random();
        if (colorChoice < 0.25) {
            ctx.strokeStyle = highlightBrown;
        } else if (colorChoice < 0.5) {
            ctx.strokeStyle = lightBrown;
        } else if (colorChoice < 0.75) {
            ctx.strokeStyle = mediumBrown;
        } else {
            ctx.strokeStyle = accentBrown;
        }
        ctx.lineWidth = 1.2 + Math.random() * 0.6;
        ctx.stroke();
        
        // Add shadow line below for depth
        if (Math.random() > 0.7) {
            ctx.strokeStyle = shadowBrown;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, textureY + 1);
            for (let x = 0; x < width; x += 2) {
                const wave = Math.sin(x / 25) * 1.2 + Math.sin(x / 12) * 0.7 + Math.sin(x / 6) * 0.4;
                ctx.lineTo(x, textureY + 1 + wave);
            }
            ctx.stroke();
        }
    }

    // Add more vintage stains/spots with varying sizes - MORE VISIBLE
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 20 + Math.random() * 80;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        if (Math.random() > 0.5) {
            gradient.addColorStop(0, shadowBrown);
            gradient.addColorStop(0.3, darkBrown);
            gradient.addColorStop(0.6, 'rgba(80, 30, 20, 0.3)');
        } else {
            gradient.addColorStop(0, 'rgba(40, 15, 10, 0.4)');
            gradient.addColorStop(0.4, mediumBrown);
            gradient.addColorStop(0.7, 'rgba(120, 50, 35, 0.25)');
        }
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add heavy vertical grain lines - MORE VISIBLE
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * width;
        const startY = Math.random() * height * 0.1;
        const endY = height - Math.random() * height * 0.1;
        
        // Vary between dark and light for more contrast
        if (Math.random() > 0.5) {
            ctx.strokeStyle = shadowBrown;
        } else {
            ctx.strokeStyle = highlightBrown;
        }
        ctx.lineWidth = 0.8 + Math.random() * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x + (Math.random() - 0.5) * 4, endY);
        ctx.stroke();
    }

    // Add cross-hatch texture for more depth - MORE VISIBLE
    for (let i = 0; i < 50; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = x1 + (Math.random() - 0.5) * 50;
        const y2 = y1 + (Math.random() - 0.5) * 50;
        
        // More visible cross-hatch
        if (Math.random() > 0.5) {
            ctx.strokeStyle = 'rgba(60, 20, 15, 0.35)';
        } else {
            ctx.strokeStyle = 'rgba(180, 100, 75, 0.3)';
        }
        ctx.lineWidth = 0.4 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Add diagonal lines for additional texture - MORE VISIBLE
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 40 + Math.random() * 70;
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        if (Math.random() > 0.5) {
            ctx.strokeStyle = 'rgba(100, 40, 30, 0.4)';
        } else {
            ctx.strokeStyle = 'rgba(200, 120, 90, 0.35)';
        }
        ctx.lineWidth = 0.5 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    // Add emboss/relief effect with highlights and shadows
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 10 + Math.random() * 30;
        
        // Highlight
        const highlightGradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        highlightGradient.addColorStop(0, highlightBrown);
        highlightGradient.addColorStop(0.5, 'transparent');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Shadow
        const shadowGradient = ctx.createRadialGradient(x + size/3, y + size/3, 0, x, y, size);
        shadowGradient.addColorStop(0, shadowBrown);
        shadowGradient.addColorStop(0.5, 'transparent');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Draw brick texture for vintage brown background
function drawBrickTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // Brick dimensions
    const brickWidth = 80;
    const brickHeight = 30;
    const mortarWidth = 3;
    
    // Brick colors - variations of the red brown
    const brickColor1 = 'rgba(160, 70, 45, 0.4)'; // Lighter brick
    const brickColor2 = 'rgba(140, 60, 40, 0.45)'; // Medium brick
    const brickColor3 = 'rgba(120, 50, 35, 0.5)'; // Darker brick
    const mortarColor = 'rgba(80, 30, 20, 0.6)'; // Dark mortar
    
    // Offset for staggered brick pattern
    let offset = 0;
    let row = 0;

    // Draw bricks row by row
    for (let y = 0; y < height; y += brickHeight + mortarWidth) {
        // Alternate offset for staggered pattern
        offset = (row % 2 === 0) ? 0 : (brickWidth + mortarWidth) / 2;
        
        for (let x = -offset; x < width; x += brickWidth + mortarWidth) {
            // Random brick color variation
            const colorChoice = Math.random();
            let brickColor;
            if (colorChoice < 0.33) {
                brickColor = brickColor1;
            } else if (colorChoice < 0.66) {
                brickColor = brickColor2;
            } else {
                brickColor = brickColor3;
            }
            
            // Draw brick
            ctx.fillStyle = brickColor;
            ctx.fillRect(x, y, brickWidth, brickHeight);
            
            // Add subtle highlight on top edge
            ctx.strokeStyle = 'rgba(180, 90, 65, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + brickWidth, y);
            ctx.stroke();
            
            // Add subtle shadow on bottom edge
            ctx.strokeStyle = 'rgba(80, 30, 20, 0.4)';
            ctx.beginPath();
            ctx.moveTo(x, y + brickHeight);
            ctx.lineTo(x + brickWidth, y + brickHeight);
            ctx.stroke();
            
            // Add subtle shadow on right edge (for depth)
            ctx.strokeStyle = 'rgba(80, 30, 20, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x + brickWidth, y);
            ctx.lineTo(x + brickWidth, y + brickHeight);
            ctx.stroke();
        }
        
        // Draw horizontal mortar line
        ctx.fillStyle = mortarColor;
        ctx.fillRect(0, y + brickHeight, width, mortarWidth);
        
        row++;
    }
    
    // Add some texture variation - random darker spots
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 5 + Math.random() * 15;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(80, 30, 20, 0.4)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add some lighter spots for variation
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 3 + Math.random() * 10;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(180, 90, 65, 0.3)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}
