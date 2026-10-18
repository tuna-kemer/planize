'use strict';
/* Planize servis çalışanı (Adım 8): uygulamanın internetsiz de açılması için.
   Strateji (karar B2): uygulama dosyaları "önce internet, olmazsa saklanan" (internet 4 sn içinde cevap vermezse saklanan kullanılır);
   yeni sürüm internet varken hemen gelir. Firebase kitaplığı sürümlü ve değişmez olduğundan "önce saklanan" olarak tutulur.
   Firestore/Auth ağ trafiğine (googleapis.com vb.) hiç karışılmaz. Yeni sürümde yalnızca SURUM değiştirilir: eski saklananlar silinir. */
const SURUM = 'planize-2026-10-19-1';
const DOSYALAR = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'fonts/inter-latin.woff2', 'fonts/inter-latin-ext.woff2', 'fonts/material-symbols-planim.woff2'];
const FIREBASE_ADRES = 'https://www.gstatic.com/firebasejs/';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((adlar) => Promise.all(adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a)))).then(() => self.clients.claim()));
});

const zamanli = (istek, ms) => new Promise((coz, red) => {
  const z = setTimeout(() => red(new Error('zaman-asimi')), ms);
  fetch(istek).then((r) => { clearTimeout(z); coz(r); }, (er) => { clearTimeout(z); red(er); });
});

self.addEventListener('fetch', (e) => {
  const istek = e.request;
  if (istek.method !== 'GET') return;
  const ayniKaynak = new URL(istek.url).origin === self.location.origin;
  const firebase = istek.url.startsWith(FIREBASE_ADRES);
  if (!ayniKaynak && !firebase) return;                    // başka her şey (Firestore, Auth...) doğrudan ağa gider

  if (firebase) {                                          // sürümlü kitaplık dosyaları: önce saklanan
    e.respondWith(caches.open(SURUM).then(async (c) => {
      const var_ = await c.match(istek); if (var_) return var_;
      const r = await fetch(istek); if (r.ok) c.put(istek, r.clone());
      return r;
    }));
    return;
  }
  e.respondWith((async () => {                             // uygulama dosyaları: önce internet, olmazsa saklanan
    const c = await caches.open(SURUM);
    try {
      const r = await zamanli(istek, 4000);
      if (r.ok) c.put(istek, r.clone());
      return r;
    } catch (hata) {
      const s = (await c.match(istek, { ignoreSearch: true })) || (istek.mode === 'navigate' ? await c.match('index.html') : null);
      if (s) return s;
      throw hata;
    }
  })());
});
