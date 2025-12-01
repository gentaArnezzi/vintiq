# Vintiq - Online Vintage Photobooth 📷✨

A free, open-source web application that brings the nostalgic charm of vintage photobooths to your browser. Create beautiful vintage photostrips using your camera or uploaded photos – no app download required!

![Vintiq Banner](https://img.shields.io/badge/Vintiq-Vintage%20Photobooth-8B4513?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎯 Core Functionality
- **📸 Use Camera**: Access your webcam or phone camera for live photo capture
- **🖼️ Upload Photos**: Select photos from your device gallery
- **🎨 Vintage Filters**: 3 professionally designed filters
  - Vintiq Warm (warm tones with vintage fade)
  - Sepia Classic (traditional sepia tone)
  - Mono Film (soft B&W with film grain)
- **📥 Download**: High-quality PNG photostrips with auto-generated filenames
- **🔒 Privacy-First**: 100% client-side processing – no uploads, no storage

### 🎨 Design
- Beautiful vintage aesthetic with warm color palette
- Responsive design for desktop and mobile
- Smooth animations and transitions
- Premium glassmorphism effects

### ⚡ Performance
- Client-side image processing (no server required)
- Fast page loads with Next.js optimization
- Real-time filter application
- Minimal dependencies

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vintiq.git
cd vintiq

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
vintiq/
├── app/
│   ├── layout.tsx              # Root layout with header/footer
│   ├── page.tsx                # Main photobooth interface
│   ├── globals.css             # Global styles & Tailwind
│   └── about/
│       └── page.tsx            # About page
├── components/
│   ├── camera-capture.tsx      # Camera capture component
│   ├── photo-upload.tsx        # Photo upload component
│   ├── photostrip-preview.tsx  # Photo slots preview
│   ├── filter-selector.tsx     # Filter selection UI
│   ├── result-modal.tsx        # Result display modal
│   └── error-message.tsx       # Error message component
├── lib/
│   ├── camera-utils.ts         # Camera API utilities
│   ├── image-utils.ts          # Image processing helpers
│   ├── image-filters.ts        # Filter implementations
│   └── canvas-generator.ts     # Photostrip generator
└── public/
    └── vintiq-logo.svg         # Branding assets
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Font**: Inter (via next/font/google)
- **Date Formatting**: [date-fns](https://date-fns.org/)

## 🎯 How It Works

1. **Mode Selection**: Choose between camera capture or photo upload
2. **Photo Collection**: Capture or select 4 photos
3. **Filter Application**: Pick your favorite vintage filter
4. **Strip Generation**: Canvas-based photostrip creation
5. **Download**: Save your photostrip as a PNG file

## 🔒 Privacy & Security

- ✅ **100% client-side processing**: No photos uploaded to server
- ✅ **No data storage**: Photos never leave your device
- ✅ **No tracking**: No analytics in MVP version
- ✅ **Transparent**: Open-source code you can audit

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📱 Features in Detail

### Camera Capture
- Countdown timer (3-2-1) before each capture
- Sequential photo capture (4 photos)
- Keyboard shortcut: Press `Space` to capture
- Retake last photo or reset all
- Comprehensive error handling

### Photo Upload
- Multi-file upload (1-4 photos)
- Format validation (JPG, PNG)
- File size limit (10MB per photo)
- Instant thumbnail previews
- Remove/replace individual photos

### Vintage Filters

#### 🌅 Vintiq Warm
- Warm color tones
- Slight fade for vintage feel
- Reduced contrast

#### 🍂 Sepia Classic
- Traditional sepia tone
- Brownish vintage aesthetic
- Classic photobooth look

#### ⚫ Mono Film
- Soft black & white
- Subtle film grain
- Gentle contrast

### Photostrip Generation
- 4-cut vertical layout
- Vintage gradient background
- White borders (8px)
- Auto-branding with timestamp
- High-quality PNG export

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vintiq)

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

### Deploy to Cloudflare Pages

```bash
# Build command
npm run build

# Build output directory
.next
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic photobooth aesthetics
- Built with modern web technologies
- Designed for privacy and performance

## 📧 Contact

- Instagram: [@ranyyftr](https://instagram.com/ranyyftr)
- Website: [vintiq.xyz](https://vintiq.xyz)

---

**Made with ☺ by Vintiq** | © 2025 Vintiq
