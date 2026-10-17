# Plan — Afwo Hair Design

## Arah desain
- **Design movement:** editorial creative agency modern dengan pengaruh Swiss grid yang dibuat lebih ekspresif dan asimetris.
- **Core principles:** bold typographic hierarchy, whitespace yang memberi napas, image-led storytelling, dan interaksi yang ringan namun terasa premium.
- **Color philosophy:** putih tulang dan hitam tinta memberi kesan studio yang tenang dan percaya diri; gold hangat menjadi aksen eksklusif untuk CTA, garis, dan penanda penting.
- **Layout paradigm:** satu alur landing page dengan section lebar, kolom yang bergeser, overlap foto, dan editorial grid yang tidak seragam.
- **Signature elements:** label kecil berawalan `✦`, hairline border gold, dan pill label yang menempel pada foto.
- **Interaction philosophy:** gerakan halus memperkuat ritme baca—reveal saat masuk viewport, hover lift pada kartu, marquee partner yang berhenti saat disentuh.
- **Animation:** GSAP + ScrollTrigger untuk hero stagger, reveal, count-up angka, dan navbar transition; semua durasi 0.4–0.8 detik dengan easing natural.
- **Typography system:** Hanken Grotesk (Google Fonts) untuk judul dan teks, diatur lewat token `--font-display` dan `--font-body` di `src/style.css`.
- **Brand essence:** studio rambut untuk mereka yang ingin tampil lebih tajam, personal, dan percaya diri—**berani, presisi, hangat**.
- **Brand voice:** singkat, tegas, personal. Contoh: “Rambut baru. Energi baru.” dan “Bukan sekadar potong. Ini cara kamu hadir.”
- **Wordmark & logo:** wordmark AFWO uppercase dengan bobot black dan counter letterspacing rapat, dipasangkan dengan simbol titik gold sebagai signature.
- **Signature brand color:** `#D7AD62` — gold hangat “Afwo Gold”.

## Implementasi
- Static HTML/CSS/JS tanpa backend, database, login, atau form submission.
- CTA booking menggunakan WhatsApp placeholder dan mailto; detail kontak ditempatkan terpusat pada `src/main.js` agar mudah diganti.
- Semua foto memakai URL placeholder Unsplash yang unik dan diberi komentar lokasi penggantian pada markup.
- GSAP 3.13 dan plugin SplitText, ScrollTrigger, Observer, Flip, serta DrawSVGPlugin dimuat melalui CDN dan diregister bersama pada awal `gsap.context()`. SplitText menangani reveal hero/section heading, ScrollTrigger menangani reveal/count-up/draw-on-scroll, Observer menangani navbar/gallery/marquee state, Flip menangani filter layanan, dan DrawSVGPlugin menggambar garis dekoratif SVG. Reduced-motion atau kegagalan CDN memakai fallback reveal sederhana.
- Route manifest hanya mendeklarasikan `/` karena halaman adalah one-page landing page.

## Struktur proyek
- `index.html` — seluruh struktur semantik halaman dan konten landing page.
- `src/style.css` — token visual, layout editorial, responsive breakpoint, dan motion CSS.
- `src/main.js` — menu mobile, navbar state, GSAP animations, count-up, marquee hover, dan CTA contact config.
- `public/manus-routes.json` — manifest route untuk preview/publishing.
- `app.config.ts` — metadata logo platform.
- `TODO.md` — outcome dan acceptance clauses dari brief.
