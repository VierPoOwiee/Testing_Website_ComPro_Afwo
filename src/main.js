(() => {
  // ===== PUSAT PENGATURAN: ganti data salon di sini =====
  const CONFIG = {
    whatsapp: '628115139990',
    email: 'hairdesignafwo@gmail.com',
    bookingMessage: 'Halo kak, saya ingin booking konsultasi.',
    address: ['Bunyamin Residence, Cluster Magnolia No.145', 'Kalimantan Selatan'],
    mapsQuery: 'Afwo Hair Design, Kalimantan Selatan', // GANTI dengan alamat/nama tempat di Google Maps
    mapsUrl: 'https://maps.app.goo.gl/kiMqnTDABVW5WLUd6', // link buka maps salon (tombol Buka di Google Maps)
    reviewsUrl: 'https://maps.app.goo.gl/qqGACZnpg8HkfvVJ6', // tempel link ulasan Google Maps; kosong = pakai pencarian Maps
    // jam buka per hari (0 = Minggu ... 6 = Sabtu), format 24 jam WIB. null = tutup
    hours: { 0: ['10:00', '19:00 WITA'], 1: null, 2: ['10:00', '19:00 WITA'], 3: ['10:00', '19:00 WITA'], 4: ['10:00', '19:00 WITA'], 5: ['10:00', '19:00 WITA'], 6: ['10:00', '19:00 WITA'] },
  };
  const picked = []; // gaya potong yang dipilih pengunjung (ikut terkirim ke WhatsApp)
  const bookingText = () => (picked.length
    ? `${CONFIG.bookingMessage}\nGaya potong yang saya pilih:\n${picked.map((n) => `- ${n}`).join('\n')}\nMohon info jadwal yang tersedia ya.`
    : CONFIG.bookingMessage);
  const refreshBookingLinks = () => {
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(bookingText())}`;
    document.querySelectorAll('[data-booking-link]').forEach((link) => { link.href = url; });
  };

  setTimeout(() => {
    if (document.documentElement.classList.contains('is-loading')) {
      document.documentElement.classList.remove('is-loading');
      document.getElementById('pt')?.remove();
      document.querySelectorAll('.reveal').forEach((el) => el.classList.remove('reveal'));
    }
  }, 12000);

  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navWrap = document.querySelector('.nav-wrap');
  const menuLabel = menuToggle?.querySelector('.menu-label');

  const setScrolled = (isScrolled = window.scrollY > 24) => header?.classList.toggle('scrolled', isScrolled);
  setScrolled();
  window.addEventListener('scroll', () => setScrolled(), { passive: true });


  refreshBookingLinks();
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { link.href = `https://wa.me/${CONFIG.whatsapp}`; });
  document.querySelectorAll('[data-email-link]').forEach((link) => { link.href = `mailto:${CONFIG.email}`; link.textContent = CONFIG.email; });

  const revealFallback = () => {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.remove('reveal'));
    document.querySelectorAll('.count').forEach((counter) => { counter.textContent = Number(counter.dataset.count).toLocaleString('id-ID'); });
  };

  const animateCounts = () => {
    document.querySelectorAll('.count').forEach((counter) => {
      const target = Number(counter.dataset.count || 0);
      const proxy = { value: 0 };
      gsap.to(proxy, { value: target, duration: .8, ease: 'power2.out', onUpdate: () => { counter.textContent = Math.floor(proxy.value).toLocaleString('id-ID'); } });
    });
  };

  const setupServiceFlip = () => {
    const tabs = gsap.utils.toArray('.filter-tab');
    const cards = gsap.utils.toArray('.service-card');
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      const state = Flip.getState(cards);
      tabs.forEach((button) => {
        const active = button === tab;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      cards.forEach((card) => {
        const shouldShow = filter === 'all' || card.dataset.service === filter;
        card.classList.toggle('is-filtered', !shouldShow);
        card.setAttribute('aria-hidden', String(!shouldShow));
        gsap.set(card, { display: shouldShow ? 'flex' : 'none' });
      });
      Flip.from(state, { duration: .6, ease: 'power2.out', absolute: true, stagger: .04, prune: true, onComplete: () => ScrollTrigger.refresh() });
    }));
  };

  const setupGalleryCarousel = () => {
    const wrapper = document.querySelector('.gallery-carousel');
    const track = document.querySelector('.gallery-track');
    const group = track?.querySelector('.gallery-group');
    if (!wrapper || !track || !group) return;

    // klon grup kartu sampai cukup menutupi layar + 1 grup cadangan, supaya loop mulus tanpa celah
    const groupW = group.offsetWidth;
    if (!groupW) return;
    const copies = Math.max(2, Math.ceil(wrapper.offsetWidth / groupW) + 1);
    for (let i = 1; i < copies; i++) {
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      track.appendChild(clone);
    }
    track.style.setProperty('--gallery-shift', `-${100 / copies}%`);
    track.style.setProperty('--gallery-duration', `${Math.round(groupW / 42)}s`); // ~42px/detik
    wrapper.classList.add('is-running');

    // jeda saat disentuh (HP) dan saat carousel di luar layar -> hemat tenaga
    wrapper.addEventListener('touchstart', () => wrapper.classList.add('is-paused'), { passive: true });
    wrapper.addEventListener('touchend', () => wrapper.classList.remove('is-paused'));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        wrapper.classList.toggle('is-offscreen', !entry.isIntersecting);
      }, { rootMargin: '120px' }).observe(wrapper);
    }
  };

  /* ============ LAYANAN: data, slider 3D, halaman semua layanan, router, loader ============ */
  const $ = (s, r = document) => r.querySelector(s);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // foto layanan = file lokal assets/foto/<slug>.jpg (lihat assets/foto/PANDUAN-FOTO.md). Belum ada file -> pelat monogram.
  const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const mono = (n) => n.split(/[\s/+]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const photoSrc = (n) => `assets/foto/${slug(n)}.jpg`;
  // Urutan foto: (1) file spesifik assets/foto/<layanan>.jpg -> (2) foto salon dari peta cadangan ini -> (3) pelat monogram.
  const GF = (f) => `assets/foto/gaya/${f}.jpeg`;
  const SVC_FB = { 'potong-wanita': GF('Soft_layered_color_full_medium_brown_no_bleach'), 'potong-poni': GF('Layered_with_curtain_color_full_brown_no_bleach'), 'potong-wanita-cuci-blow': GF('short_layered_color_Medium_blonde'), 'cuci-catok-styling-blow': GF('Full_layered_color_balayage_medium_Ash_brown'), 'keratin-premium': GF('long_bob_color_balaye_dark_ash_gray'), 'smoothing': GF('medium_layered_color_balayage_Ash_blonde'), 'blow-perm': GF('Medium_Layer_Balayage'), 'basic-color': GF('layered_color_Red_Burgundy_no_bleach'), 'basic-color-two-apply': GF('medium_layered_Color_Full_Medium_coppery_blonde'), 'refresh-color-treatment': GF('soft_balayage_color_brown_no_bleach'), 'fashion-color': GF('layer_color_Balayage_Pastel_Purple'), 'highlight': GF('Buterfly_Color_Balayage_Ash_gray_dg_base_dark_ash_brown'), 'peek-a-boo': GF('layer_color_artistic_teknik'), 'cat-akar': GF('medium_layered_color_Red'), 'bleach-akar': GF('layered_color_balayage_full_gray'), 'creambath': GF('medium_layered_Color_Full_Medium_coppery_blonde') };
  const fbAttr = (n, map = SVC_FB) => (map[slug(n)] ? ` data-fallback="${map[slug(n)]}"` : '');
  const markNoPhoto = (img) => {
    const fb = img.dataset.fallback;
    if (fb && !img.dataset.fbTried) { img.dataset.fbTried = '1'; img.src = fb; return; }
    img.hidden = true;
    img.parentElement?.classList.add('no-photo');
  };
  const fixPhotos = () => document.querySelectorAll('img[data-photo]').forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markNoPhoto(img); });
  document.addEventListener('error', (e) => { if (e.target.matches?.('img[data-photo]')) markNoPhoto(e.target); }, true);
  const waLink = (name) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Halo Afwo, saya tertarik dengan layanan ${name}.`)}`;

  // SUMBER TUNGGAL: daftar layanan dari CRM (tanpa produk). Format: [nama, kategori, penjelasan ringkas, id foto (opsional)]
  const CATS = ['Potong', 'Styling', 'Treatment Rambut', 'Warna Rambut', 'Treatment'];
  const SERVICES = [
    ['Potong Wanita', 'Potong', 'Potongan yang disesuaikan dengan bentuk wajah, tekstur, dan kebiasaan penataan rambutmu.'],
    ['Potong Pria', 'Potong', 'Potongan rapi dan presisi untuk rambut pria, dari gaya klasik sampai yang lebih modern.'],
    ['Potong Anak', 'Potong', 'Potong rambut untuk si kecil dengan pendekatan yang sabar dan nyaman.'],
    ['Potong Poni', 'Potong', 'Merapikan atau membentuk ulang poni tanpa perlu memotong seluruh rambut.'],
    ['Potong Wanita + Cuci + Blow', 'Potong', 'Paket potong lengkap dengan keramas dan blow, pulang dengan rambut yang sudah tertata.'],
    ['Potong Pria + Cuci + Blow', 'Potong', 'Paket potong untuk pria dengan keramas dan blow, langsung rapi saat keluar salon.'],
    ['Cuci Catok / Styling + Blow', 'Styling', 'Keramas dilanjutkan catok atau styling dan blow, cocok untuk acara atau sekadar tampil rapi.'],
    ['Keratin Premium', 'Treatment Rambut', 'Perawatan keratin agar rambut tampak lebih halus, lurus alami, dan mudah ditata. Hasil bergantung pada kondisi rambut.'],
    ['Smoothing', 'Treatment Rambut', 'Melembutkan dan meluruskan rambut agar lebih mudah diatur, tersedia untuk area akar maupun seluruh rambut.'],
    ['Perm Akar', 'Treatment Rambut', 'Perm di area akar untuk memberi volume dan tampilan rambut yang lebih mengembang dari pangkal.'],
    ['Blow Perm', 'Treatment Rambut', 'Perm bergaya blow dengan hasil gelombang yang lembut dan lebih mudah ditata.'],
    ['Cold Perm', 'Treatment Rambut', 'Perm dingin untuk membentuk ikal atau gelombang tanpa panas langsung pada rambut.'],
    ['Basic Color', 'Warna Rambut', 'Pewarnaan satu warna yang rata dari akar hingga ujung, dipilih sesuai tone kulit dan gayamu.'],
    ['Basic Color Two Apply', 'Warna Rambut', 'Pewarnaan dua tahap untuk hasil warna yang lebih pekat atau lebih terang dari warna rambut awal.'],
    ['Refresh Color Treatment', 'Warna Rambut', 'Menyegarkan warna rambut yang mulai pudar sambil membantu menjaga kilau dan kelembutannya.'],
    ['Fashion Color', 'Warna Rambut', 'Warna berani dan fashionable, dari pastel sampai vivid, diawali konsultasi warna.'],
    ['Highlight', 'Warna Rambut', 'Aksen warna pada helai tertentu untuk memberi dimensi dan kesan rambut yang lebih hidup.'],
    ['Peek A Boo', 'Warna Rambut', 'Warna tersembunyi di lapisan bawah rambut yang muncul saat rambut bergerak atau dikuncir.'],
    ['Cat Akar', 'Warna Rambut', 'Pewarnaan khusus area akar yang sudah tumbuh agar warna rambut kembali seragam.'],
    ['Bleach Akar', 'Warna Rambut', 'Pencerahan area akar yang sudah tumbuh agar selaras dengan warna rambut yang sudah di-bleach.'],
    ['Creambath', 'Treatment', 'Perawatan rambut dan kulit kepala dengan pijatan relaksasi agar rambut terasa lebih lembut dan segar.'],
    ['Hairmask', 'Treatment', 'Masker rambut untuk memberi nutrisi ekstra pada rambut yang kering atau terasa kasar.'],
    ['Treatment Komplit', 'Treatment', 'Rangkaian perawatan menyeluruh agar rambut terasa lebih sehat dan mudah ditata.'],
    ['Hair Detox', 'Treatment', 'Pembersihan mendalam dari sisa produk dan penumpukan di rambut serta kulit kepala.'],
  ];
  // 7 layanan yang tampil di slider beranda (urutan: kartu tengah = urutan ke-4). Ganti nama di sini bila perlu.
  const HIGHLIGHT = ['Potong Wanita', 'Keratin Premium', 'Highlight', 'Basic Color', 'Fashion Color', 'Smoothing', 'Creambath'];

  // posisi kartu pada kipas 3D (sudut ditulis bertanda supaya tidak berputar jauh)
  const SLOTS = [
    { h: 495, z: 110, r: 15, clip: 'polygon(0px 0px, 100% 7%, 100% 93%, 0px 100%)' },
    { h: 420, z: 66, r: 15, clip: 'polygon(0px 0px, 100% 7%, 100% 93%, 0px 100%)' },
    { h: 353, z: 46, r: 6, clip: 'polygon(0px 0px, 100% 7%, 100% 93%, 0px 100%)' },
    { h: 310, z: 0, r: 0, clip: 'polygon(0px 0px, 100% 0%, 100% 100%, 0px 100%)' },
    { h: 353, z: 54, r: -12, clip: 'polygon(0px 7%, 100% 0%, 100% 100%, 0px 93%)' },
    { h: 420, z: 89, r: -15, clip: 'polygon(0px 7%, 100% 0%, 100% 100%, 0px 93%)' },
    { h: 495, z: 135, r: -15, clip: 'polygon(0px 7%, 100% 0%, 100% 100%, 0px 93%)' },
  ];
  const FULL_CLIP = 'polygon(0px 0px, 100% 0%, 100% 100%, 0px 100%)';

  const initServiceSlider = () => {
    const slider = $('#svxSlider');
    const track = $('#svxTrack');
    if (!slider || !track || !window.gsap) return null;
    const items = HIGHLIGHT.map((name) => SERVICES.find((s) => s[0] === name)).filter(Boolean);
    track.innerHTML = items.map((s) => `<article class="svx-card" data-mono="${mono(s[0])}" tabindex="0" role="button" aria-label="Lihat penjelasan ${s[0]}"><img data-photo${fbAttr(s[0])} src="${photoSrc(s[0])}" alt="Model dengan hasil ${s[0]}" loading="lazy" decoding="async" draggable="false" /><div class="svx-label"><small>${s[1]}</small><strong>${s[0]}</strong></div><div class="svx-hover">Lihat detail</div></article>`).join('');
    let cards = [...track.children];
    cards.forEach((card, i) => { card._svc = items[i]; });

    const info = document.createElement('div');
    info.className = 'svx-info';
    info.setAttribute('role', 'dialog');
    info.innerHTML = '<small></small><h3></h3><p></p><a target="_blank" rel="noreferrer">Booking layanan ini ↗</a>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'svx-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Tutup penjelasan');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    const backdrop = document.createElement('div');
    backdrop.className = 'svx-backdrop';
    document.body.append(backdrop, info, closeBtn);

    let k = 1;
    let open = null;
    let clone = null;
    let inView = false;
    const measure = () => {
      k = Math.max(.58, Math.min(1, slider.clientWidth / 1760));
      slider.style.perspective = `${1500 * k}px`;
      track.style.gap = `${8 * k}px`;
      track.style.minHeight = `${520 * k}px`;
    };
    const place = () => cards.forEach((card, i) => {
      const s = SLOTS[i];
      gsap.set(card, { width: 240 * k, height: s.h * k, clipPath: s.clip, z: s.z * k, rotationY: s.r, y: 0 });
    });
    measure();
    place();

    const rotate = (dir) => {
      if (open) return;
      const n = cards.length;
      cards.forEach((card, i) => {
        const s = SLOTS[dir === 'next' ? (i - 1 + n) % n : (i + 1) % n];
        gsap.set(card, { clipPath: s.clip });
        gsap.to(card, { height: s.h * k, z: s.z * k, rotationY: s.r, duration: .5, ease: 'power2.out', overwrite: 'auto' });
      });
      let wrapped;
      if (dir === 'next') { wrapped = cards.shift(); cards.push(wrapped); track.appendChild(wrapped); }
      else { wrapped = cards.pop(); cards.unshift(wrapped); track.prepend(wrapped); }
      gsap.fromTo(wrapped, { opacity: 0 }, { opacity: 1, duration: .45, ease: 'power1.out' });
    };

    const finalBox = () => {
      const w = Math.min(500, innerWidth * .86);
      const h = Math.min(650, innerHeight * (innerWidth < 640 ? .56 : .64));
      return { w, h, left: (innerWidth - w) / 2, top: Math.max(16, (innerHeight - h) / 2 - 36) };
    };

    const expand = (card) => {
      if (open) return;
      open = card;
      const d = card._svc;
      info.querySelector('small').textContent = d[1];
      info.querySelector('h3').textContent = d[0];
      info.querySelector('p').textContent = d[2];
      info.querySelector('a').href = waLink(d[0]);
      const r = card.getBoundingClientRect();
      clone = card.cloneNode(true);
      clone.className = `svx-clone${card.classList.contains('no-photo') ? ' no-photo' : ''}`;
      clone.removeAttribute('tabindex');
      clone.removeAttribute('style');
      clone.querySelector('.svx-hover')?.remove();
      clone.querySelector('.svx-label')?.remove();
      const cimg = clone.querySelector('img'); if (cimg) cimg.style.cssText = 'width:100%;height:100%;object-fit:cover';
      Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, clipPath: SLOTS[cards.indexOf(card)].clip });
      document.body.appendChild(clone);
      gsap.set(card, { opacity: 0 });
      track.classList.add('is-blurred');
      window.__lenis?.stop();
      const f = finalBox();
      const dur = reduced() ? .01 : .8;
      backdrop.style.pointerEvents = 'all';
      gsap.to(backdrop, { opacity: 1, duration: dur * .6 });
      gsap.to(clone, {
        left: f.left, top: f.top, width: f.w, height: f.h, clipPath: FULL_CLIP, duration: dur, ease: 'power2.out',
        onComplete: () => { info.classList.add('is-visible'); closeBtn.classList.add('is-visible'); closeBtn.focus({ preventScroll: true }); },
      });
    };

    const close = (instant = false) => {
      if (!open) return;
      const card = open;
      const c = clone;
      const r = card.getBoundingClientRect();
      info.classList.remove('is-visible');
      closeBtn.classList.remove('is-visible');
      const done = () => {
        c?.remove();
        gsap.set(card, { opacity: 1 });
        track.classList.remove('is-blurred');
        backdrop.style.pointerEvents = 'none';
        window.__lenis?.start();
        open = null;
        clone = null;
        card.focus({ preventScroll: true });
      };
      gsap.killTweensOf([c, backdrop]);
      if (instant || reduced()) { gsap.set(backdrop, { opacity: 0 }); done(); return; }
      gsap.to(backdrop, { opacity: 0, duration: .5 });
      gsap.to(c, { left: r.left, top: r.top, width: r.width, height: r.height, clipPath: SLOTS[cards.indexOf(card)].clip, duration: .7, ease: 'power2.out', onComplete: done });
    };

    // geser (mouse & sentuh): pointer events + touch-action: pan-y, jadi scroll vertikal halaman tetap jalan
    let dragging = false;
    let startX = 0;
    let moved = 0;
    let steps = 0;
    slider.addEventListener('pointerdown', (e) => { if (open) return; dragging = true; startX = e.clientX; moved = 0; steps = 0; slider.classList.add('is-dragging'); });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      const s = Math.floor(Math.abs(dx) / 60);
      if (s > steps) { rotate(dx > 0 ? 'prev' : 'next'); steps = s; }
    });
    const endDrag = () => { dragging = false; slider.classList.remove('is-dragging'); };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    slider.addEventListener('click', (e) => { const card = e.target.closest('.svx-card'); if (card && moved < 8 && !open) expand(card); });
    slider.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('svx-card')) { e.preventDefault(); expand(e.target); } });
    $('#svxPrev')?.addEventListener('click', () => rotate('prev'));
    $('#svxNext')?.addEventListener('click', () => rotate('next'));
    closeBtn.addEventListener('click', () => close());
    backdrop.addEventListener('click', () => close());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      else if (inView && !open && e.key === 'ArrowLeft') rotate('prev');
      else if (inView && !open && e.key === 'ArrowRight') rotate('next');
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .25 }).observe(slider);
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!open) { measure(); place(); } }, 150); });
    return { close };
  };

  /* ---- halaman semua layanan ---- */
  let svcBatch = [];
  const buildServicePage = () => {
    const list = $('#svcList');
    const filters = $('#svcFilters');
    if (!list || !filters) return;
    $('#svcCount').textContent = `${SERVICES.length} layanan dalam ${CATS.length} kategori. Klik layanan untuk melihat penjelasannya.`;
    const count = (c) => (c === 'Semua' ? SERVICES.length : SERVICES.filter((s) => s[1] === c).length);
    filters.innerHTML = ['Semua', ...CATS].map((c, i) => `<button type="button" class="svc-chip${i ? '' : ' is-active'}" data-cat="${c}">${c}<small>${count(c)}</small></button>`).join('');
    list.innerHTML = SERVICES.map((s, i) => `<li class="svc-row" data-cat="${s[1]}"><button class="svc-head" type="button" aria-expanded="false"><span class="svc-no">${String(i + 1).padStart(2, '0')}</span><span class="svc-name">${s[0]}</span><span class="svc-cat">${s[1]}</span><span class="svc-plus" aria-hidden="true"></span></button><div class="svc-body"><div><div class="svc-open"><div class="svc-photo" data-mono="${mono(s[0])}"><img data-photo${fbAttr(s[0])} src="${photoSrc(s[0])}" alt="Model dengan hasil ${s[0]}" loading="lazy" decoding="async" /></div><div class="svc-text"><p>${s[2]}</p><a class="text-link" target="_blank" rel="noreferrer" href="${waLink(s[0])}">Booking layanan ini <span>↗</span></a>${s[1] === 'Potong' ? '<a class="text-link" href="#gaya">Pilih gaya potong <span>↓</span></a>' : ''}</div></div></div></div></li>`).join('');

    list.addEventListener('click', (e) => {
      const head = e.target.closest('.svc-head');
      if (!head) return;
      const row = head.parentElement;
      head.setAttribute('aria-expanded', String(row.classList.toggle('is-open')));
    });
    filters.addEventListener('click', (e) => {
      const chip = e.target.closest('.svc-chip');
      if (!chip) return;
      const cat = chip.dataset.cat;
      filters.querySelectorAll('.svc-chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      let n = 0;
      const shown = [];
      list.querySelectorAll('.svc-row').forEach((row) => {
        const show = cat === 'Semua' || row.dataset.cat === cat;
        row.hidden = !show;
        if (show) { row.querySelector('.svc-no').textContent = String(++n).padStart(2, '0'); shown.push(row); }
      });
      if (window.gsap && !reduced()) gsap.fromTo(shown, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .45, stagger: .035, ease: 'power2.out', overwrite: true });
      window.ScrollTrigger?.refresh();
    });
  };
  const leaveServicePage = () => { svcBatch.forEach((t) => t.kill()); svcBatch = []; };
  const playPageIntro = (name) => {
    if (name !== 'layanan' || !window.gsap || reduced()) return;
    gsap.timeline({ delay: .25 })
      .from('.svc-hero .back-link, .svc-hero .eyebrow, .svc-title, .svc-sub', { y: 30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out' })
      .from('.svc-chip', { y: 14, opacity: 0, duration: .4, stagger: .04, ease: 'power2.out' }, '-=.35');
    const rows = gsap.utils.toArray('.svc-row');
    gsap.set(rows, { opacity: 0, y: 26 });
    if (window.ScrollTrigger) {
      leaveServicePage();
      svcBatch = ScrollTrigger.batch(rows, { start: 'top 94%', once: true, onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: .6, stagger: .05, ease: 'power3.out', overwrite: true }) });
      ScrollTrigger.refresh();
    } else gsap.to(rows, { opacity: 1, y: 0, stagger: .03, duration: .5 });
  };

  /* ---- panel transisi 4 kolom (clip-path) + router hash ---- */
  const stRef = { b1: 0, b2: 0, b3: 0, b4: 0 };
  const applyPt = () => { const p = $('#pt'); if (p) for (let i = 1; i <= 4; i++) p.style.setProperty(`--b${i}`, `${stRef[`b${i}`]}%`); };
  const sweep = (to, onDone) => {
    const tl = gsap.timeline({ onUpdate: applyPt, onComplete: onDone });
    [1, 2, 3, 4].forEach((i) => tl.to(stRef, { [`b${i}`]: to, duration: .55, ease: 'power2.inOut' }, (i - 1) * .09));
    return tl;
  };
  const runCover = (label) => new Promise((resolve) => {
    const p = $('#pt');
    if (!p) { resolve(); return; }
    $('#pt-label').textContent = label;
    gsap.set('#pt-bar', { scaleX: 0 });
    p.classList.remove('is-boot');
    p.classList.add('is-active');
    Object.assign(stRef, { b1: 0, b2: 0, b3: 0, b4: 0 });
    applyPt();
    gsap.to('#pt-bar', { scaleX: 1, duration: .75, ease: 'power1.inOut' });
    sweep(100, () => setTimeout(resolve, 140));
  });
  const runUncover = () => new Promise((resolve) => {
    const p = $('#pt');
    if (!p) { resolve(); return; }
    sweep(0, () => { p.classList.remove('is-active'); resolve(); });
  });

  const views = { home: $('#view-home'), layanan: $('#view-layanan') };
  const baseTitle = document.title;
  const toRoute = () => (location.hash.startsWith('#/layanan') ? 'layanan' : 'home');
  let current = 'home';
  let busy = false;
  if (views.layanan && toRoute() === 'layanan') {
    views.home.hidden = true; views.layanan.hidden = false; current = 'layanan';
    document.title = 'Semua Layanan — Afwo Hair Design';
  }
  const scrollToTarget = (sel, immediate = false) => {
    const el = !sel || sel === '#top' ? null : $(sel);
    const y = el ? el.getBoundingClientRect().top + window.scrollY - 84 : 0;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate, duration: 1.2 });
    else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
  };
  const swap = (name) => {
    if (name !== 'layanan') leaveServicePage();
    Object.entries(views).forEach(([key, el]) => { if (el) el.hidden = key !== name; });
    current = name;
    document.dispatchEvent(new CustomEvent('afwo:route', { detail: name }));
    document.title = name === 'layanan' ? 'Semua Layanan — Afwo Hair Design' : baseTitle;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
    window.ScrollTrigger?.refresh();
    setScrolled();
  };
  const navigate = (name, anchor, push = true) => {
    if (busy) return;
    if (name === current) { if (anchor) scrollToTarget(anchor); return; }
    busy = true;
    window.__svx?.close(true);
    if (push) { try { history.pushState(null, '', name === 'layanan' ? '#/layanan' : '#/'); } catch (err) { /* abaikan */ } }
    const doSwap = () => { swap(name); if (anchor) scrollToTarget(anchor, true); };
    if (!window.gsap || reduced()) { doSwap(); busy = false; return; }
    runCover(name === 'layanan' ? 'Memuat layanan' : 'Memuat beranda')
      .then(() => { doSwap(); playPageIntro(name); return runUncover(); })
      .then(() => { busy = false; })
      .catch(() => { busy = false; });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (href === '#/layanan' || href === '#/') { e.preventDefault(); navigate(href === '#/' ? 'home' : 'layanan'); return; }
    if (href.length > 1 && !href.startsWith('#/')) {
      e.preventDefault();
      if (current === 'layanan') navigate('home', href); else scrollToTarget(href);
    }
  });
  window.addEventListener('popstate', () => { const r = toRoute(); if (r !== current) navigate(r, null, false); });

  /* ---- loader awal (dengan persentase) ---- */
  const boot = (() => {
    const p = $('#pt');
    if (!p) return { finish: () => Promise.resolve() };
    const cnt = $('#pt-count');
    const bar = $('#pt-bar');
    let target = 6;
    let shown = 0;
    const paint = () => {
      shown += (target - shown) * .14;
      if (target >= 100 && shown > 99.4) shown = 100;
      cnt.textContent = Math.round(shown);
      bar.style.transform = `scaleX(${shown / 100})`;
      if (shown < 100) requestAnimationFrame(paint);
    };
    requestAnimationFrame(paint);
    const bump = (v) => { target = Math.min(100, Math.max(target, v)); };
    if (document.readyState !== 'loading') bump(22); else document.addEventListener('DOMContentLoaded', () => bump(22));
    const imgs = [...document.querySelectorAll('.hero img')];
    let loaded = 0;
    imgs.forEach((img) => {
      const done = () => { loaded += 1; bump(22 + (loaded / imgs.length) * 50); };
      if (img.complete) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
    document.fonts?.ready.then(() => bump(80));
    return {
      finish: () => new Promise((resolve) => {
        bump(100);
        const t0 = performance.now();
        const wait = () => (shown >= 99.5 || performance.now() - t0 > 900 ? resolve() : requestAnimationFrame(wait));
        wait();
      }),
    };
  })();

  const exitBoot = () => new Promise((resolve) => {
    const p = $('#pt');
    const play = () => { window.__playIntro?.(); playPageIntro(current); };
    const finish = () => { document.documentElement.classList.remove('is-loading'); resolve(); };
    if (!p) { play(); finish(); return; }
    if (!window.gsap || reduced()) {
      p.style.transition = 'opacity .4s ease';
      p.style.opacity = '0';
      setTimeout(() => { p.remove(); play(); finish(); }, 420);
      return;
    }
    Object.assign(stRef, { b1: 100, b2: 100, b3: 100, b4: 100 });
    applyPt();
    gsap.delayedCall(.12, play);
    sweep(0, () => { p.classList.remove('is-boot', 'is-active'); finish(); });
  });


  /* ============ GAYA POTONG (referensi + pilihan), JAM BUKA, TOMBOL WHATSAPP ============ */
  // Referensi gaya rambut WANITA. Format: [nama, potongan, penjelasan, kata kunci Pinterest, nama file foto tanpa .jpeg di assets/foto/gaya/]
  const GAYA_GROUPS = ['Layer', 'Bob', 'Curtain Bangs', 'Butterfly', 'Pixie'];
  const GAYA_MAX = 3;
  const GAYA = [
    ['Curtain Bang Balayage', 'Curtain Bangs', 'Curtain bangs yang jatuh lembut ke sisi wajah, dipadukan balayage hangat pada rambut panjang.', 'curtain bangs balayage long hair', 'Curtain_Bang_Balayage'],
    ['Layer Butterfly Balayage', 'Butterfly', 'Butterfly layer dengan balayage ash brown. Rambut tampak penuh dan bergelombang.', 'butterfly cut balayage', 'Layer_Butterfly_Balayage'],
    ['Long Bob Balayage Dark Ash Gray', 'Bob', 'Long bob lurus yang rapi dengan balayage dark ash gray. Bersih dan elegan.', 'long bob ash gray balayage', 'long_bob_color_balaye_dark_ash_gray'],
    ['Layer Red Burgundy', 'Layer', 'Layer bergelombang dengan warna red burgundy tanpa bleach.', 'burgundy hair layers', 'layered_color_Red_Burgundy_no_bleach'],
    ['Soft Layer Curtain Mahogany', 'Curtain Bangs', 'Soft layer dengan curtain bangs dan warna dark mahogany brown tanpa bleach.', 'mahogany brown curtain bangs layers', 'Soft_layered_with_curtain_color_Dark_mahogany_brown_no_bleach'],
    ['Medium Layer Ash Blonde', 'Layer', 'Medium layer dengan balayage ash blonde dan layer yang membingkai wajah.', 'medium layered ash blonde balayage', 'medium_layered_color_balayage_Ash_blonde'],
    ['Bob Layer Balayage Cool Brown', 'Bob', 'Bob berlayer dengan balayage cool brown yang memberi dimensi lembut.', 'layered bob balayage brown', 'Bob_layered_color_balayage_cool_brown'],
    ['Pixie Cut', 'Pixie', 'Potongan pendek di sekitar telinga dengan poni halus. Tegas, ringan, dan mudah dirawat.', 'pixie cut women', 'Pixie_Cut'],
    ['Layer Curtain Ash Blonde', 'Curtain Bangs', 'Layer panjang dengan curtain bangs dan warna full medium ash blonde.', 'layered curtain bangs ash blonde', 'Layered_with_curtain_Color_Full_Medium_Ash_blonde'],
    ['Layer Curtain Full Brown', 'Curtain Bangs', 'Layer dengan curtain bangs dan warna full brown tanpa bleach. Natural dan hangat.', 'layered curtain bangs brown hair', 'Layered_with_curtain_color_full_brown_no_bleach'],
    ['Butterfly Balayage Ash Gray', 'Butterfly', 'Butterfly cut dengan balayage ash gray di atas dasar dark ash brown.', 'butterfly haircut ash gray balayage', 'Buterfly_Color_Balayage_Ash_gray_dg_base_dark_ash_brown'],
    ['Bob Oval Medium Blonde', 'Bob', 'Bob oval bergelombang dengan warna medium blonde tanpa bleach. Ringan dan mudah ditata.', 'oval bob haircut blonde wavy', 'Bob_Oval_color_medium_blonde_no_bleach'],
    ['Oval Bob Balayage Gray', 'Bob', 'Oval bob dengan warna full balayage gray. Tegas namun tetap lembut.', 'oval bob gray balayage', 'Oval_Bob_with_medium_trap_color_full_balayage_gray'],
    ['Medium Layer Balayage', 'Layer', 'Medium layer bergelombang dengan balayage merah yang hangat.', 'medium layered haircut red balayage', 'Medium_Layer_Balayage'],
    ['Medium Layer Coppery Blonde', 'Layer', 'Medium layer dengan warna full medium coppery blonde yang berkilau.', 'copper blonde layered hair', 'medium_layered_Color_Full_Medium_coppery_blonde'],
    ['Medium Layer Red', 'Layer', 'Medium layer bergelombang dengan warna merah yang berani.', 'red layered hair', 'medium_layered_color_Red'],
    ['Full Layer Balayage Ash Brown', 'Layer', 'Layer penuh dengan balayage medium ash brown. Gelombang besar yang rapi.', 'long layered balayage ash brown', 'Full_layered_color_balayage_medium_Ash_brown'],
    ['Layer Balayage Full Gray', 'Layer', 'Layer panjang dengan warna balayage full gray.', 'gray balayage layered hair', 'layered_color_balayage_full_gray'],
    ['Layer Oval Balayage Ash Gray', 'Layer', 'Layer oval dengan balayage full ash gray yang jatuh halus.', 'ash gray balayage layers', 'layered_oval_color_Balayage_full_ash_gray'],
    ['Layer Balayage Pastel Purple', 'Layer', 'Layer panjang dengan balayage pastel purple untuk tampilan yang berani.', 'pastel purple balayage layered hair', 'layer_color_Balayage_Pastel_Purple'],
    ['Layer Artistic Color', 'Layer', 'Layer panjang dengan teknik pewarnaan artistik di sekitar wajah.', 'artistic hair color face framing', 'layer_color_artistic_teknik'],
    ['Soft Layer Medium Brown', 'Layer', 'Soft layer bergelombang dengan warna full medium brown tanpa bleach.', 'soft layered haircut brown', 'Soft_layered_color_full_medium_brown_no_bleach'],
    ['Short Layer Medium Blonde', 'Layer', 'Layer pendek sebahu dengan warna medium blonde. Ringan dan mudah ditata.', 'short layered haircut blonde', 'short_layered_color_Medium_blonde'],
    ['Soft Balayage Brown', 'Layer', 'Soft balayage brown tanpa bleach pada rambut panjang bergelombang.', 'soft balayage brown hair', 'soft_balayage_color_brown_no_bleach'],
  ];
  const pinUrl = (q) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const buildGaya = () => {
    const grid = $('#gayaGrid');
    const filters = $('#gayaFilters');
    const tray = $('#gayaTray');
    if (!grid || !filters || !tray) return;
    const count = (g) => (g === 'Semua' ? GAYA.length : GAYA.filter((s) => s[1] === g).length);
    filters.innerHTML = ['Semua', ...GAYA_GROUPS].map((g, i) => `<button type="button" class="svc-chip${i ? '' : ' is-active'}" data-group="${g}" aria-pressed="${i ? 'false' : 'true'}">${g}<small>${count(g)}</small></button>`).join('');
    // Foto yang sudah tampil di Galeri Karya tidak diulang di sini: kartunya memakai teks bayangan + link ke galeri.
    const used = new Set([...document.querySelectorAll('.gallery-card img')].map((i) => (i.getAttribute('src') || '').split('/').pop().replace(/\.jpe?g$/i, '')));
    const media = (s) => (used.has(s[4])
      ? `<div class="gaya-media is-ghost"><span class="gaya-ghost" aria-hidden="true">${esc(s[0]).split(' ').join('<br />')}</span><a class="gaya-ghost-note" href="#galeri">Foto ada di Galeri Karya <span aria-hidden="true">↓</span></a><span class="image-tag">${s[1]}</span></div>`
      : `<div class="gaya-media" data-mono="${mono(s[0])}"><img data-photo src="assets/foto/gaya/${s[4]}.jpeg" alt="Referensi gaya ${esc(s[0])}" loading="lazy" decoding="async" /><span class="image-tag">${s[1]}</span></div>`);
    const list = [...GAYA].sort((x, y) => used.has(x[4]) - used.has(y[4])); // kartu berfoto tampil lebih dulu
    grid.innerHTML = list.map((s) => `<li class="gaya-card" data-group="${s[1]}" data-name="${esc(s[0])}">
      ${media(s)}
      <div class="gaya-body"><h3>${esc(s[0])}</h3><p>${esc(s[2])}</p>
        <div class="gaya-actions"><button class="gaya-pick" type="button" aria-pressed="false"><i aria-hidden="true"></i><span>Pilih gaya ini</span></button><a class="gaya-ref" href="${pinUrl(s[3])}" target="_blank" rel="noreferrer">Lihat referensi <span aria-hidden="true">↗</span></a></div>
      </div></li>`).join('');

    const label = tray.querySelector('.gaya-tray-label');
    const chips = $('#gayaChips');
    let hintTimer;
    const hint = (msg) => {
      label.classList.add('is-warn');
      label.textContent = msg;
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => { label.classList.remove('is-warn'); render(); }, 2200);
    };
    const render = () => {
      grid.querySelectorAll('.gaya-card').forEach((card) => {
        const on = picked.includes(card.dataset.name);
        card.classList.toggle('is-picked', on);
        const btn = card.querySelector('.gaya-pick');
        btn.setAttribute('aria-pressed', String(on));
        btn.querySelector('span').textContent = on ? 'Terpilih' : 'Pilih gaya ini';
      });
      tray.hidden = picked.length === 0;
      label.innerHTML = `<b id="gayaCount">${picked.length}</b> dari ${GAYA_MAX} gaya dipilih`;
      chips.innerHTML = picked.map((n) => `<button type="button" class="gaya-chip" data-name="${esc(n)}" aria-label="Hapus ${esc(n)}">${esc(n)}<span aria-hidden="true">×</span></button>`).join('');
      refreshBookingLinks();
      document.body.classList.toggle('has-picks', picked.length > 0);
      fabSync();
    };
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.gaya-pick');
      if (!btn) return;
      const name = btn.closest('.gaya-card').dataset.name;
      const i = picked.indexOf(name);
      if (i > -1) picked.splice(i, 1);
      else if (picked.length >= GAYA_MAX) { hint(`Maksimal ${GAYA_MAX} gaya. Lepas salah satu dulu.`); return; }
      else picked.push(name);
      render();
    });
    chips.addEventListener('click', (e) => {
      const c = e.target.closest('.gaya-chip');
      if (!c) return;
      const i = picked.indexOf(c.dataset.name);
      if (i > -1) picked.splice(i, 1);
      render();
    });
    $('#gayaClear')?.addEventListener('click', () => { picked.length = 0; render(); });
    const PAGE = 8;
    let group = 'Semua';
    let limit = PAGE;
    const cards = [...grid.querySelectorAll('.gaya-card')];
    const more = $('#gayaMore');
    const moreWrap = $('#gayaMoreWrap');
    const moreInfo = $('#gayaMoreInfo');
    const apply = () => {
      const match = cards.filter((c) => group === 'Semua' || c.dataset.group === group);
      cards.forEach((c) => { const i = match.indexOf(c); c.hidden = !(i > -1 && i < limit); });
      const shown = Math.min(limit, match.length);
      const left = match.length - shown;
      if (moreWrap) {
        moreWrap.hidden = left <= 0;
        moreInfo.textContent = `Menampilkan ${shown} dari ${match.length} gaya`;
        more.firstChild.textContent = `Tampilkan ${Math.min(PAGE, left)} gaya lagi `;
      }
      return match;
    };
    const reveal = (list) => {
      if (window.gsap && !reduced() && list.length) gsap.fromTo(list, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, stagger: .04, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform' });
      window.ScrollTrigger?.refresh();
    };
    filters.addEventListener('click', (e) => {
      const chip = e.target.closest('.svc-chip');
      if (!chip) return;
      group = chip.dataset.group;
      limit = PAGE;
      filters.querySelectorAll('.svc-chip').forEach((c) => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
      reveal(apply().slice(0, limit));
    });
    more?.addEventListener('click', () => {
      const before = limit;
      limit += PAGE;
      reveal(apply().slice(before, limit));
    });
    apply();
    render();
  };

  /* ---- jam buka: tabel + status buka/tutup (waktu WITA) ---- */
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const wibNow = () => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Makassar', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
  };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fmt = (t) => t.replace(':', '.');
  const buildHours = () => {
    const body = $('#hoursTable tbody');
    const status = $('#hoursStatus');
    if (!body || !status) return;
    const order = [1, 2, 3, 4, 5, 6, 0];
    body.innerHTML = order.map((d) => { const h = CONFIG.hours[d]; return `<tr data-day="${d}"><th scope="row">${DAY_NAMES[d]}</th><td>${h ? `${fmt(h[0])} – ${fmt(h[1])}` : 'Tutup'}</td></tr>`; }).join('');
    const update = () => {
      const { day, minutes } = wibNow();
      body.querySelectorAll('tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
      const today = CONFIG.hours[day];
      const isOpen = !!today && minutes >= toMin(today[0]) && minutes < toMin(today[1]);
      let text;
      if (isOpen) text = `Buka sekarang. Tutup pukul ${fmt(today[1])}.`;
      else {
        let next = null;
        if (today && minutes < toMin(today[0])) next = { d: 0, t: today[0] };
        for (let i = 1; i <= 7 && !next; i++) { const h = CONFIG.hours[(day + i) % 7]; if (h) next = { d: i, t: h[0] }; }
        text = next ? `Tutup sekarang. Buka lagi ${next.d === 0 ? 'hari ini' : next.d === 1 ? 'besok' : DAY_NAMES[(day + next.d) % 7]} pukul ${fmt(next.t)}.` : 'Tutup sekarang.';
      }
      status.classList.toggle('is-open', isOpen);
      status.querySelector('span').textContent = text;
    };
    update();
    setInterval(update, 60000);
  };

  /* ---- alamat, peta, ulasan ---- */
  const fillContact = () => {
    $('[data-address-1]') && ($('[data-address-1]').textContent = CONFIG.address[0]);
    $('[data-address-2]') && ($('[data-address-2]').textContent = CONFIG.address[1] || '');
    const q = encodeURIComponent(CONFIG.mapsQuery);
    document.querySelectorAll('[data-maps-link]').forEach((a) => { a.href = CONFIG.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${q}`; });
    document.querySelectorAll('[data-reviews-link]').forEach((a) => { a.href = CONFIG.reviewsUrl || `https://www.google.com/maps/search/?api=1&query=${q}`; });
  };

  /* ---- tombol WhatsApp melayang ---- */
  const fab = $('#waFab');
  let inGaya = false;
  function fabSync() {
    if (!fab) return;
    const pastHero = window.scrollY > 420;
    fab.classList.toggle('is-shown', pastHero);
    fab.classList.toggle('is-tucked', inGaya && picked.length > 0); // tray gaya sudah punya tombol kirim sendiri
  }
  const setupFab = () => {
    if (!fab) return;
    window.addEventListener('scroll', fabSync, { passive: true });
    const gayaSection = $('#gaya');
    if (gayaSection && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => { inGaya = en.isIntersecting; fabSync(); }, { threshold: .08 }).observe(gayaSection);
    fabSync();
  };

  buildGaya();
  buildHours();
  fillContact();
  setupFab();
  refreshBookingLinks();

  buildServicePage();
  window.__svx = initServiceSlider();
  fixPhotos();
  window.addEventListener('load', fixPhotos);

  /* ============ NAVBAR modern: pil kaca, lampu indikator, progres scroll, menu mobile, sembunyi di dasar halaman (GSAP) ============ */
  const navLinksBox = $('.nav-links');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const navLamp = $('.nav-lamp');
  const navProgress = $('.nav-progress i');
  const navCta = $('.nav-cta');
  const navBars = menuToggle ? [...menuToggle.querySelectorAll('span:not(.sr-only)')] : [];
  const mqMobile = window.matchMedia('(max-width: 900px)');
  let navActive = navLinks[0] || null;
  let navHover = false;
  let navHidden = false;
  let navSync = null;

  // lampu indikator meluncur ke menu yang aktif / yang sedang di-hover
  const moveLamp = (link, instant = false) => {
    if (!link || !navLamp || mqMobile.matches) return;
    navLinks.forEach((l) => l.classList.toggle('is-lit', l === link));
    if (!window.gsap) { navLamp.style.cssText = `opacity:1;transform:translateX(${link.offsetLeft}px);width:${link.offsetWidth}px`; return; }
    gsap.to(navLamp, { x: link.offsetLeft, width: link.offsetWidth, opacity: 1, duration: instant || reduced() ? 0 : .55, ease: 'power3.out', overwrite: 'auto' });
  };
  const setNavActive = (link) => {
    if (!link) return;
    navActive = link;
    navLinks.forEach((l) => {
      const on = l === link;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
    if (!navHover) moveLamp(link);
  };

  // menu mobile: kartu kaca yang terbuka dengan animasi bertahap
  const menuIsOpen = () => Boolean(navWrap?.classList.contains('open'));
  const setMenu = (open, instant = false) => {
    if (!navWrap || !menuToggle || menuIsOpen() === open) return;
    navWrap.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Tutup menu' : 'Buka menu';
    if (!window.gsap) return;
    if (reduced() || instant) { gsap.set([navWrap, ...navBars], { clearProps: 'all' }); return; }
    if (open) {
      gsap.fromTo(navWrap, { autoAlpha: 0, y: -14, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out', overwrite: true });
      gsap.fromTo(navWrap.querySelectorAll('.nav-links a, .nav-cta'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .4, stagger: .05, delay: .08, ease: 'power3.out', overwrite: true });
      gsap.to(navBars[0], { y: 3.5, rotation: 45, duration: .35, ease: 'power3.out' });
      gsap.to(navBars[1], { y: -3.5, rotation: -45, duration: .35, ease: 'power3.out' });
    } else {
      gsap.to(navWrap, { autoAlpha: 0, y: -10, scale: .98, duration: .28, ease: 'power2.in', overwrite: true });
      gsap.to(navBars, { y: 0, rotation: 0, duration: .3, ease: 'power3.out' });
    }
  };

  // scrollspy + progres + sembunyi di dasar halaman (butuh ScrollTrigger; dipanggil dari startMotion)
  const setupNavScroll = (introTl) => {
    const spy = navLinks.map((a) => a.getAttribute('href'));
    let tops = [];
    const calc = () => { tops = spy.map((id) => { const el = id === '#top' ? null : document.querySelector(id); return el ? el.getBoundingClientRect().top + window.scrollY : 0; }); };
    const update = () => {
      if (current !== 'home') return;
      const y = window.scrollY + window.innerHeight * .4;
      let idx = 0;
      tops.forEach((t, i) => { if (i && t > 0 && y >= t) idx = i; });
      setNavActive(navLinks[idx]);
    };
    navSync = () => { calc(); update(); };
    ScrollTrigger.addEventListener('refresh', navSync);
    navSync();
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update });

    if (navProgress) gsap.fromTo(navProgress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    // sampai di dasar halaman: navbar naik dan hilang; muncul lagi saat scroll ke atas
    const hide = (h) => {
      if (h === navHidden) return;
      navHidden = h;
      if (h) setMenu(false, true);
      gsap.to(header, { yPercent: h ? -170 : 0, autoAlpha: h ? 0 : 1, duration: h ? .5 : .65, ease: h ? 'power3.in' : 'power3.out', overwrite: 'auto' });
    };
    ScrollTrigger.create({
      start: () => Math.max(ScrollTrigger.maxScroll(window) - 140, 400),
      end: () => Math.max(ScrollTrigger.maxScroll(window), 401),
      invalidateOnRefresh: true,
      onUpdate: (self) => hide(self.progress > 0),
    });

    // animasi masuk: pil jatuh dari atas, isinya menyusul bergantian
    introTl
      .from('.nav-pill', { y: -90, opacity: 0, scale: .94, duration: .9, ease: 'back.out(1.5)' }, .15)
      .from('.nav-pill .wordmark, .nav-links a, .nav-lamp, .nav-cta, .menu-toggle', { y: -14, opacity: 0, duration: .5, stagger: .05, ease: 'power3.out' }, .45);
  };

  const initNav = () => {
    if (!navLinksBox) return;
    // hover/fokus: lampu menyusul menu yang disentuh, kembali ke menu aktif saat dilepas
    navLinks.forEach((a) => {
      a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; navHover = true; moveLamp(a); });
      a.addEventListener('focus', () => { navHover = true; moveLamp(a); });
    });
    navLinksBox.addEventListener('pointerleave', () => { navHover = false; moveLamp(navActive); });
    navLinksBox.addEventListener('focusout', (e) => { if (!navLinksBox.contains(e.relatedTarget)) { navHover = false; moveLamp(navActive); } });

    // tombol Booking magnetik (hanya perangkat dengan mouse)
    if (navCta && window.gsap && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
      const qx = gsap.quickTo(navCta, 'x', { duration: .4, ease: 'power3.out' });
      const qy = gsap.quickTo(navCta, 'y', { duration: .4, ease: 'power3.out' });
      navCta.addEventListener('pointermove', (e) => {
        const r = navCta.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * .25);
        qy((e.clientY - (r.top + r.height / 2)) * .35);
      });
      navCta.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }

    // menu mobile
    menuToggle?.addEventListener('click', () => setMenu(!menuIsOpen()));
    navWrap?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('pointerdown', (e) => { if (menuIsOpen() && !navWrap.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuIsOpen()) { setMenu(false); menuToggle.focus({ preventScroll: true }); } });
    mqMobile.addEventListener?.('change', () => {
      navWrap?.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      if (window.gsap) gsap.set([navWrap, ...navBars, ...(navWrap ? navWrap.querySelectorAll('.nav-links a, .nav-cta') : [])], { clearProps: 'all' });
      moveLamp(navActive, true);
    });

    // rute: di halaman "Semua Layanan" menu Layanan menyala; kembali ke beranda -> ikuti posisi scroll
    document.addEventListener('afwo:route', (e) => {
      if (e.detail === 'layanan') setNavActive(navLinks.find((a) => a.getAttribute('href') === '#layanan'));
      else if (navSync) navSync(); else setNavActive(navLinks[0]);
    });
    setNavActive(current === 'layanan' ? navLinks.find((a) => a.getAttribute('href') === '#layanan') : navLinks[0]);
    moveLamp(navActive, true);

    // ukuran font bisa berubah setelah dimuat: sejajarkan ulang lampu
    if ('ResizeObserver' in window) new ResizeObserver(() => moveLamp(navActive, true)).observe(navLinksBox);
    document.fonts?.ready.then(() => moveLamp(navActive, true));
  };
  initNav();

  const init = async () => {
    const loadDone = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r, { once: true }));
    await Promise.race([Promise.all([loadDone, document.fonts?.ready ?? Promise.resolve()]), new Promise((r) => setTimeout(r, 7000))]);
    try { startMotion(); } catch (err) { console.error(err); revealFallback(); }
    await boot.finish();
    await exitBoot();
  };

  const startMotion = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pluginSet = [window.SplitText, window.ScrollTrigger, window.Observer, window.Flip, window.DrawSVGPlugin];
    if (reducedMotion || !window.gsap || pluginSet.some((plugin) => !plugin)) {
      revealFallback();
      return;
    }

    const { gsap } = window;
    const [SplitText, ScrollTrigger, Observer, Flip, DrawSVGPlugin] = pluginSet;
    gsap.registerPlugin(SplitText, ScrollTrigger, Observer, Flip, DrawSVGPlugin);

    let lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ paused: true });
      const heroTitle = new SplitText('.hero-title', { type: 'lines,words', linesClass: 'split-line' });
      introTl
        .from(heroTitle.lines, { yPercent: 110, opacity: 0, duration: .65, stagger: .08, ease: 'power3.out' }, 0)
        .from('.hero-eyebrow', { opacity: 0, y: 18, duration: .6, ease: 'power3.out' }, .08)
        .from('.hero-bottomline', { opacity: 0, y: 22, duration: .7, ease: 'power3.out' }, .24)
        .fromTo('.hero-card', { opacity: 0, y: 30, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .7, stagger: .1, ease: 'power3.out', onComplete: function () { gsap.set('.hero-card', { clearProps: 'all' }); document.querySelectorAll('.hero-card').forEach((c) => c.classList.remove('reveal')); } }, .36);
      setupNavScroll(introTl);
      window.__playIntro = () => introTl.play();

      gsap.utils.toArray('.split-title').forEach((heading) => {
        const split = new SplitText(heading, { type: 'lines,words', linesClass: 'split-line' });
        gsap.from(split.lines, {
          yPercent: 105,
          opacity: 0,
          duration: .6,
          stagger: .07,
          ease: 'power3.out',
          scrollTrigger: { trigger: heading, start: 'top 82%', once: true }
        });
      });

      gsap.utils.toArray('.reveal:not(.hero-card)').forEach((item) => {
        gsap.fromTo(item, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .65, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 84%', once: true }, onComplete: () => { gsap.set(item, { clearProps: 'all' }); item.classList.remove('reveal'); } });
      });

      gsap.utils.toArray('.draw-line path').forEach((path) => {
        gsap.from(path, { drawSVG: '0%', duration: .7, ease: 'power2.out', scrollTrigger: { trigger: path, start: 'top 88%', once: true } });
      });

      ScrollTrigger.create({ trigger: '.stats-grid', start: 'top 78%', once: true, onEnter: animateCounts });
      setupServiceFlip();

      // layered parallax on hero gallery + about visual
      const heroDepths = [16, 26, 13, 22];
      gsap.utils.toArray('.hero-card').forEach((card, i) => {
        const img = card.querySelector('img');
        if (!img) return;
        const depth = heroDepths[i % heroDepths.length];
        gsap.fromTo(img, { yPercent: -depth }, {
          yPercent: depth, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .6 }
        });
      });
      const aboutImg = document.querySelector('.about-visual img');
      if (aboutImg) {
        gsap.fromTo(aboutImg, { yPercent: -12 }, {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: .6 }
        });
      }

      // clip-path wipe reveal for feature imagery
      gsap.utils.toArray('.about-visual').forEach((frame) => {
        gsap.fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: frame, start: 'top 85%', once: true }
        });
      });
      setupGalleryCarousel();

      Observer.create({ target: window, type: 'wheel,touch,scroll', onChangeY: ({ deltaY }) => { if (Math.abs(deltaY) > 1) setScrolled(window.scrollY > 24); } });
      Observer.create({ target: '.hero-gallery', type: 'pointer,touch', onPress: () => document.querySelector('.hero-gallery')?.classList.add('is-touching'), onRelease: () => document.querySelector('.hero-gallery')?.classList.remove('is-touching') });
    }, document.body);

    window.addEventListener('pagehide', () => { lenis?.destroy(); ctx.revert(); }, { once: true });
  };

  init();
})();
