declare module 'vintagejs' {
    interface VintageJSOptions {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sepia?: boolean;
        gray?: boolean;
        vignette?: number;
        lighten?: number;
        screen?: {
            r?: number;
            g?: number;
            b?: number;
            a?: number;
        };
    }

    interface VintageJSResult {
        getCanvas(): HTMLCanvasElement;
    }

    function vintagejs(
        canvas: HTMLCanvasElement,
        options?: VintageJSOptions
    ): Promise<VintageJSResult>;

    export default vintagejs;
}


