import { fileURLToPath } from 'node:url';
import http from 'node:http';

// 1. Path Calculation & Process Spoofing
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const absoluteFilePath = fileURLToPath(serverUrl);
process.argv[1] = absoluteFilePath;

// 2. Initialize Angular Application
import(serverUrl.href).then(module => {
    const angularApp = module.app();
    const port = process.env.PORT || 4000;

    // 3. Construct Pre-Filter & Routing Server
    const server = http.createServer((req, res) => {
        let url = req.url;
        const lowerUrl = url.toLowerCase();
        
        // Anti-Bot Filter: Drop malicious requests to save RAM
        if (lowerUrl.includes('.php') || lowerUrl.includes('.xml') || lowerUrl.includes('config') || lowerUrl.includes('.bak')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            return res.end('Forbidden Request');
        }
        
        // ---------------------------------------------------------
        // STATIC ASSET ROUTING FIX (MIME Type Error Fix)
        // ---------------------------------------------------------
        const baseHref = '/demo/education-statistics-explorer';
        
        if (url.startsWith(baseHref)) {
            // Strip the base-href from the URL
            const strippedUrl = url.substring(baseHref.length) || '/';
            
            // Check if the request is for a physical file (e.g., contains a '.')
            const pathWithoutQuery = strippedUrl.split('?')[0];
            if (pathWithoutQuery.includes('.')) {
                // It's a static file (.js, .css, .json). Pass the stripped URL to Angular
                // so express.static can find it in the root of the 'browser' folder.
                req.url = strippedUrl; 
            }
            // If it does NOT contain a dot, it's a normal page route (like /overview).
            // We leave req.url untouched so the Angular Router knows where we are.
        }

        // Pass the request to the Angular SSR engine
        angularApp(req, res);
    });

    server.listen(port, () => {
        console.log(`Secured SSR running natively on Passenger port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});