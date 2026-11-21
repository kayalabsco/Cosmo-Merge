const C='cosmo-merge-v2',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const cache=await caches.open(C);
    const net=fetch(e.request).then(r=>{if(r.ok&&r.status===200&&r.type==='basic')cache.put(e.request,r.clone());return r});
    const hit=await cache.match(e.request);
    if(!hit)return net.catch(()=>e.request.mode==='navigate'?cache.match('index.html'):Response.error());
    // önbellek varsa: ağ 3 sn içinde cevap vermezse önbellekten aç
    return Promise.race([net,new Promise(res=>setTimeout(()=>res(hit),3000))]).catch(()=>hit);
  })());
});
