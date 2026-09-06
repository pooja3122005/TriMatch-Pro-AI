import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function htmlFallbackPlugin() {
  return {
    name: 'html-fallback-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;
          if (pathname.endsWith('.html') && pathname !== '/index.html') {
            const pageName = pathname.replace(/^\//, '').replace(/\.html$/, '');
            urlObj.searchParams.set('page', pageName);
            urlObj.pathname = '/';
            res.writeHead(302, { Location: urlObj.pathname + '?' + urlObj.searchParams.toString() });
            res.end();
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  // Serve the React SPA — index.html → src/main.jsx → App.jsx → pages
  plugins: [react(), htmlFallbackPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/trials': 'http://127.0.0.1:8000',
      '/patients': 'http://127.0.0.1:8000',
      '/parse-criteria': 'http://127.0.0.1:8000',
      '/match': 'http://127.0.0.1:8000',
      '/lab-results': 'http://127.0.0.1:8000',
      '/audit-log': 'http://127.0.0.1:8000',
      '/flagged-for-review': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
      '/enrollment': 'http://127.0.0.1:8000',
      '/consent': 'http://127.0.0.1:8000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
