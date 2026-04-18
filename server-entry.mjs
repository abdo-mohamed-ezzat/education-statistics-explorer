// import { fileURLToPath } from 'node:url';
// import http from 'node:http';



// // 1. Path Calculation & Process Spoofing
// const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
// const absoluteFilePath = fileURLToPath(serverUrl);
// process.argv[1] = absoluteFilePath;

// // 2. Initialize Angular Application
// import(serverUrl.href).then(module => {
//     const angularApp = module.app();
//     const port = process.env.PORT || 4000;

//     // 3. Construct Pre-Filter & Routing Server
//     const server = http.createServer((req, res) => {
//         let url = req.url;
//         const lowerUrl = url.toLowerCase();
        
//         // Anti-Bot Filter: Drop malicious requests to save RAM
//         if (lowerUrl.includes('.php') || lowerUrl.includes('.xml') || lowerUrl.includes('config') || lowerUrl.includes('.bak')) {
//             res.writeHead(403, { 'Content-Type': 'text/plain' });
//             return res.end('Forbidden Request');
//         }
        
//         // ---------------------------------------------------------
//         // STATIC ASSET ROUTING FIX (MIME Type Error Fix)
//         // ---------------------------------------------------------
//        // Passenger in cPanel usually injects specific environment variables.
//         // If missing, we assume it's your local machine.
//         const isCpanel = !!process.env.PASSENGER_APP_ENV || !!process.env.USER; 
//         const baseHref = isCpanel ? '/demo/education-statistics-explorer' : '/';
        
//         if (url.startsWith(baseHref)) {
//             // Strip the base-href from the URL
//             const strippedUrl = url.substring(baseHref.length) || '/';
            
//             // Check if the request is for a physical file (e.g., contains a '.')
//             const pathWithoutQuery = strippedUrl.split('?')[0];
//             if (pathWithoutQuery.includes('.')) {
//                 // It's a static file (.js, .css, .json). Pass the stripped URL to Angular
//                 // so express.static can find it in the root of the 'browser' folder.
//                 req.url = strippedUrl; 
//             }
//             // If it does NOT contain a dot, it's a normal page route (like /overview).
//             // We leave req.url untouched so the Angular Router knows where we are.
//         }

//         // Pass the request to the Angular SSR engine
//         angularApp(req, res);
//     });

//     server.listen(port, () => {
//         console.log(`Secured SSR running natively on Passenger port ${port}`);
//     });
// }).catch(err => {
//     console.error('Fatal Import Fault:', err);
// });
// --
import { fileURLToPath } from 'node:url';
import express from 'express';

// 1. Path Calculation & Process Spoofing
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const absoluteFilePath = fileURLToPath(serverUrl);
process.argv[1] = absoluteFilePath;

// Calculate absolute path to the browser static files
const browserUrl = new URL('./dist/education-statistics/browser', import.meta.url);
const browserDir = fileURLToPath(browserUrl);

// 2. Initialize Angular Application
import(serverUrl.href).then(module => {
    const angularApp = module.app();
    const port = process.env.PORT || 4000;
    const baseHref = '/demo/education-statistics-explorer';

    // 3. Construct Intelligent Wrapper
    const wrapper = express();

    // Anti-bot memory protection
    wrapper.use((req, res, next) => {
        const url = req.url.toLowerCase();
        if (url.includes('.php') || url.includes('.xml') || url.includes('config') || url.includes('.bak')) {
            return res.status(403).send('Forbidden Request');
        }
        next();
    });

    // ---------------------------------------------------------
    // THE FIX: Explicitly serve static assets BEFORE hitting Angular
    // ---------------------------------------------------------
    wrapper.use(baseHref, express.static(browserDir, {
        maxAge: '1y',
        index: false // Force Angular SSR to handle the root index route
    }));

    // Pass remaining application routes to the Angular SSR engine
    wrapper.use(baseHref, angularApp);

    // Safety fallback: Redirect root requests to the subfolder
    wrapper.get('/', (req, res) => res.redirect(baseHref));

    wrapper.listen(port, () => {
        console.log(`Secured SSR routing flawlessly on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});