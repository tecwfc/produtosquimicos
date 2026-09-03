const CACHE_NAME = 'ivo-pita-v1';
const ASSETS = [
  'index.html',
  'admin.html',
  'assets/img-pq.png',
  'assets/produtosQ.png',
  'assets/papel_ivo_preto.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// INSTALAÇÃO
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache criado!');
        return cache.addAll(ASSETS);
      })
      .catch(err => console.warn('⚠️ Erro ao cachear:', err))
  );
  self.skipWaiting();
});

// ATIVAÇÃO
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// INTERCEPTAÇÃO
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        // Cache hit - retorna do cache
        if (response) {
          return response;
        }
        
        // Se não estiver em cache, faz fetch e armazena
        return fetch(e.request)
          .then(response => {
            // Verifica se é uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(e.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback para páginas offline
            if (e.request.mode === 'navigate') {
              return caches.match('index.html');
            }
          });
      })
  );
});
