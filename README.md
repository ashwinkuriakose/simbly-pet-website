# Simbly Pet website

The public marketing site for [simblypet.com](https://simblypet.com), built with [Astro](https://astro.build). It builds to plain static files.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:4321 (Astro runs it in the background; `npx astro dev stop` stops it)
npm run build      # outputs static files to dist/
npm run preview    # serves dist/ to check the production build
```

Requires Node 22 or later.

## Editing content

All page text, links and FAQ entries live in [`src/content/site.json`](src/content/site.json). Layout code reads from it, so copy changes don't need component edits (and a CMS can write this file later).

- `links.businessPortal`: the "For businesses" link (https://business.simblypet.com).
- `appStatus`: `"coming-soon"` shows "Coming soon" store badges. Set it to `"live"` and fill in `links.appStore` / `links.googlePlay` to show real download links.

The app screens on the page are drawn in HTML in `src/components/Screen.astro`, not screenshots, so they stay crisp and are easy to update.

## Contact form

The "Contact us" sections (home page, and a business version on `/business`) post JSON to `{PUBLIC_API_URL}/api/v1/public/contact/` with no cookies. `PUBLIC_API_URL` is read at build time and defaults to `https://api.simblypet.com`; the deploy workflow sets it explicitly. To test against a local API, copy `.env.example` to `.env` (or run `PUBLIC_API_URL=http://localhost:8000 npm run dev`) and open the site at `http://localhost:4321`, which is the origin the API allows. Messages show up on the admin dashboard's "Website enquiries" page. Form logic lives in `src/scripts/contact.ts`.

## Structure

- `src/pages/index.astro`: the page, assembled from section components.
- `src/components/`: one component per section (Hero, Features, HowItWorks, Services, Business, Faq, Download, Footer).
- `src/scripts/motion.ts`: scroll animations (reveals, word highlight, pinned steps, horizontal services, expanding business panel). With JavaScript off, or with reduced motion requested, everything shows statically.
- `src/styles/global.css`: design tokens (brand yellow `#FFBB03`, ink `#0a0a0a`), buttons and the reveal styles.
- `public/`: favicon, share image (`og.png`) and `CNAME`.

## Deploying

simblypet.com is served by GitHub Pages from this repo. Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` (including `CNAME`).

One-time setting: in the repo's Settings → Pages, set **Source** to **GitHub Actions**.

If the site later moves to the Contabo server, copy `dist/` into the backend's `deploy/proxy/static-sites/<name>/` instead (see DEPLOY.md section 11 in `simbly-pet-backend`) and remove `public/CNAME`.
