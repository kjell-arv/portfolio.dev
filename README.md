#personal website

This website is completely programmed by me and is in own use to represent myself or showcase to sponsors and the world.
I use it to keep people updated and share my eperiences as well as adventures as an upcoming professional athlete.

My goal is to become either a full professional athlete or a software engineer. This is all I am capable of for now. This project will respresent my abilities after 1 year of learning on my own besides sport (20h per week) and school.
Feel free to send me feedback on my work.

## Deploying

Build the production bundle:

```bash
npm run build
```

The output is in `dist/`. Upload that folder to any static host (Netlify, Vercel, Cloudflare Pages, etc.).

- **Vercel**: `vercel.json` is included so client-side routes (`/login`, `/dashboard`, etc.) resolve correctly.
- **Netlify / Cloudflare Pages**: `public/_redirects` is copied into `dist` as `_redirects` for SPA fallback.
- **GitHub Pages** (project site): set `base` in `vite.config.js` to your repo name (e.g. `base: '/your-repo/'`), run `npm run build`, and publish `dist`. You may need a `404.html` copy of `index.html` for deep links—see [Vite static deploy](https://vitejs.dev/guide/static-deploy.html).

**Owner area (dashboard):** there are no passwords in the repo. After the first deploy, open **Setup** in the nav (or go to `/setup`) once in your browser to create a password; it is stored only in that browser’s `localStorage`. For stronger protection on a public URL, add a real backend or hosted auth later.
