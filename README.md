# AL AMIN — For Poultry Production

A static, responsive AL AMIN poultry website. The site runs directly from `index.html`; it does not need a build step or a server.

## Preview locally

Open `index.html` in a browser. Page navigation uses URL hashes and works on GitHub Pages project URLs.

## Project structure

- `index.html` — site shell and page templates
- `assets/css/site.css` — shared visual styles
- `assets/js/data.js` — page styles, metadata, and local image references
- `assets/js/runtime.js` — lightweight page router and renderer
- `assets/js/pages.js` — page content and interactions
- `assets/images/` — optimized WebP illustrations and photography

## Publish with GitHub Pages

1. Push this repository to GitHub using the `main` branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/(root)`, then save.

GitHub Pages will publish `index.html` and the `assets/` directory as a static site.

## Language

The site includes English pages and an Arabic localized home page with right-to-left layout. Use the language control in the header to switch between them.
