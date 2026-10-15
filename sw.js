/* Медкарты — service worker (офлайн + установка) */
const C="medcards-v3";
const SHELL=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL).catch(()=>{})));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting();});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const url=new URL(r.url);
  // навигации: сеть вперёд (чтобы ловить обновления), офлайн -> кеш index
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put("./index.html",cp));return res;}).catch(()=>caches.match("./index.html").then(m=>m||caches.match("./"))));
    return;
  }
  // остальное (шрифты и т.п.): кеш вперёд, затем сеть
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res&&res.status===200&&url.protocol.startsWith("http")){const cp=res.clone();caches.open(C).then(ca=>ca.put(r,cp));}return res;}).catch(()=>c)));
});
