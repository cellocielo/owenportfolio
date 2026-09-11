import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function serveRootMedia(): Plugin {
  return {
    name: 'serve-root-media',
    configureServer(server) {
      // Direct media upload endpoint so user can upload directly from the UI
      server.middlewares.use('/api/upload-media', (req, res) => {
        if (req.method === 'POST') {
          const urlObj = new URL(req.url || '', 'http://localhost:3000');
          const rawFilename = urlObj.searchParams.get('filename') || (req.headers['x-filename'] as string);
          if (!rawFilename) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing filename parameter' }));
            return;
          }
          const cleanName = path.basename(decodeURIComponent(rawFilename));
          const publicDir = path.join(process.cwd(), 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          const publicFilePath = path.join(publicDir, cleanName);
          const rootFilePath = path.join(process.cwd(), cleanName);

          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            fs.writeFileSync(publicFilePath, buffer);
            fs.writeFileSync(rootFilePath, buffer);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, filename: cleanName, path: `/${cleanName}` }));
          });
          return;
        }
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });

      // Serve static media files from root or public
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.method === 'GET' || req.method === 'HEAD')) {
          const pathname = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
          const rootFilePath = path.join(process.cwd(), pathname);
          const publicFilePath = path.join(process.cwd(), 'public', pathname);

          const targetFile = fs.existsSync(rootFilePath) && fs.statSync(rootFilePath).isFile()
            ? rootFilePath
            : fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()
            ? publicFilePath
            : null;

          if (targetFile && pathname && !pathname.includes('..')) {
            try {
              const stat = fs.statSync(targetFile);
              if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp|svg|heic|mp4|mov|webm)$/i.test(pathname)) {
                // Ensure synced to public/
                if (!fs.existsSync(publicFilePath)) {
                  fs.copyFileSync(targetFile, publicFilePath);
                }
                const ext = path.extname(pathname).toLowerCase();
                const mimeMap: Record<string, string> = {
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.png': 'image/png',
                  '.gif': 'image/gif',
                  '.webp': 'image/webp',
                  '.svg': 'image/svg+xml',
                  '.heic': 'image/heic',
                  '.mp4': 'video/mp4',
                  '.mov': 'video/quicktime',
                  '.webm': 'video/webm',
                };
                res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
                res.setHeader('Content-Length', stat.size);
                fs.createReadStream(targetFile).pipe(res);
                return;
              }
            } catch {
              // fallback to next middleware
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveRootMedia()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
