import { fileURLToPath } from 'node:url';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// 1. Calculate base paths
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const browserUrl = new URL('./dist/education-statistics/browser', import.meta.url);
const browserDir = fileURLToPath(browserUrl);
const absoluteFilePath = fileURLToPath(serverUrl);

// Extract Angular engine
import(serverUrl.href).then(module => {
    let angularApp;
    if (typeof module.reqHandler === 'function') angularApp = module.reqHandler;
    else if (typeof module.app === 'function') angularApp = module.app();
    else if (module.default && typeof module.default === 'function') angularApp = module.default;
    else throw new Error("Could not locate Angular SSR Engine.");

    const port = process.env.PORT || 4000;
    const baseHref = '/demo/education-statistics-explorer';

    // 2. Create a server based on pure Node.js (no Express)
    const server = http.createServer((req, res) => {
        let url = req.url;
        const lowerUrl = url.toLowerCase();

        // Memory protection from WordPress bots
        if (lowerUrl.includes('.php') || lowerUrl.includes('.xml') || lowerUrl.includes('config') || lowerUrl.includes('.bak')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            return res.end('Forbidden');
        }

        // Redirect root path to the subfolder
        if (url === '/' || url === '') {
            res.writeHead(302, { 'Location': baseHref });
            return res.end();
        }

        // 3. Smart routing for static files (Static Asset Router)
        if (url.startsWith(baseHref)) {
            // Extract the actual path after the subfolder (e.g., /chunk.js)
            const relativePath = url.substring(baseHref.length) || '/';
            // Exclude variables (?v=123) from the filename
            const cleanPath = relativePath.split('?')[0]; 
            
            // Determine if the request is for a physical file (.js, .css, .ttf, .ico)
            if (cleanPath.includes('.') && cleanPath !== '/') {
                const physicalPath = path.join(browserDir, cleanPath);
                
                // If the file exists in the browser folder, serve it directly
                if (fs.existsSync(physicalPath)) {
                    // Determine the file type (MIME Types) to prevent text/html error
                    const ext = path.extname(cleanPath).toLowerCase();
                    const mimeTypes = {
                        '.js': 'application/javascript',
                        '.css': 'text/css',
                        '.json': 'application/json',
                        '.ttf': 'font/ttf',
                        '.ico': 'image/x-icon',
                        '.png': 'image/png'
                    };
                    const contentType = mimeTypes[ext] || 'application/octet-stream';

                    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' });
                    const fileStream = fs.createReadStream(physicalPath);
                    return fileStream.pipe(res);
                }
            }
            // If it is not a file (e.g., /overview) or not found, pass the relative path to Angular
            req.url = relativePath;
        }

        // 4. Pass remaining requests to the Angular SSR engine
        angularApp(req, res);
    });

    server.listen(port, () => {
        console.log(`Native Node.js Routing Server active on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});