// Assemble outputs/*.html from shared partials + per-page bodies.
// Usage: node site/build.mjs [outDir]   (default outDir = outputs)
import fs from 'fs';

const outDir = process.argv[2] || 'outputs';
const cfg = JSON.parse(fs.readFileSync('site/pages.json', 'utf8'));
const prefixTpl = fs.readFileSync('site/partials/prefix.html', 'utf8');
const navTpl = fs.readFileSync('site/partials/nav.html', 'utf8');
const footerTpl = fs.readFileSync('site/partials/footer.html', 'utf8');

const buildNav = active => active
  ? navTpl.replace(`<a href="${active}">`, () => `<a href="${active}" class="active">`)
  : navTpl;

fs.mkdirSync(outDir, { recursive: true });
let n = 0;
for (const [file, c] of Object.entries(cfg)) {
  const body = fs.readFileSync(`site/pages/${file.replace('.html', '')}.body.html`, 'utf8');
  const prefix = prefixTpl
    .replace('{{TITLE}}', () => c.title)
    .replace('{{DESCRIPTION}}', () => c.description);
  fs.writeFileSync(`${outDir}/${file}`, prefix + buildNav(c.active) + body + footerTpl);
  n++;
}
console.log('built', n, 'pages ->', outDir);
