import { fileURLToPath } from 'node:url';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// 1. Base Paths
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const browserUrl = new URL('./dist/education-statistics/browser', import.meta.url);
const browserDir = fileURLToPath(browserUrl);

// 2. Load Angular
import(serverUrl.href).then(module => {
    // Safe extraction of Angular engine for modern versions 17 and 18
    let angularApp = module.reqHandler || module.default;
    if (!angularApp && typeof module.app === 'function') {
        try { angularApp = module.app(); } catch(e) { angularApp = module.app; }
    }

    const port = process.env.PORT || 4000;
    const baseHref = '/demo/education-statistics-explorer';

    // 3. Create Strict Native Server
    const server = http.createServer((req, res) => {
        const url = req.url;
        const lowerUrl = url.toLowerCase();

        // Memory Protection
        if (lowerUrl.includes('.php') || lowerUrl.includes('.xml') || lowerUrl.includes('config') || lowerUrl.includes('.bak')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            return res.end('Forbidden');
        }

        // Root Redirect
        if (url === '/' || url === '') {
            res.writeHead(302, { 'Location': baseHref });
            return res.end();
        }

        // Strict File Routing
        if (url.startsWith(baseHref)) {
            const relativePath = url.substring(baseHref.length) || '/';
            const cleanPath = relativePath.split('?')[0]; 
            
            // If the request is for a static file (contains a dot)
            if (cleanPath.includes('.') && cleanPath !== '/') {
                const physicalPath = path.join(browserDir, cleanPath);
                
                if (fs.existsSync(physicalPath)) {
                    const ext = path.extname(cleanPath).toLowerCase();
                    const mimeTypes = {
                        '.js': 'application/javascript', '.css': 'text/css',
                        '.json': 'application/json', '.ttf': 'font/ttf',
                        '.ico': 'image/x-icon', '.png': 'image/png', '.svg': 'image/svg+xml',
                        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'
                    };
                    res.writeHead(200, { 
                        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                        'Cache-Control': 'public, max-age=31536000'
                    });
                    return fs.createReadStream(physicalPath).pipe(res);
                } else {
                    // Magical fix: If file not found, return 404 and never pass to Angular!
                    // This prevents SSRF errors and complete server crashes.
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    return res.end('File Not Found');
                }
            }
            
            // Pass only page routes (e.g., /overview) to Angular SSR
            req.url = relativePath;
        }

        if (typeof angularApp === 'function') {
            angularApp(req, res);
        } else {
            res.writeHead(500);
            res.end('Angular SSR Engine not mounted correctly.');
        }
    });

    server.listen(port, () => {
        console.log(`Strict Node.js SSR Server active on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});