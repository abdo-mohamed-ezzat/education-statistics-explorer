import { fileURLToPath } from 'node:url';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// 1. Calculate base paths
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const browserUrl = new URL('./dist/education-statistics/browser', import.meta.url);
const browserDir = fileURLToPath(browserUrl);

// Extract Angular engine
import(serverUrl.href).then(module => {
    // Smartly extract server function compatible with Angular 17 and 18
    let angularApp = module.reqHandler || module.default;
    if (!angularApp && typeof module.app === 'function') {
        try { angularApp = module.app(); } catch(e) { angularApp = module.app; }
    }
    
    if (typeof angularApp !== 'function') {
        console.error("Available Exports:", Object.keys(module));
        throw new Error("Critical: Could not locate Angular SSR Engine export.");
    }

    const port = process.env.PORT || 4000;
    const baseHref = '/demo/education-statistics-explorer';

    // 2. Create the server
    const server = http.createServer((req, res) => {
        const url = req.url;
        const lowerUrl = url.toLowerCase();

        // Memory protection from exploit bots
        if (lowerUrl.includes('.php') || lowerUrl.includes('.xml') || lowerUrl.includes('config') || lowerUrl.includes('.bak')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            return res.end('Forbidden');
        }

        // Smart routing for static files (Static Asset Router)
        if (url.startsWith(baseHref)) {
            const relativePath = url.substring(baseHref.length) || '/';
            const cleanPath = relativePath.split('?')[0]; 
            
            // If the request is for a physical file (JS, CSS, Font, Image)
            if (cleanPath.includes('.') && cleanPath !== '/') {
                const physicalPath = path.join(browserDir, cleanPath);
                
                if (fs.existsSync(physicalPath)) {
                    const ext = path.extname(cleanPath).toLowerCase();
                    const mimeTypes = {
                        '.js': 'application/javascript',
                        '.css': 'text/css',
                        '.json': 'application/json',
                        '.ttf': 'font/ttf',
                        '.ico': 'image/x-icon',
                        '.png': 'image/png',
                        '.svg': 'image/svg+xml'
                    };
                    
                    res.writeHead(200, { 
                        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                        'Cache-Control': 'public, max-age=31536000'
                    });
                    return fs.createReadStream(physicalPath).pipe(res);
                }
            }
        }

        // Pass all remaining pages (e.g., /overview) to the Angular engine.
        // Angular will read the full URL and handle routing correctly.
        angularApp(req, res);
    });

    server.listen(port, () => {
        console.log(`Native Node.js SSR Server active on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});