// sw.js — service worker cho PWA "Kế toán HN".
// v23 (29/07/2026): tab 9 doc/ghi Sheet theo TEN TIEU DE cot (sua loi lech cot). Bump cache.
// v22 (29/07/2026): them nut Soat ten cua hang o tab 8. Bump cache de may cu xoa ban cu.
// v21 (29/07/2026): them nut Dien ma MISA con thieu o tab 9. Bump cache de may cu xoa ban cu.
// v20 (29/07/2026): them tab 8 (Ma KH & Gia) + tab 9 (Ma san pham). Bump cache de may cu xoa ban cu.
// v19 (20/07/2026): index.html chuyen sang NETWORK-FIRST de cac may tu nhan ban moi khi anh Toan cap nhat
// (GitHub Pages khong dung duoc file _headers chong cache nhu Cloudflare). File tinh khac giu cache-first.
var CACHE = 'ketoan-hn-v23';
var SHELL = ['./index.html', './manifest.webmanifest'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  var url = req.url;
  // Khong can thiep request toi Apps Script (du lieu dong — luon lay moi)
  if (url.indexOf('script.google.com') >= 0) return;

  // index.html / trang goc: NETWORK-FIRST — lay ban moi tu mang, luu lai cache; offline thi dung cache.
  var isDoc = req.mode === 'navigate' || url.indexOf('index.html') >= 0;
  if (isDoc) {
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match(req); });
      })
    );
    return;
  }

  // File tinh khac (icon, manifest): CACHE-FIRST.
  e.respondWith(
    caches.match(req).then(function(r){ return r || fetch(req); }).catch(function(){ return caches.match('./index.html'); })
  );
});
