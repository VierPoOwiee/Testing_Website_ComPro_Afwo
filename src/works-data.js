/* =====================================================================
   DATA GALERI KARYA AFWO — satu-satunya tempat untuk mengatur karya.
   Tidak perlu menyentuh main.js atau index.html.

   CARA MENAMBAH KARYA
   1. Taruh foto di assets/foto/gaya/ (nama huruf kecil, pakai tanda hubung).
   2. Tambahkan satu objek baru di WORKS di bawah.
      - category  : salah satu dari WORK_CATEGORIES (selain "All Works")
      - serviceSlug: id layanan (lihat daftar SERVICES di main.js, contoh:
                    'potong-wanita', 'potong-poni', 'basic-color', 'highlight',
                    'fashion-color', 'smoothing', 'keratin-premium')
      - alt       : jelaskan isi foto apa adanya (bukan kata kunci SEO)
      - width/height: ukuran asli foto dalam piksel (cegah layout bergeser)
      - focus     : (opsional) titik fokus crop, mis. '50% 25%' = wajah di atas

   CARA MENENTUKAN KARYA & LAYANAN UNGGULAN → lihat GALLERY_CONFIG.
   ===================================================================== */

window.AFWO_GALLERY = (() => {
  // Kategori filter. Tambahkan kategori baru HANYA jika sudah ada fotonya.
  // TODO (pemilik): kategori "Smoothing & Treatment" belum ada karena belum ada foto
  // hasil smoothing / treatment. Setelah ada fotonya, tambahkan 'Smoothing & Treatment'
  // di bawah lalu pakai sebagai category pada karyanya.
  const WORK_CATEGORIES = ['Haircut', 'Hair Coloring', 'Signature Styles'];

  const GALLERY_CONFIG = {
    // 1) Karya paling merepresentasikan identitas AFWO, urutan dari paling atas.
    //    Karya ini juga harus punya featured: true. Karya featured yang tidak
    //    disebut di sini tetap tampil setelahnya sesuai urutan di WORKS.
    // TODO (pemilik): urutan awal ini hanya usulan sementara (dua karya pertama
    //    sudah lebih dulu tampil di Galeri Karya). Ganti sesuai pilihan AFWO.
    featuredOrder: ['curtain-bang-balayage', 'layer-butterfly-balayage', 'medium-layer-balayage'],

    // 2) Layanan yang sedang diprioritaskan. Setelah karya unggulan, karya dengan
    //    serviceSlug ini naik ke atas (urutan array = urutan prioritas).
    //    Kosongkan [] jika tidak ada prioritas khusus.
    priorityServices: [],

    // 3) Layanan yang ingin dipromosikan. Jika diisi, muncul strip kecil di atas
    //    galeri dengan tautan ke layanan itu. null = tidak ditampilkan.
    //    Contoh: promotedService: 'highlight'
    //    Jangan tulis "paling laris" kecuali ada data penjualannya.
    promotedService: null,

    // Jumlah karya yang diputar di carousel "Galeri Karya" (unggulan lebih dulu).
    carouselLimit: 10,
  };

  const WORKS = [
    { id: 'curtain-bang-balayage', title: 'Curtain Bang Balayage', category: 'Signature Styles', serviceSlug: 'potong-poni', featured: true,
      image: 'assets/foto/gaya/curtain-bang-balayage.jpeg', width: 960, height: 1280, focus: '50% 22%',
      alt: 'Curtain bangs dan balayage cokelat hangat pada rambut panjang, model berdiri di depan cermin salon',
      description: 'Curtain bangs yang jatuh lembut ke sisi wajah, dipadukan balayage hangat pada rambut panjang.' },
    { id: 'layer-butterfly-balayage', title: 'Layer Butterfly Balayage', category: 'Signature Styles', serviceSlug: 'highlight', featured: true,
      image: 'assets/foto/gaya/layer-butterfly-balayage.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Butterfly layer bergelombang dengan balayage ash brown, model berdiri di studio Afwo',
      description: 'Butterfly layer dengan balayage ash brown. Rambut tampak penuh dan bergelombang.' },
    { id: 'medium-layer-balayage', title: 'Medium Layer Balayage', category: 'Hair Coloring', serviceSlug: 'highlight', featured: true,
      image: 'assets/foto/gaya/medium-layer-balayage.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Medium layer bergelombang dengan balayage merah hangat, tampak dari belakang',
      description: 'Medium layer bergelombang dengan balayage merah yang hangat.' },

    { id: 'butterfly-balayage-ash-gray', title: 'Butterfly Balayage Ash Gray', category: 'Signature Styles', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/butterfly-balayage-ash-gray.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Butterfly cut panjang dengan balayage ash gray di atas dasar cokelat gelap',
      description: 'Butterfly cut dengan balayage ash gray di atas dasar dark ash brown.' },
    { id: 'potong-pria', title: 'Potong Pria', category: 'Haircut', serviceSlug: 'potong-pria', featured: false,
      image: 'assets/foto/gaya/potong-pria.jpeg', width: 511, height: 734, focus: '50% 25%',
      alt: 'Hasil potong rambut pria dengan potongan rapi dan presisi',
      description: 'Potongan rapi dan presisi untuk rambut pria, dari gaya klasik sampai yang lebih modern.' },
    { id: 'pixie-cut', title: 'Pixie Cut', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/pixie-cut.jpeg', width: 1032, height: 1290, focus: '50% 30%',
      alt: 'Pixie cut hitam dengan poni halus, tampak dari samping',
      description: 'Potongan pendek di sekitar telinga dengan poni halus. Tegas, ringan, dan mudah dirawat.' },
    { id: 'long-bob-dark-ash-gray', title: 'Long Bob Balayage Dark Ash Gray', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/long-bob-dark-ash-gray.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Long bob lurus sebahu dengan balayage dark ash gray',
      description: 'Long bob lurus yang rapi dengan balayage dark ash gray. Bersih dan elegan.' },
    { id: 'soft-layer-curtain-mahogany', title: 'Soft Layer Curtain Mahogany', category: 'Haircut', serviceSlug: 'potong-poni', featured: false,
      image: 'assets/foto/gaya/soft-layer-curtain-mahogany.jpeg', width: 720, height: 1280, focus: '50% 25%',
      alt: 'Soft layer dengan curtain bangs dan warna dark mahogany brown',
      description: 'Soft layer dengan curtain bangs dan warna dark mahogany brown tanpa bleach.' },
    { id: 'bob-layer-balayage-cool-brown', title: 'Bob Layer Balayage Cool Brown', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/bob-layer-balayage-cool-brown.jpeg', width: 960, height: 1280, focus: '50% 40%',
      alt: 'Bob berlayer dengan balayage cokelat dingin, model duduk di kursi salon',
      description: 'Bob berlayer dengan balayage cool brown yang memberi dimensi lembut.' },
    { id: 'layer-curtain-ash-blonde', title: 'Layer Curtain Ash Blonde', category: 'Haircut', serviceSlug: 'potong-poni', featured: false,
      image: 'assets/foto/gaya/layer-curtain-ash-blonde.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Rambut panjang berlayer warna medium ash blonde yang jatuh bergelombang, tampak dari samping',
      description: 'Layer panjang dengan curtain bangs dan warna full medium ash blonde.' },
    { id: 'layer-curtain-full-brown', title: 'Layer Curtain Full Brown', category: 'Haircut', serviceSlug: 'potong-poni', featured: false,
      image: 'assets/foto/gaya/layer-curtain-full-brown.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Layer panjang dengan curtain bangs dan warna cokelat natural',
      description: 'Layer dengan curtain bangs dan warna full brown tanpa bleach. Natural dan hangat.' },
    { id: 'bob-oval-medium-blonde', title: 'Bob Oval Medium Blonde', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/bob-oval-medium-blonde.jpeg', width: 960, height: 1280, focus: '50% 45%',
      alt: 'Bob oval bergelombang warna medium blonde, tampak dari belakang',
      description: 'Bob oval bergelombang dengan warna medium blonde tanpa bleach. Ringan dan mudah ditata.' },
    { id: 'short-layer-medium-blonde', title: 'Short Layer Medium Blonde', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/short-layer-medium-blonde.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Layer pendek sebahu dengan warna medium blonde',
      description: 'Layer pendek sebahu dengan warna medium blonde. Ringan dan mudah ditata.' },
    { id: 'soft-layer-medium-brown', title: 'Soft Layer Medium Brown', category: 'Haircut', serviceSlug: 'potong-wanita', featured: false,
      image: 'assets/foto/gaya/soft-layer-medium-brown.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Soft layer bergelombang dengan warna cokelat hangat pada rambut panjang',
      description: 'Soft layer bergelombang dengan warna full medium brown tanpa bleach.' },

    { id: 'layer-red-burgundy', title: 'Layer Red Burgundy', category: 'Hair Coloring', serviceSlug: 'basic-color', featured: false,
      image: 'assets/foto/gaya/layer-red-burgundy.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Rambut berlayer bergelombang dengan warna red burgundy',
      description: 'Layer bergelombang dengan warna red burgundy tanpa bleach.' },
    { id: 'medium-layer-ash-blonde', title: 'Medium Layer Ash Blonde', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/medium-layer-ash-blonde.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Medium layer dengan balayage ash blonde yang membingkai wajah',
      description: 'Medium layer dengan balayage ash blonde dan layer yang membingkai wajah.' },
    { id: 'oval-bob-balayage-gray', title: 'Oval Bob Balayage Gray', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/oval-bob-balayage-gray.jpeg', width: 720, height: 1280, focus: '50% 38%',
      alt: 'Oval bob dengan warna balayage gray, model duduk di salon',
      description: 'Oval bob dengan warna full balayage gray. Tegas namun tetap lembut.' },
    { id: 'medium-layer-coppery-blonde', title: 'Medium Layer Coppery Blonde', category: 'Hair Coloring', serviceSlug: 'basic-color', featured: false,
      image: 'assets/foto/gaya/medium-layer-coppery-blonde.jpeg', width: 960, height: 1280, focus: '50% 35%',
      alt: 'Medium layer bergelombang warna coppery blonde yang berkilau, tampak dari belakang',
      description: 'Medium layer dengan warna full medium coppery blonde yang berkilau.' },
    { id: 'medium-layer-red', title: 'Medium Layer Red', category: 'Hair Coloring', serviceSlug: 'basic-color', featured: false,
      image: 'assets/foto/gaya/medium-layer-red.jpeg', width: 960, height: 1280, focus: '50% 30%',
      alt: 'Medium layer bergelombang dengan warna merah gelap',
      description: 'Medium layer bergelombang dengan warna merah yang berani.' },
    { id: 'full-layer-balayage-ash-brown', title: 'Full Layer Balayage Ash Brown', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/full-layer-balayage-ash-brown.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Rambut panjang berlayer dengan balayage ash brown dan gelombang besar',
      description: 'Layer penuh dengan balayage medium ash brown. Gelombang besar yang rapi.' },
    { id: 'layer-balayage-full-gray', title: 'Layer Balayage Full Gray', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/layer-balayage-full-gray.jpeg', width: 960, height: 1280, focus: '50% 40%',
      alt: 'Rambut panjang berlayer dengan balayage abu-abu, model duduk di kursi salon',
      description: 'Layer panjang dengan warna balayage full gray.' },
    { id: 'layer-oval-balayage-ash-gray', title: 'Layer Oval Balayage Ash Gray', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/layer-oval-balayage-ash-gray.jpeg', width: 720, height: 1280, focus: '50% 45%',
      alt: 'Rambut berlayer bentuk oval dengan balayage ash gray, tampak dari belakang',
      description: 'Layer oval dengan balayage full ash gray yang jatuh halus.' },
    { id: 'layer-balayage-pastel-purple', title: 'Layer Balayage Pastel Purple', category: 'Hair Coloring', serviceSlug: 'fashion-color', featured: false,
      image: 'assets/foto/gaya/layer-balayage-pastel-purple.jpeg', width: 720, height: 1280, focus: '50% 62%',
      alt: 'Rambut panjang berlayer dengan balayage ungu, tampak dari belakang',
      description: 'Layer panjang dengan balayage pastel purple untuk tampilan yang berani.' },
    { id: 'layer-artistic-color', title: 'Layer Artistic Color', category: 'Hair Coloring', serviceSlug: 'fashion-color', featured: false,
      image: 'assets/foto/gaya/layer-artistic-color.jpeg', width: 720, height: 1280, focus: '50% 25%',
      alt: 'Rambut panjang berlayer dengan pewarnaan artistik di sekitar wajah',
      description: 'Layer panjang dengan teknik pewarnaan artistik di sekitar wajah.' },
    { id: 'soft-balayage-brown', title: 'Soft Balayage Brown', category: 'Hair Coloring', serviceSlug: 'highlight', featured: false,
      image: 'assets/foto/gaya/soft-balayage-brown.jpeg', width: 960, height: 1280, focus: '50% 25%',
      alt: 'Rambut panjang bergelombang dengan soft balayage cokelat',
      description: 'Soft balayage brown tanpa bleach pada rambut panjang bergelombang.' },
  ];
  // TODO (pemilik): serviceSlug di atas adalah pemetaan awal (potongan → Potong Wanita / Potong Poni,
  // balayage → Highlight, warna solid → Basic Color, warna berani → Fashion Color). Periksa dan sesuaikan.

  return { WORK_CATEGORIES, GALLERY_CONFIG, WORKS };
})();
