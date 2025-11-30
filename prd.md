PRD – Vintiq Online Vintage Photobooth (Web)
1. Ringkasan Produk

Nama produk: Vintiq – Online Vintage Photobooth
Platform: Website (desktop & mobile browser)
Model: Free tool untuk user; jadi brand awareness + funnel ke ekosistem Vintiq (app + offline photobooth nanti).

Core idea:

User buka vintiq.xyz (misal),

Pilih: Use Camera atau Upload Photos, mirip Little Vintage Photobooth (punya opsi kamera & upload). 
littlevintagephotobooth.com
+1

Hasil akhirnya: photostrip vintage (4 foto / layout lain) dengan warna warm, vintage feel, bisa didownload.

2. Goals & Non-Goals
2.1. Goals (MVP)

User bisa:

Menggunakan kamera (webcam / kamera HP) untuk foto langsung.

Menggunakan upload dari gallery sebagai alternatif.

Menghasilkan:

Strip / layout photobooth (misalnya 4 foto vertikal) dengan:

filter vintage,

border khas Vintiq,

optional text/date kecil.

User bisa:

Download hasil sebagai 1 file gambar (JPEG/PNG).

Semua proses (kamera, filter, compositing) dilakukan client-side (front-end) → tidak perlu backend berat.

Ada sedikit branding Vintiq (logo, nama, link IG) tapi tetap fokus ke photobooth-nya.

2.2. Non-Goals (MVP)

Tidak ada login / akun / database user.

Tidak perlu menyimpan foto di server (no gallery online).

Tidak ada fitur editing kompleks (sticker, text custom bebas, dll.)

Tidak ada integrasi langsung ke App Store (karena app belum rilis).

Tidak ada sistem monetisasi / pembayaran di tahap ini.

3. Target User & Use Case

Target user:

Gen Z / young adults yang suka photobooth aesthetic, mau bikin strip vintage gratis pakai laptop/HP.

Orang yang nemu Vintiq dari TikTok / IG / Lemon8 / rekomendasi teman.

Use case utama:

Photobooth di rumah/bareng teman
User buka web → pakai laptop di kamar / cafe → foto-foto bareng → download hasilnya.

Edit foto lama jadi strip vintage
User pakai fitur Upload Photos, pilih 4 foto dari gallery → jadi strip Vintiq.

4. User Flow (High-Level)

User buka website.

Landing screen (langsung ke photobooth):

Lihat branding Vintiq kecil di atas.

Tombol utama:

Use Camera

Upload Photos

Jika Use Camera:

Browser minta izin kamera.

Tampil preview kamera + instruksi:

tombol Capture atau hotkey (misal: Space).

Mode sequence:

Capture 1 → preview kecil slot 1.

Capture 2 → slot 2.

Capture 3 → slot 3.

Capture 4 → slot 4.

Tombol Retake Last & Reset All.

Jika Upload Photos:

User pilih 4 foto (boleh 1–4, tapi ideal 4).

Preview tiap slot layout.

Setelah 4 slot terisi:

User pilih filter (misal: Vintiq Warm, Sepia, B&W Film).

Pilih layout (default: 4-cut strip vertikal).

Klik Generate Strip.

Hasil:

Tampil satu gambar photostrip di canvas.

Tombol:

Download (PNG/JPEG).

Start Again (kembali ke awal).

5. Fitur & Kebutuhan Fungsional (Detail)
5.1. Kamera & Upload

Use Camera:

Pakai getUserMedia untuk akses webcam.

Kontrol:

Tombol Use Camera → minta permission.

Kalau ditolak → tampil pesan & sarankan “Try Upload Photos instead”.

Aspect ratio disesuaikan (misal: potret 3:4).

Upload Photos:

Input type="file" multiple (1–4 file).

Format diterima: JPG, PNG, HEIC (kalau bisa di-handle), max size per file (misal 5–10MB).

Tampilkan thumbnail tiap foto di slot layout.

5.2. Layout

MVP minimal:

Layout 4-cut strip (default):

4 foto vertikal, jarak antar foto kecil, border putih/cream, background strip warna kuning/cream.

Optional (boleh di-Fase 2):

2x2 grid,

double strip (2 strip identik side-by-side).

Konfigurasi (hardcoded di kode, belum perlu UI builder kompleks).

5.3. Filters (Vintage Look)

Minimal 3 preset filter client-side:

