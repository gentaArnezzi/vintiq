import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: '--font-serif',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: '--font-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Vintiq - Online Vintage Photobooth",
    description: "Create beautiful vintage photostrips for free. Use your camera or upload photos to create stunning vintage memories.",
    keywords: ["photobooth", "vintage", "photo strip", "vintage photos", "Vintiq"],
    authors: [{ name: "Vintiq" }],
    openGraph: {
        title: "Vintiq - Online Vintage Photobooth",
        description: "Create beautiful vintage photostrips for free",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${playfair.variable} ${dmSans.variable} font - sans antialiased bg - stone - 50 text - stone - 900`}>
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-vintage-yellow shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-vintage-brown">Vintiq</h1>
                            <span className="text-sm text-vintage-sepia">Vintage Photobooth</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="/about"
                                className="text-sm text-vintage-sepia hover:text-vintage-brown transition-colors"
                            >
                                About
                            </a>
                            <a
                                href="https://instagram.com/vintiq"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-vintage-sepia hover:text-vintage-brown transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </header>

                <main className="pt-16">
                    {children}
                </main>

                <footer className="mt-16 py-8 bg-white/80 backdrop-blur-sm border-t border-vintage-yellow">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-sm text-vintage-sepia mb-2">
                            Made with ☺ by <span className="font-semibold">Vintiq</span>
                        </p>
                        <p className="text-xs text-vintage-brown/60">
                            © 2025 Vintiq. All photos are processed in your browser and are not stored on our servers.
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
