'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Upload, Filter, Palette, Video, Shield, Download } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen text-stone-800 font-sans">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <header className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm">
                        <Sparkles className="w-4 h-4 text-vintage-gold" />
                        <span className="text-xs font-medium tracking-wider uppercase text-stone-500">About Vintiq</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-medium text-stone-900 mb-6 tracking-tight">
                        About Vintiq Studio
                    </h1>
                    <p className="text-lg text-stone-500 max-w-xl mx-auto font-light leading-relaxed">
                        Membawa nostalgia photobooth klasik ke browser Anda. Gratis, mudah, dan 100% privasi.
                    </p>
                </header>

                {/* Content */}
                <div className="space-y-8">
                    {/* What is Vintiq */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-vintage-gold" />
                            Apa itu Vintiq Studio?
                        </h2>
                        <p className="text-stone-600 leading-relaxed">
                            Vintiq Studio adalah <strong>photobooth vintage online gratis</strong> yang membawa 
                            pesona nostalgia photobooth klasik langsung ke browser Anda. Buat photostrip vintage 
                            yang indah hanya dengan beberapa klik—tanpa perlu download aplikasi!
                        </p>
                    </section>

                    {/* How It Works */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-6 flex items-center gap-2">
                            <Camera className="w-6 h-6 text-vintage-gold" />
                            Cara Menggunakan
                        </h2>
                        <ol className="space-y-4">
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif font-medium">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Pilih Mode</h3>
                                    <p className="text-stone-600 text-sm">Gunakan kamera webcam atau upload foto dari perangkat Anda</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif font-medium">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Ambil 4 Foto</h3>
                                    <p className="text-stone-600 text-sm">Capture atau pilih 4 foto untuk photostrip Anda</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif font-medium">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Kustomisasi</h3>
                                    <p className="text-stone-600 text-sm">Pilih filter vintage favorit dan background yang sesuai</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif font-medium">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Download</h3>
                                    <p className="text-stone-600 text-sm">Generate dan download photostrip atau live strip video Anda!</p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    {/* Features */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-vintage-gold" />
                            Fitur Unggulan
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Download className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Gratis & Tanpa Registrasi</h3>
                                    <p className="text-sm text-stone-600">Gunakan tanpa biaya, tanpa perlu membuat akun</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Filter className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">8 Filter Vintage</h3>
                                    <p className="text-sm text-stone-600">Vintiq Warm, Sepia Classic, Mono Film, Polaroid Fade, Kodak Gold, Fuji Superia, Drama B&W, dan Cinematic</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Palette className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">6 Background Style</h3>
                                    <p className="text-sm text-stone-600">Classic Cream, Film Noir, Vintage Paper, Retro Grid, Soft Pink, dan Sage Green</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Video className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Live Strip Video</h3>
                                    <p className="text-sm text-stone-600">Download video MP4 dengan 4 live photo yang berputar bersamaan (jika menggunakan kamera)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Shield className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">100% Privasi</h3>
                                    <p className="text-sm text-stone-600">Semua foto diproses di browser Anda, tidak ada yang diupload ke server</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-stone-50">
                                <Camera className="w-5 h-5 text-vintage-gold flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-stone-900 mb-1">Multi-Platform</h3>
                                    <p className="text-sm text-stone-600">Bekerja di desktop dan mobile browser, tanpa perlu install aplikasi</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Privacy & Security */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-vintage-gold" />
                            Privasi & Keamanan
                        </h2>
                        <div className="bg-stone-50 rounded-lg p-6 border-l-4 border-stone-900">
                            <p className="text-stone-700 leading-relaxed">
                                <strong className="text-stone-900">Privasi Anda adalah prioritas kami.</strong> Semua foto diproses 
                                sepenuhnya di browser Anda menggunakan teknologi client-side. Kami tidak mengupload, menyimpan, 
                                atau memiliki akses ke foto Anda. Semuanya tetap di perangkat Anda.
                            </p>
                        </div>
                    </section>

                    {/* Live Strip Video Feature */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-4 flex items-center gap-2">
                            <Video className="w-6 h-6 text-vintage-gold" />
                            Live Strip Video
                        </h2>
                        <p className="text-stone-600 leading-relaxed mb-4">
                            Fitur eksklusif untuk pengguna kamera! Jika Anda menggunakan kamera webcam, Vintiq akan 
                            secara otomatis menangkap <strong>Live Photo</strong> (video pendek) bersama dengan foto statis. 
                            Anda bisa download photostrip video MP4 yang menampilkan 4 live photo berputar bersamaan!
                        </p>
                        <div className="bg-stone-50 rounded-lg p-4 mt-4">
                            <p className="text-sm text-stone-600">
                                <strong className="text-stone-900">Tips:</strong> Format MP4 kompatibel dengan Instagram dan galeri foto. 
                                Video akan otomatis di-loop untuk efek yang lebih menarik.
                            </p>
                        </div>
                    </section>

                    {/* Get in Touch */}
                    <section className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm animate-fade-in">
                        <h2 className="text-2xl font-serif font-medium text-stone-900 mb-4">
                            Terhubung dengan Kami
                        </h2>
                        <p className="text-stone-600 leading-relaxed mb-6">
                            Ikuti kami di Instagram untuk update, inspirasi, dan tips fotografi vintage!
                        </p>
                        <a
                            href="https://instagram.com/ranyyftr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                        >
                            <Button variant="vintage" size="lg">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Follow @ranyyftr
                            </Button>
                        </a>
                    </section>

                    {/* Back Button */}
                    <div className="mt-8 text-center animate-fade-in">
                        <Link href="/">
                            <Button variant="outline" size="lg" className="w-full md:w-auto">
                                ← Kembali ke Photobooth
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
