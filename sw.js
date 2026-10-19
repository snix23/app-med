const CACHE='medapp-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  // картинки — из кеша, если нет, тянем и кешируем (грузятся один раз)
  if(u.pathname.includes('/img/')||/\.(jpg|jpeg|png|webp|svg)$/i.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(resp=>{try{c.put(e.request,resp.clone());}catch(_){}return resp;}))));
    return;
  }
  // остальное (код, манифест) — сначала сеть (чтобы обновления приходили), офлайн из кеша
  e.respondWith(fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>{try{c.put(e.request,cp);}catch(_){}});return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
