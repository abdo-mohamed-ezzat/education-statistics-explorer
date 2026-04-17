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

    // 3. Construct Pre-Filter Server
    const server = http.createServer((req, res) => {
        const url = req.url.toLowerCase();
        
        // Immediately drop common bot traffic to preserve RAM
        if (url.includes('.php') || url.includes('.xml') || url.includes('config') || url.includes('.bak')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            return res.end('Forbidden Request');
        }
        
        // Pass valid web traffic to the Angular SSR engine
        angularApp(req, res);
    });

    server.listen(port, () => {
        console.log(`Secured SSR running natively on Passenger port ${port}`);
    });
}).catch(err => {
    console.error('Fatal Import Fault:', err);
});