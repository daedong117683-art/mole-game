const CACHE='mole-v7';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==location.origin)return; // Firebase 등 외부 요청은 건드리지 않아요
  const put=res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res};
  if(e.request.mode==='navigate'){
    // 게임 화면은 인터넷이 되면 항상 최신으로, 안 되면 저장본으로
    e.respondWith(fetch(e.request).then(put).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(put)));
});
