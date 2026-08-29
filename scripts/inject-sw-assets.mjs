import { readFile, writeFile } from 'node:fs/promises';

const index = await readFile('dist/index.html', 'utf8');
const assets = [...index.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map((match) => match[1]);
if (assets.length < 2) throw new Error('Could not find built JavaScript and CSS assets in dist/index.html.');

const path = 'dist/sw.js';
const worker = await readFile(path, 'utf8');
if (!worker.includes('/*__BUILD_ASSETS__*/')) throw new Error('Service-worker build asset placeholder is missing.');
await writeFile(path, worker.replace('/*__BUILD_ASSETS__*/', assets.map((asset) => JSON.stringify(asset)).join(', ')));
console.log(`Precached ${assets.length} built assets: ${assets.join(', ')}`);
