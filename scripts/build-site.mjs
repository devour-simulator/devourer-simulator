import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await mkdir('dist/static', { recursive: true });
await copyFile('index.html', 'dist/static/index.html');
await copyFile('game.js', 'dist/static/game.js');
const [indexHtml, gameScript, workerSource] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('game.js', 'utf8'),
    readFile('server/index.js', 'utf8')
]);
const embeddedAssets = `const __STATIC_INDEX_HTML__ = ${JSON.stringify(indexHtml)};\nconst __STATIC_GAME_JS__ = ${JSON.stringify(gameScript)};\n`;
await writeFile('dist/server/index.js', embeddedAssets + workerSource);