Vintiq Warm:

warm tone, sedikit fade, kontras agak turun.

Sepia Classic:

tone kecoklatan, kayak foto tua.

Mono Film:

Black & white lembut, sedikit grain (simulate).

Implementasi:

CSS filter (brightness, contrast, sepia, hue-rotate) atau

Canvas image processing (untuk hasil lebih konsisten).

User bisa klik radio/tombol:

Vintiq Warm (default)

Sepia

Mono Film

5.4. Branding Strip

Saat generate strip:

Tambahkan logo kecil Vintiq di bagian bawah strip atau text:

Misal: Vintiq + kecil vintiq.photobooth.

Tambah opsi timestamp kecil:

Format default: Vintiq • DD MMM YYYY (boleh auto dari date sekarang).

Ini subtle, tapi bikin strip jadi “punya identitas”.

5.5. Download

Tombol Download:

Generate gambar final dari canvas (HTML5) → toDataURL("image/png") atau "image/jpeg".

Trigger download dengan nama file:

vintiq-photostrip-YYYYMMDD-HHMM.png.

Tidak perlu simpan di server (semua client-side).

6. UX / UI – Struktur Halaman
Single Page Layout

Header (atas):

Kiri: logo Vintiq (simple wordmark).

Kanan: link kecil:

About Vintiq (scroll ke bawah),

ikon IG kecil.

Main area (tengah):

Left panel (di desktop) / top area (di mobile):

Panel kamera/preview upload.

State:

Sebelum pilih: 2 tombol besar:

Use Camera

Upload Photos

Setelah pilih:

Preview kamera atau grid foto upload.

Right panel (di desktop) / bawah (di mobile):

Slot layout (4 kotak kecil, kosong awal).

Setelah foto, tiap slot isi thumbnail.

Di bawah slot:

Filter selection (3 button).

Layout selection (dropdown / button).

Tombol Generate Strip (disabled sampai 4 slot terisi).

Result modal / section:

Menampilkan strip final di tengah.

Tombol:

Download

Start Again

Footer:

Text kecil:

Made with ☺ by Vintiq

© 2025 Vintiq

Link IG.

7. Kebutuhan Teknis
7.1. Frontend Tech

Recommended:

React / Next.js (karena kamu sering pakai ini),

atau vanilla HTML/CSS/JS kalau mau super ringan.

Gunakan:

getUserMedia untuk kamera.

<video> untuk preview kamera.

<canvas> untuk proses capture & compositing strip.

7.2. Compatibility

Browser minimal:

Chrome, Edge, Safari, Firefox versi terbaru.

Mobile:

Safari iOS (untuk iPhone),

Chrome Android.

Jika kamera tidak didukung:

Tampilkan fallback message:

“Your browser does not support camera. Try Upload Photos instead.” (mirip text di LV Photobooth). 
littlevintagephotobooth.com

7.3. Hosting & Infrastruktur

Static hosting (Vercel / Netlify / Cloudflare Pages).

Tidak perlu server backend untuk MVP.

Kalau ada waitlist email, bisa:

pakai form integration (Netlify Forms, Supabase, atau service lain) – optional, bukan core photobooth.

7.4. Privacy & Security

Foto tidak dikirim ke server (kecuali future feature).

Tulis di halaman kecil:

“All photos are processed in your browser and are not stored on our servers.”

8. Non-Fungsional

Performance:

Time to first interactive < 3–4 detik di koneksi normal.

Bundle JS dijaga ringan (hindari library berat kalau nggak perlu).

Reliability:

Handle error:

permission kamera ditolak,

kamera nggak ada,

file upload invalid.

UX:

Minimal step, no clutter:

Buka web → pilih mode → ambil foto → generate → download.

9. Analytics

Simple dulu:

Track:

Page views.

Click Use Camera.

Click Upload Photos.

Success generate strip.

Click Download.

Tools:

Google Analytics / Plausible.

Ini penting buat lihat apakah orang benar-benar pakai photobooth-nya.

10. Roadmap Next

Setelah MVP jalan:

Tambah layout: double strip, 2x2 grid, dll.

Share to social shortcut: auto open share sheet (mobile).

Preset frame bertema: wedding, birthday, corporate.

Waitlist Vintiq App: form kecil di bawah yang nggak ganggu flow foto.

Integrasi ke app nanti (misal, buka web dari dalam app, atau sebaliknya).