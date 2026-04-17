import { fileURLToPath } from 'node:url';

// 1. Calculate the exact absolute path to your compiled Angular server
const serverUrl = new URL('./dist/education-statistics/server/server.mjs', import.meta.url);
const absoluteFilePath = fileURLToPath(serverUrl);

// 2. SPOOF THE PROCESS ARGUMENT: Trick Angular's internal isMainModule check 
// into believing this file was executed directly from the command line.
process.argv[1] = absoluteFilePath;

// 3. Import the file. The spoofed argument forces Angular's native server to boot automatically.
import(serverUrl.href).catch(err => {
    console.error('Fatal Import Fault:', err);
});