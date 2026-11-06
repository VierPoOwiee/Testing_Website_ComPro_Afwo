// Optimasi produksi AFWO (performa Lighthouse).
// Jalankan setiap kali selesai mengedit src/style.css, src/main.js, atau src/works-data.js:
//   npm install   (sekali saja)
//   npm run optimize
//
// Yang dilakukan:
//   1. src/works-data.js + src/main.js  -> digabung & di-minify jadi src/app.min.js
//      (urutan tetap sama: works-data dulu, lalu main; perilaku tidak berubah).
//   2. src/style.css -> di-minify lalu di-inline ke index.html di antara penanda
//      <!-- AFWO:CSS --> ... <!-- /AFWO:CSS --> supaya tidak ada request CSS yang render-blocking.
//
// File sumber (src/*.js, src/style.css) TIDAK diubah: tetap edit di sana seperti biasa.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;

// ---- 1. JavaScript aplikasi ----
// Hanya minify (hapus spasi/komentar, persingkat nama variabel lokal). Sintaks tidak diturunkan,
// jadi kode yang berjalan identik dengan sumbernya.
const jsSources = ['src/works-data.js', 'src/main.js'];
let appJs = '';
for (const file of jsSources) {
  const src = read(file);
  const { code } = await transform(src, { loader: 'js', minify: true, legalComments: 'none' });
  appJs += `${code.trim()}\n`;
}
const banner = '/* AFWO app bundle — dibuat otomatis oleh scripts/optimize.mjs dari src/works-data.js + src/main.js. Jangan edit file ini. */\n';
writeFileSync(join(root, 'src', 'app.min.js'), banner + appJs);
console.log(`src/app.min.js  ${kb(appJs)}  (sumber: ${kb(jsSources.map(read).join(''))})`);

// ---- 2. CSS: minify + inline ke index.html ----
const cssSrc = read('src/style.css');
let { code: css } = await transform(cssSrc, { loader: 'css', minify: true, legalComments: 'none' });
// CSS di-inline ke index.html (root situs), jadi path ../assets harus menjadi assets/
css = css.replaceAll('../assets/', 'assets/').trim();
console.log(`CSS inline      ${kb(css)}  (sumber: ${kb(cssSrc)})`);

const START = '<!-- AFWO:CSS -->';
const END = '<!-- /AFWO:CSS -->';
const htmlPath = join(root, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
const block = `${START}<style>${css}</style>${END}`;
if (html.includes(START) && html.includes(END)) {
  html = html.slice(0, html.indexOf(START)) + block + html.slice(html.indexOf(END) + END.length);
} else if (html.includes('<link rel="stylesheet" href="src/style.css" />')) {
  html = html.replace('<link rel="stylesheet" href="src/style.css" />', block);
} else {
  console.error('Penanda CSS tidak ditemukan di index.html.');
  process.exit(1);
}
writeFileSync(htmlPath, html);
console.log('index.html diperbarui (CSS inline).');
