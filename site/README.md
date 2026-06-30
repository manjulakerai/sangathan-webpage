# Site build (de-duplicated source)

The pages in `outputs/` are **generated**. Don't hand-edit them — edit the source
here and rebuild.

## Source layout
```
site/
  partials/
    prefix.html   <head> + <body> open  (tokens: {{TITLE}}, {{DESCRIPTION}})
    nav.html      the <nav> menu — defined ONCE for the whole site
    footer.html   the <footer> + closing tags — defined ONCE
  pages/
    <name>.body.html   the unique main content of each page (between nav & footer)
  pages.json      per-page title, description, and active nav key
  build.mjs       assembles partials + bodies -> outputs/*.html
  decompose.mjs   one-time splitter (already run; kept for reference)
```

## To change something
- **Menu / header / footer (all pages at once):** edit `partials/nav.html`,
  `partials/prefix.html`, or `partials/footer.html`.
- **A page's content:** edit `pages/<name>.body.html`.
- **A page's title/description or active menu item:** edit `pages.json`.
- **Shared styles:** edit `outputs/css/styles.css` (single stylesheet).

## Then rebuild
```
node site/build.mjs
```
This regenerates all of `outputs/*.html`. Commit both `site/` and `outputs/`.
GitHub Pages serves `outputs/`, so the built files must be committed.
