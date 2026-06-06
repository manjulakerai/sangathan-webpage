# Sangathan Parva → sydneytemple.org Integration Plan

Tracks the work of publishing this landing page as a new `/sangathan` route on
the existing Temple website (sydneytemple.org).

---

## Goal

Mount this multi-page site as a sub-route of the existing Express + EJS app
at **`https://sydneytemple.org/sangathan`** without disturbing the rest of the
parent site.

## Target stack (confirmed)

- **Server:** Node.js + Express (confirmed via `X-Powered-By: Express` header
  on sydneytemple.org)
- **Templating:** EJS (confirmed with user)
- **Static assets:** Apache fronting Express; current site references
  `/stylesheets/`, `/images/`, etc.
- **Session middleware:** `connect.sid` cookie observed (express-session)

## Decisions made

- URL prefix is **lowercase** `/sangathan` (user chose 2026-06-06).
- Clean URLs (no `.html` extension): `/sangathan`, `/sangathan/journey`, …
- Layout pattern: **plain EJS includes** (head + nav + footer partials) — no
  `express-ejs-layouts` dependency, works in any vanilla `res.render` setup.
- Static assets namespaced under `/sangathan/` to avoid colliding with the
  parent site's existing `/css/`, `/js/`, `/images/`.
- Nav active link is computed via an `active` local passed into the partial.

---

## What's done

Scaffold lives in `sangathan-deploy/` in this repo:

```
sangathan-deploy/
  views/sangathan/
    partials/
      head.ejs    ✅
      nav.ejs     ✅  (active-link logic in place)
      footer.ejs  ✅
    index.ejs     ✅  (landing page at /sangathan)
```

## What's pending

### EJS views to port (9 files)

Source HTML in `outputs/`, target in `sangathan-deploy/views/sangathan/`:

| Source              | Target view           | Route               | nav active key   |
|---------------------|-----------------------|---------------------|------------------|
| `journey.html`      | `journey.ejs`         | `/sangathan/journey`        | `journey`        |
| `schedule.html`     | `schedule.ejs`        | `/sangathan/schedule`       | `schedule`       |
| `guests.html`       | `guests.ejs`          | `/sangathan/guests`         | `guests`         |
| `register.html`     | `register.ejs`        | `/sangathan/register`       | `register`       |
| `visitor-guide.html`| `visitor-guide.ejs`   | `/sangathan/visitor-guide`  | `visitor-guide`  |
| `contact.html`      | `contact.ejs`         | `/sangathan/contact`        | `contact`        |
| `donate.html`       | `donate.ejs`          | `/sangathan/donate`         | `donate`         |
| `privacy.html`      | `privacy.ejs`         | `/sangathan/privacy`        | *(none)*         |
| `terms.html`        | `terms.ejs`           | `/sangathan/terms`          | *(none)*         |

Each view follows the established index.ejs pattern:

```ejs
<%- include('partials/head', { title: '...', description: '...' }) %>
<%- include('partials/nav', { active: '<key>' }) %>

<!-- page-specific content here -->

<%- include('partials/footer') %>
```

### Internal link rewrites (when porting content)

| Old (HTML)                       | New (EJS)                              |
|----------------------------------|----------------------------------------|
| `index.html`                     | `/sangathan`                           |
| `journey.html`                   | `/sangathan/journey`                   |
| `schedule.html`                  | `/sangathan/schedule`                  |
| `guests.html`                    | `/sangathan/guests`                    |
| `register.html`                  | `/sangathan/register`                  |
| `visitor-guide.html`             | `/sangathan/visitor-guide`             |
| `visitor-guide.html#emergency`   | `/sangathan/visitor-guide#emergency`   |
| `contact.html`                   | `/sangathan/contact`                   |
| `donate.html`                    | `/sangathan/donate`                    |
| `privacy.html`                   | `/sangathan/privacy`                   |
| `terms.html`                     | `/sangathan/terms`                     |
| `css/styles.css`                 | `/sangathan/css/styles.css`            |
| `js/main.js`                     | `/sangathan/js/main.js`                |
| `images/foo.png`                 | `/sangathan/images/foo.png`            |
| `#anchor` (same-page)            | unchanged                              |
| `tel:`, `mailto:`, external URLs | unchanged                              |

### Express router file

Create `sangathan-deploy/routes/sangathan.js`:

```js
const express = require('express');
const router = express.Router();

const pages = [
  { path: '/',              view: 'sangathan/index' },
  { path: '/journey',       view: 'sangathan/journey' },
  { path: '/schedule',      view: 'sangathan/schedule' },
  { path: '/guests',        view: 'sangathan/guests' },
  { path: '/register',      view: 'sangathan/register' },
  { path: '/visitor-guide', view: 'sangathan/visitor-guide' },
  { path: '/contact',       view: 'sangathan/contact' },
  { path: '/donate',        view: 'sangathan/donate' },
  { path: '/privacy',       view: 'sangathan/privacy' },
  { path: '/terms',         view: 'sangathan/terms' }
];

pages.forEach(({ path, view }) => {
  router.get(path, (req, res) => res.render(view));
});

module.exports = router;
```

Mount in the parent app's `server.js` / `app.js`:

```js
app.use('/sangathan', require('./routes/sangathan'));
```

### Static assets to copy

Source → target inside the parent repo's static folder
(`public/sangathan/` — verify the parent's actual static dir name when porting):

- `outputs/css/styles.css`  → `public/sangathan/css/styles.css`
- `outputs/js/main.js`      → `public/sangathan/js/main.js`  (no path changes needed)
- `outputs/images/*`        → `public/sangathan/images/*`     (10 files)

---

## Next steps to resume

1. **Get the sydneytemple.org repo URL** from the user.
2. **Clone** to `~/Documents/sydneytemple` (off-tree from this workspace).
3. **Branch** `feat/sangathan-route` from the repo's default branch.
4. **Verify conventions** in the parent repo:
   - Static folder name (`public/` vs `static/`).
   - Existing EJS layout pattern (do they use `express-ejs-layouts`? If yes,
     adapt the partials approach or switch to their layout).
   - Where existing route files live (`routes/`, `app/routes/`, etc.).
   - Existing nav/footer conventions — adopt them if they differ.
5. **Port** the four scaffold files from `sangathan-deploy/` into the matching
   parent-repo locations, adjusting paths.
6. **Convert** the remaining 9 HTML files using the link-rewrite table above.
7. **Copy assets** into the parent's static directory under `/sangathan/`.
8. **Add the mount line** to the parent's main server file.
9. **Smoke test locally** — visit every route, verify nav highlighting, click
   every internal link, confirm countdown still runs on `/sangathan`.
10. **Open PR** for review.

---

## Gotchas to watch for

- The countdown JS uses a hardcoded target date (2026-07-04). Don't accidentally
  break it during the port.
- `outputs/visitor-guide.html` has many same-page `#anchor` links (jump-nav)
  — leave those untouched.
- Two pages don't wrap content in `.page-intro` or `.coming-soon-page` —
  `visitor-guide`, `privacy`, and `terms`. Preserve that.
- The nav-emergency link points to `visitor-guide.html#emergency` on every page
  except `visitor-guide.html` itself (where it's just `#emergency`). The
  partial already uses the absolute `/sangathan/visitor-guide#emergency`
  everywhere — that's fine, browser handles same-page anchor jumps regardless.
