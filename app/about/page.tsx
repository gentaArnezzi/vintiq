import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-vintage-brown mb-2">
                            About Vintiq
                        </h1>
                        <div className="w-20 h-1 bg-vintage-warm mx-auto rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="space-y-6 text-vintage-sepia">
                        <section>
                            <h2 className="text-2xl font-semibold text-vintage-brown mb-3">
                                What is Vintiq?
                            </h2>
                            <p className="leading-relaxed">
                                Vintiq is a <strong>free online vintage photobooth</strong> that brings
                                the nostalgic charm of classic photobooths to your browser. Create
                                beautiful vintage photostrips with just a few clicks—no app download
                                required!
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-vintage-brown mb-3">
                                How It Works
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                                <li>Choose to use your camera or upload photos from your device</li>
                                <li>Capture or select 4 photos for your photostrip</li>
                                <li>Pick your favorite vintage filter</li>
                                <li>Generate and download your photostrip for free!</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-vintage-brown mb-3">
                                Privacy &amp; Security
                            </h2>
                            <div className="bg-vintage-cream rounded-lg p-4 border-l-4 border-vintage-brown">
                                <p className="leading-relaxed">
                                    <strong>Your privacy matters.</strong> All photos are processed
                                    entirely in your browser using client-side technology. We do not
                                    upload, store, or have access to any of your photos. Everything stays
                                    on your device.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-vintage-brown mb-3">
                                Features
                            </h2>
                            <ul className="space-y-2 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-vintage-brown">✓</span>
                                    <span>Free to use, no registration required</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-vintage-brown">✓</span>
                                    <span>3 vintage filters: Vintiq Warm, Sepia Classic, Mono Film</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-vintage-brown">✓</span>
                                    <span>Works on desktop and mobile browsers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-vintage-brown">✓</span>
                                    <span>Download high-quality photostrips</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-vintage-brown">✓</span>
                                    <span>100% client-side processing for privacy</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-vintage-brown mb-3">
                                Get in Touch
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Follow us on Instagram for updates, inspiration, and vintage photography
                                tips!
                            </p>
                            <a
                                href="https://instagram.com/ranyyftr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 vintage-button-primary"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Follow @ranyyftr
                            </a>
                        </section>
                    </div>

                    {/* Back Button */}
                    <div className="mt-10 text-center">
                        <Link href="/" className="vintage-button-secondary inline-block px-8">
                            ← Back to Photobooth
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
