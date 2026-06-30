# Site build (de-duplicated source)

The pages in `outputs/` are **generated**. Don't hand-edit them — edit the source
here and rebuild.

The site is now a **single scrolling page** (`index.html`) with a sticky anchor
menu, plus two small standalone pages (`privacy.html`, `terms.html`).

## Source layout
```
site/
  partials/
    prefix.html   <head> + <body> open  (tokens: {{TITLE}}, {{DESCRIPTION}})
    nav.html      the sticky anchor menu — defined ONCE for the whole site
    footer.html   the <footer> + closing tags — defined ONCE
  pages/
    index.body.html    the whole one-page site: all <section id="…"> blocks
                       (about, journey, schedule, register, donate, contact)
    privacy.body.html  standalone privacy page content
    terms.body.html    standalone terms page content
  pages.json      per-page title + description
  build.mjs       assembles partials + bodies -> outputs/*.html
  decompose.mjs   one-time splitter (already run; kept for reference)
```

## To change something
- **Menu / header / footer:** edit `partials/nav.html`, `partials/prefix.html`,
  or `partials/footer.html`. The menu items are anchor links (`index.html#about`).
- **A section's content / order:** edit `pages/index.body.html`. Each section is a
  `<section id="…">`; the menu links point at those ids. Reorder by moving the
  `<section>` blocks.
- **Privacy / Terms:** edit `pages/privacy.body.html` / `pages/terms.body.html`.
- **A page's title/description:** edit `pages.json`.
- **Shared styles:** edit `outputs/css/styles.css` (single stylesheet).

## Then rebuild
```
node site/build.mjs
```
This regenerates all of `outputs/*.html`. Commit both `site/` and `outputs/`.
GitHub Pages serves `outputs/`, so the built files must be committed.
