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

    const wrapper = express();

    // 3. Anti-Bot Memory Protection
    wrapper.use((req, res, next) => {
        const url = req.url.toLowerCase();
        if (url.includes('.php') || url.includes('.xml') || url.includes('config') || url.includes('.bak')) {
            return res.status(403).send('Forbidden Request');
        }
        next();
    });

    // ---------------------------------------------------------
    // THE FIX: Passenger strips the subfolder automatically.
    // We must mount static files and the Angular app at the internal root '/'.
    // ---------------------------------------------------------
    
    // Serve static files (JS, CSS, Fonts) directly from the browser directory
    wrapper.use('/', express.static(browserDir, {
        maxAge: '1y',
        index: false // Prevent serving index.html here so SSR can handle it
    }));

    // Pass all other routes to the Angular SSR engine
    wrapper.use('/', angularApp);

    wrapper.listen(port, () => {
        console.log(`Secured SSR routing running via Passenger on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});