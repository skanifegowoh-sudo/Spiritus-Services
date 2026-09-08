const VERSION='spiritus-app-shell-20260908-1';
const CACHE=VERSION;
const CORE=[
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/app.css',
  '/app/app.js',
  '/assets/app-icon-192.png',
  '/assets/app-icon-512.png',
  '/assets/app-icon-maskable-512.png'
];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async u=>{
      try{
        const r=await fetch(u,{cache:'reload'});
        if(r.ok) await c.put(u,r);
      }catch(_){}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('spiritus-app-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  // Only cache the /app shell itself. Root website pages stay network-live.
  if(!url.pathname.startsWith('/app/') && !url.pathname.startsWith('/assets/app-icon-')) return;

  e.respondWith((async()=>{
    try{
      const fresh=await fetch(req);
      if(fresh.ok){
        const c=await caches.open(CACHE);
        c.put(req,fresh.clone());
      }
      return fresh;
    }catch(_){
      return await caches.match(req) || new Response('Spiritus is offline.',{status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});
