// Bundel library motion (GSAP 3.13.0 + plugin + Lenis 1.3.26) jadi satu file lokal yang lebih ramping.
// Jalankan: npm install (sekali), lalu npm run vendor
//
// Versi lama menempelkan 7 file UMD apa adanya (±182 KB). Setiap file UMD membawa salinan
// helper/boilerplate sendiri. Sekarang dibundel dari paket npm (ES module) dengan esbuild,
// sehingga kode bersama hanya ada sekali dan bagian yang tidak terpakai ikut dibuang (tree-shaking).
// Global yang dipakai src/main.js tetap sama: window.gsap, SplitText, ScrollTrigger, Observer,
// Flip, DrawSVGPlugin, Lenis.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const entry = `
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
Object.assign(window, { gsap, SplitText, ScrollTrigger, Observer, Flip, DrawSVGPlugin, Lenis });
`;

const result = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'js' },
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2018',
  legalComments: 'none',
  write: false,
});

const banner = '/* AFWO vendor bundle: GSAP 3.13.0 (gsap, SplitText, ScrollTrigger, Observer, Flip, DrawSVGPlugin) — https://gsap.com/standard-license — + Lenis 1.3.26 (MIT). Build: npm run vendor */\n';
const out = banner + result.outputFiles[0].text;
writeFileSync(join(root, 'assets', 'vendor', 'gsap-bundle.min.js'), out);
console.log(`Vendor bundle dibuat: assets/vendor/gsap-bundle.min.js (${out.length} byte)`);
