import { fileURLToPath } from 'node:url';
import express from 'express';

// 1. Path Calculation (NO SPOOFING)
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const browserUrl = new URL('./dist/education-statistics/browser', import.meta.url);
const browserDir = fileURLToPath(browserUrl);

// 2. Initialize Angular Application
import(serverUrl.href).then(module => {
    let angularApp;
    if (typeof module.reqHandler === 'function') {
        angularApp = module.reqHandler;
    } else if (typeof module.app === 'function') {
        angularApp = module.app();
    } else if (module.default && typeof module.default === 'function') {
        angularApp = module.default;
    } else {
        throw new Error("Critical: Could not locate Angular SSR Engine export (reqHandler/app/default).");
    }

    const port = process.env.PORT || 4000;
    const wrapper = express();

    // 4. Anti-Bot Memory Protection
    wrapper.use((req, res, next) => {
        const url = req.url.toLowerCase();
        if (url.includes('.php') || url.includes('.xml') || url.includes('config') || url.includes('.bak')) {
            return res.status(403).send('Forbidden Request');
        }
        next();
    });

    // ---------------------------------------------------------
    // THE FIX: Static Asset Routing
    // ---------------------------------------------------------
    wrapper.use('/', express.static(browserDir, {
        maxAge: '1y',
        index: false 
    }));

    // 5. Mount Angular SSR Engine
    wrapper.use('/', angularApp);

    wrapper.listen(port, () => {
        console.log(`Secured SSR routing running natively via Passenger on port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});