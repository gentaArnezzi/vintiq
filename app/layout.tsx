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
            <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased bg-vintage-cream vintage-gradient text-stone-900 min-h-screen flex flex-col`}>
                <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#F5E6D3] via-[#F0DDC4] to-[#E8D5B7] backdrop-blur-sm border-b-2 border-[#C9A882] shadow-[0_4px_12px_rgba(74,63,53,0.15)]">
                    {/* Vintage decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between relative">
                        {/* Vintage corner decorations */}
                        <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-t-2 border-[#8B7355] opacity-30"></div>
                        <div className="absolute right-0 top-0 w-6 h-6 border-r-2 border-t-2 border-[#8B7355] opacity-30"></div>
                        
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#6B5B4F]/10 blur-sm rounded-full"></div>
                                <img src="/image.png" alt="Vintiq" className="h-12 w-auto relative drop-shadow-[0_2px_4px_rgba(74,63,53,0.2)]" />
                            </div>
                        </div>
                        
                        <nav className="flex items-center gap-4">
                            <a
                                href="/about"
                                className="group relative text-xs font-serif text-[#6B5B4F] hover:text-[#4A3F35] transition-all duration-300 tracking-wide uppercase"
                            >
                                <span className="relative z-10">About</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
                            </a>
                            
                            <div className="h-5 w-px bg-[#8B7355]/30"></div>
                            
                            <a
                                href="https://instagram.com/ranyyftr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative text-[#6B5B4F] hover:text-[#4A3F35] transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full scale-0 group-hover:scale-125 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
                                <svg className="w-5 h-5 relative z-10 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </nav>
                    </div>
                    
                    {/* Vintage decorative bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
                </header>

                <main className="pt-16">
                    {children}
                </main>

                <footer className="relative mt-16 py-8 bg-gradient-to-b from-[#E8D5B7] via-[#F0DDC4] to-[#F5E6D3] backdrop-blur-sm border-t-2 border-[#C9A882] shadow-[0_-4px_12px_rgba(74,63,53,0.1)]">
                    {/* Vintage decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto px-6 text-center relative">
                        <p className="text-sm font-serif text-[#6B5B4F] mb-2 tracking-wide">
                            Made with ☺ by <span className="font-semibold text-[#4A3F35]">Vintiq</span>
                        </p>
                        <p className="text-xs text-[#6B5B4F]/70 font-serif">
                            © 2025 Vintiq. All photos are processed in your browser and are not stored on our servers.
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
