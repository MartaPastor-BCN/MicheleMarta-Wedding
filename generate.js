// Build per-language static pages from template.html + i18n.js
// Run: node generate.js
const fs = require('fs');

const langs = ['it', 'en', 'es', 'ca'];
const labels = { it: 'IT', en: 'EN', es: 'ES', ca: 'CA' };

const tpl = fs.readFileSync('template.html', 'utf8');
const v = Date.now();

for (const lang of langs) {
  let h = tpl;
  h = h.replace('<html lang="it">', `<html lang="${lang}">`);
  h = h.replace(/src="app\.js"/g, `src="../app.js?v=${v}"`);
  h = h.replace(/src="i18n\.js"/g, `src="../i18n.js?v=${v}"`);
  h = h.replace(/assets\//g, '../assets/');

  const sw = `<div class="lang-switch">\n` +
    langs.map(l => `        <a href="../${l}/" class="${l === lang ? 'active' : ''}">${labels[l]}</a>`).join('\n') +
    `\n      </div>`;
  h = h.replace(/<div class="lang-switch">[\s\S]*?<\/div>/, sw);

  fs.mkdirSync(lang, { recursive: true });
  fs.writeFileSync(`${lang}/index.html`, h);
  console.log('wrote', `${lang}/index.html`);
}

// Root redirect -> Italian (default), preserving any hash
fs.writeFileSync('index.html',
`<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Michele & Marta — 19.09.2026</title>
<link rel="canonical" href="./it/">
<meta http-equiv="refresh" content="0; url=./it/">
<script>location.replace('./it/' + location.hash);</script>
</head>
<body></body>
</html>
`);
console.log('wrote index.html (redirect)');
