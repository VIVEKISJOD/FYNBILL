/* FYNBILL service worker. Cache version: fynbill-p1-v1 (bump this name in every phase) */
const CACHE='fynbill-p1-v1';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  /* Google sign-in, Google Drive and other websites are never cached */
  if(r.method!=='GET'||u.origin!==location.origin)return;
  /* the app page: try the internet first so updates arrive, fall back to the saved copy when offline */
  if(r.mode==='navigate'||u.pathname.endsWith('/index.html')){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res})
      .catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return}
  /* icons and manifest: saved copy first */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
});
