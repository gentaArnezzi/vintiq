'use client';

export default function VintageDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Coretan-coretan aesthetic */}
            <svg
                className="absolute top-20 left-10 w-32 h-32 opacity-15 rotate-12"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M20 30 Q30 20, 40 30 T60 30 T80 30"
                    stroke="#6B5B4F"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M15 50 Q25 40, 35 50 T55 50 T75 50"
                    stroke="#6B5B4F"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="70" cy="25" r="3" fill="#6B5B4F" opacity="0.4" />
                <path
                    d="M25 70 L35 65 L45 70 L55 65 L65 70"
                    stroke="#6B5B4F"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>

            <svg
                className="absolute top-40 right-20 w-24 h-24 opacity-12 -rotate-12"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M30 20 Q40 10, 50 20 T70 20 T90 20"
                    stroke="#8B7355"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M20 60 Q30 50, 40 60 T60 60 T80 60"
                    stroke="#8B7355"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M50 30 L55 40 L50 50 L45 40 Z"
                    stroke="#8B7355"
                    strokeWidth="1.5"
                    fill="none"
                />
            </svg>

            <svg
                className="absolute bottom-40 left-16 w-28 h-28 opacity-15 rotate-45"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M20 40 Q30 30, 40 40 T60 40"
                    stroke="#6B5B4F"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M30 60 Q40 50, 50 60 T70 60"
                    stroke="#6B5B4F"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="75" cy="35" r="2.5" fill="#6B5B4F" opacity="0.5" />
            </svg>

            <svg
                className="absolute bottom-32 right-12 w-20 h-20 opacity-12 -rotate-30"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M25 25 L35 20 L45 25 L55 20 L65 25"
                    stroke="#8B7355"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M30 50 Q40 45, 50 50 T70 50"
                    stroke="#8B7355"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>

            {/* Solatip (Washi Tape) di sudut-sudut */}
            {/* Solatip kiri atas */}
            <div className="absolute top-32 left-8 w-24 h-6 opacity-50 rotate-[-25deg] transform origin-center">
                <div className="w-full h-full bg-gradient-to-r from-[#D4AF37]/70 via-[#E8D5B7]/90 to-[#D4AF37]/70 shadow-[0_2px_6px_rgba(74,63,53,0.25)] relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(74,63,53,0.12)_2px,rgba(74,63,53,0.12)_4px)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    {/* Efek transparansi di ujung */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-current opacity-30"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-transparent to-current opacity-30"></div>
                </div>
            </div>

            {/* Solatip kanan atas */}
            <div className="absolute top-24 right-12 w-28 h-6 opacity-45 rotate-[15deg] transform origin-center">
                <div className="w-full h-full bg-gradient-to-r from-[#E8D5B7]/80 via-[#D4AF37]/60 to-[#E8D5B7]/80 shadow-[0_2px_6px_rgba(74,63,53,0.25)] relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(74,63,53,0.1)_2px,rgba(74,63,53,0.1)_4px)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-current opacity-30"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-transparent to-current opacity-30"></div>
                </div>
            </div>

            {/* Solatip kiri bawah */}
            <div className="absolute bottom-40 left-10 w-26 h-6 opacity-50 rotate-[20deg] transform origin-center">
                <div className="w-full h-full bg-gradient-to-r from-[#F0DDC4]/90 via-[#D4AF37]/50 to-[#F0DDC4]/90 shadow-[0_2px_6px_rgba(74,63,53,0.25)] relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(74,63,53,0.12)_2px,rgba(74,63,53,0.12)_4px)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-current opacity-30"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-transparent to-current opacity-30"></div>
                </div>
            </div>

            {/* Solatip kanan bawah */}
            <div className="absolute bottom-28 right-16 w-22 h-6 opacity-45 rotate-[-18deg] transform origin-center">
                <div className="w-full h-full bg-gradient-to-r from-[#D4AF37]/60 via-[#E8D5B7]/80 to-[#D4AF37]/60 shadow-[0_2px_6px_rgba(74,63,53,0.25)] relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(74,63,53,0.1)_2px,rgba(74,63,53,0.1)_4px)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#8B7355]/40"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-current opacity-30"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-transparent to-current opacity-30"></div>
                </div>
            </div>

            {/* Coretan tambahan - lebih kecil dan tersebar */}
            <svg
                className="absolute top-60 left-1/4 w-16 h-16 opacity-12 rotate-[-20deg]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M30 30 Q40 25, 50 30"
                    stroke="#6B5B4F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="60" cy="35" r="2" fill="#6B5B4F" opacity="0.4" />
            </svg>

            <svg
                className="absolute top-1/3 right-1/4 w-14 h-14 opacity-10 rotate-[25deg]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M40 40 L50 35 L60 40"
                    stroke="#8B7355"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>

            <svg
                className="absolute bottom-1/3 left-1/3 w-18 h-18 opacity-12 rotate-[15deg]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M35 50 Q45 45, 55 50"
                    stroke="#6B5B4F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>

            {/* Coretan tambahan di tengah */}
            <svg
                className="absolute top-1/2 left-1/5 w-12 h-12 opacity-10 rotate-[-10deg]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M30 40 L40 35 L50 40"
                    stroke="#6B5B4F"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>

            <svg
                className="absolute top-2/3 right-1/5 w-10 h-10 opacity-11 rotate-[18deg]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M40 50 Q45 45, 50 50"
                    stroke="#8B7355"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

