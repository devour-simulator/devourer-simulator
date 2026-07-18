import { mkdir, copyFile, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await mkdir('dist/static', { recursive: true });
await copyFile('index.html', 'dist/static/index.html');
await copyFile('game.js', 'dist/static/game.js');

await writeFile('dist/server/index.js', `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  }
};\n`);
