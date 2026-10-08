import fs from 'node:fs/promises';
const read = name => fs.readFile(new URL(name, import.meta.url), 'utf8');
let fonts = await read('assets/fonts.css');
for (const [i, url] of [...new Set([...fonts.matchAll(/url\((https:[^)]+)\)/g)].map(x => x[1]))].entries()) {
  const data = await fs.readFile(new URL(`assets/font-${i}.ttf`, import.meta.url));
  fonts = fonts.replaceAll(url, `data:font/ttf;base64,${data.toString('base64')}`);
}
const assets = {};
for (const [key, file] of Object.entries({logo:'logo-noir.png', whiteLogo:'logo-blanc.png', bear:'interieur.optimized.jpg', black:'refuge.webp', grey:'loups.optimized.jpg', panda:'asian.webp'})) {
  const mime = file.endsWith('.png') ? 'png' : file.endsWith('.webp') ? 'webp' : 'jpeg';
  assets[key] = `data:image/${mime};base64,${(await fs.readFile(new URL(`assets/${file}`, import.meta.url))).toString('base64')}`;
}
const css = fonts + await read('src/diagram.css') + await read('src/calendar.css');
const js = `const ASSETS=${JSON.stringify(assets)};const CONFIG=${await read('src/widget-config.json')};\n` + await read('src/diagram.js') + await read('src/calendar-core.js') + await read('src/calendar.js');
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Nuits au parc · calendrier des 4 logements</title><style>${css}</style></head><body><main>${await read('src/diagram.html')}${await read('src/calendar.html')}</main><script>${js.replaceAll('</script', '<\\/script')}</script></body></html>`;
await fs.writeFile(new URL('index.html', import.meta.url), html);
console.log(`index.html autonome : ${Buffer.byteLength(html)} octets`);
