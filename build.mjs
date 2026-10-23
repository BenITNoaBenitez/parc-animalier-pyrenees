import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Version publiée de la balise : à incrémenter à chaque modification de src/embed/parc-calendrier.js.
// Le fichier versionné ne change jamais une fois publié : les balises copiées restent valides avec leur empreinte.
const VERSION = '1.0.1';
const PAGES = 'https://benitnoabenitez.github.io/parc-animalier-pyrenees/';
const read = name => fs.readFile(new URL(name, import.meta.url), 'utf8');
let fonts = await read('assets/fonts.css');
for (const [i, url] of [...new Set([...fonts.matchAll(/url\((https:[^)]+)\)/g)].map(x => x[1]))].entries()) {
  const data = await fs.readFile(new URL(`assets/font-${i}.ttf`, import.meta.url));
  fonts = fonts.replaceAll(url, `data:font/ttf;base64,${data.toString('base64')}`);
}
const assets = {};
for (const [key, file] of Object.entries({logo:'logo-noir.png', whiteLogo:'logo-blanc.png', bear:'lodge.optimized.jpg', interior:'interieur.optimized.jpg', ours:'ours.optimized.jpg', black:'refuge.webp', grey:'loups.optimized.jpg', panda:'asian.webp', parc:'parc.optimized.jpg', trappeur:'trappeur.optimized.jpg', grange:'grange.optimized.jpg', moulin:'moulin.optimized.jpg'})) {
  const mime = file.endsWith('.png') ? 'png' : file.endsWith('.webp') ? 'webp' : 'jpeg';
  assets[key] = `data:image/${mime};base64,${(await fs.readFile(new URL(`assets/${file}`, import.meta.url))).toString('base64')}`;
}
const widgetConfig = JSON.parse(await read('src/widget-config.json'));
// La balise <parc-calendrier> est publiée seule à la racine (GitHub Pages) et intégrée au HTML autonome.
const embed = (await read('src/embed/parc-calendrier.js')).replace(/\/\*@config\*\/[\s\S]*?\/\*@endconfig\*\//, JSON.stringify(widgetConfig));
if (!embed.includes(widgetConfig._authCode)) throw new Error('Jeton D-EDGE non injecté dans parc-calendrier.js');
await fs.writeFile(new URL('parc-calendrier.js', import.meta.url), embed);
const versioned = `parc-calendrier-${VERSION}.js`, versionedUrl = new URL(versioned, import.meta.url);
const previous = await fs.readFile(versionedUrl, 'utf8').catch(() => null);
if (previous !== null && previous !== embed) throw new Error(`${versioned} est déjà publié avec un autre contenu : incrémentez VERSION dans build.mjs`);
await fs.writeFile(versionedUrl, embed);
const sri = 'sha384-' + createHash('sha384').update(embed).digest('base64');
const scriptTag = `<script src="${PAGES}${versioned}" integrity="${sri}" crossorigin="anonymous" defer></script>`;
const embedConstants = `const EMBED_SCRIPT_TAG=${JSON.stringify(scriptTag)};\n`;
const readmePath = new URL('README.md', import.meta.url), readme = await fs.readFile(readmePath, 'utf8');
await fs.writeFile(readmePath, readme.replace(/(<!-- install:start -->)[\s\S]*?(<!-- install:end -->)/, `$1\n\`\`\`html\n${scriptTag}\n\n<parc-calendrier logement="taniere"></parc-calendrier>\n\`\`\`\n$2`));
const legacyCss=(await Promise.all(['dedge.css','styles.css','alternatives.css','calendar-interiors.css','calendar-scenes.css'].map(file=>read('src/legacy/'+file)))).join('\n');
const css = fonts + legacyCss + await read('src/diagram.css') + await read('src/calendar.css') + await read('src/in-card.css') + await read('src/embed-section.css');
const js = `const ASSETS=${JSON.stringify(assets)};const CONFIG=${JSON.stringify(widgetConfig)};\n` + embedConstants + await read('src/diagram.js') + await read('src/legacy/calendar-scenes.js') + await read('src/legacy/calendar.js') + await read('src/calendar-core.js') + await read('src/calendar.js') + embed + '\n' + await read('src/embed-section.js');
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Nuits au parc · calendriers de réservation</title><style>${css}</style></head><body><main>${await read('src/diagram.html')}${await read('src/legacy/calendar.html')}${await read('src/calendar.html')}${await read('src/embed-section.html')}</main><script class="fb-widget-config" data-fbConfig="0" type="application/json">${await read('src/legacy/widget-config.json')}</script><script>${js.replaceAll('</script', '<\\/script')}</script></body></html>`;
await fs.writeFile(new URL('index.html', import.meta.url), html);
// Galerie autonome : les sept calendriers, trois designs, clair ou sombre, avec la balise à copier.
const galleryAssets = Object.fromEntries(['logo', 'parc', 'interior', 'black', 'trappeur', 'panda', 'grange', 'moulin'].map(key => [key, assets[key]]));
const galleryJs = `const ASSETS=${JSON.stringify(galleryAssets)};\n` + embedConstants + embed + '\n' + await read('src/gallery.js');
const gallery = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Calendriers de réservation</title><style>${fonts}${await read('src/gallery.css')}</style></head><body>${await read('src/gallery.html')}<script>${galleryJs.replaceAll('</script', '<\\/script')}</script></body></html>`;
await fs.writeFile(new URL('calendriers.html', import.meta.url), gallery);
console.log(`index.html autonome : ${Buffer.byteLength(html)} octets · calendriers.html : ${Buffer.byteLength(gallery)} octets · ${versioned} : ${Buffer.byteLength(embed)} octets · ${sri}`);
