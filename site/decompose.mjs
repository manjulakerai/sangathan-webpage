// One-time: split outputs/*.html into shared partials + per-page bodies.
import fs from 'fs';

const OUT = 'outputs';
const pages = fs.readdirSync(OUT).filter(f => f.endsWith('.html'));

const NAV_TAG = '  <nav class="nav"';
const NAV_END = '</nav>\n';
const FOOTER_TAG = '  <footer class="footer"';

const tokenizePrefix = p => p
  .replace(/<title>[\s\S]*?<\/title>/, '<title>{{TITLE}}</title>')
  .replace(/<meta name="description" content="[\s\S]*?">/, '<meta name="description" content="{{DESCRIPTION}}">');
const stripActive = nav => nav.replace(' class="active"', '');

let prefixTpl = null, navTpl = null, footerTpl = null;
const cfg = {};

for (const f of pages) {
  const s = fs.readFileSync(`${OUT}/${f}`, 'utf8');
  const navStart = s.indexOf(NAV_TAG);
  const navEnd = s.indexOf(NAV_END, navStart) + NAV_END.length;
  const footTag = s.indexOf(FOOTER_TAG);
  if (navStart < 0 || footTag < 0) { console.log('!! markers missing in', f); continue; }

  // Normalise away the optional <!-- Navigation --> / <!-- Footer --> comments
  const prefix = s.slice(0, navStart).replace(/  <!-- Navigation -->\n$/, '');
  const nav = s.slice(navStart, navEnd);
  const body = s.slice(navEnd, footTag).replace(/  <!-- Footer -->\n$/, '');
  const footer = s.slice(footTag);

  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const description = (s.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1];
  const active = (nav.match(/<a href="([^"]+)" class="active">/) || [, ''])[1];

  const pTpl = tokenizePrefix(prefix), nTpl = stripActive(nav);
  if (prefixTpl === null) { prefixTpl = pTpl; navTpl = nTpl; footerTpl = footer; }
  else {
    if (pTpl !== prefixTpl) console.log('PREFIX DIFF in', f);
    if (nTpl !== navTpl) console.log('NAV DIFF in', f);
    if (footer !== footerTpl) console.log('FOOTER DIFF in', f);
  }

  cfg[f] = { title, description, active };
  fs.writeFileSync(`site/pages/${f.replace('.html', '')}.body.html`, body);
}

fs.mkdirSync('site/partials', { recursive: true });
fs.writeFileSync('site/partials/prefix.html', prefixTpl);
fs.writeFileSync('site/partials/nav.html', navTpl);
fs.writeFileSync('site/partials/footer.html', footerTpl);
fs.writeFileSync('site/pages.json', JSON.stringify(cfg, null, 2));
console.log('decomposed', pages.length, 'pages OK');
