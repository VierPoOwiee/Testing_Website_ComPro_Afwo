// Build statis AFWO: salin file ke dist/, isi URL produksi, buat sitemap.xml & robots.txt.
// Tanpa dependency. Jalankan: npm run build
// URL produksi: isi "siteUrl" di site.config.json, atau jalankan dengan env SITE_URL=https://domainmu.com npm run build
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const cfg = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));

let siteUrl = (process.env.SITE_URL || cfg.siteUrl || '').trim().replace(/\/+$/, '');
if (siteUrl) {
  let host = '';
  try { host = new URL(siteUrl).hostname; } catch { /* dicek di bawah */ }
  if (!/^https?:\/\//.test(siteUrl) || !host || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(host) || host.endsWith('.local')) {
    console.error(`siteUrl tidak valid: "${siteUrl}". Pakai URL produksi absolut, mis. https://domainmu.com (bukan localhost).`);
    process.exit(1);
  }
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const item of ['src', 'public', 'assets', 'favicon.svg', '.htaccess']) if (existsSync(join(root, item))) cpSync(join(root, item), join(dist, item), { recursive: true });
cpSync(join(root, 'manus-routes.json'), join(dist, 'manus-routes.json'));

let html = readFileSync(join(root, 'index.html'), 'utf8');
if (siteUrl) {
  html = html.replaceAll('__SITE_URL__', siteUrl);
} else {
  // domain belum ada: jangan menulis canonical/og:url/og:image palsu
  html = html.split('\n').filter((line) => !line.includes('__SITE_URL__')).join('\n');
  console.warn('PERINGATAN: siteUrl kosong. canonical, og:url, og:image, twitter:image, dan sitemap.xml TIDAK dibuat.\n            Isi "siteUrl" di site.config.json sebelum deploy.');
}
// CSS sudah di-inline ke index.html oleh scripts/optimize.mjs (npm run build menjalankannya otomatis).
// Blok di bawah hanya cadangan bila index.html masih memakai <link> ke src/style.css.
const css = readFileSync(join(root, 'src', 'style.css'), 'utf8')
  // Saat CSS di-inline ke index.html, path relatif harus dari root situs.
  .replaceAll("url('../assets/", "url('assets/");
if (html.includes('<link rel="stylesheet" href="src/style.css" />')) {
  html = html.replace('<link rel="stylesheet" href="src/style.css" />', `<style>\n${css}\n</style>`);
}
writeFileSync(join(dist, 'index.html'), html);

let robots = 'User-agent: *\nAllow: /\n';
if (siteUrl) {
  robots += `\nSitemap: ${siteUrl}/sitemap.xml\n`;
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n</urlset>\n`);
}
writeFileSync(join(dist, 'robots.txt'), robots);
console.log(`Build selesai → dist/ ${siteUrl ? `(siteUrl: ${siteUrl})` : '(tanpa siteUrl)'}`);
