# AVK Blackgold Infra — Website

Corporate website for AVK Blackgold Infra Private Limited, Surat.
Built with plain HTML, CSS and JavaScript. No framework and no build step.

## Run locally

Serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

```
.
├── index.html                      Home page
├── pages/
│   ├── company/                    About, responsible commitment, clients,
│   │                               partnering customer, careers, contact
│   ├── products/                   Bitumen emulsions, instant pothole repair,
│   │                               PatchFILL machine
│   ├── services/                   Road maintenance (microsurfacing, cold mix)
│   ├── knowledge/                  Blog listing and articles
│   └── legal/                      Privacy policy
└── assets/
    ├── css/styles.css              All styles; theme tokens at the top
    ├── js/config.js                Company details, navigation, footer links
    ├── js/components.js            Shared header and footer
    ├── js/main.js                  Navigation, animations, forms
    ├── images/                     brand, company, hero, knowledge,
    │                               partners, products, sectors, services
    └── videos/hero.mp4             Home page background video
```

## Common edits

- **Contact details, menu, footer links** — `assets/js/config.js`. Changes apply to every page.
- **Colours and fonts** — CSS variables at the top of `assets/css/styles.css`.
- **Adding a page** — copy an existing page from the same folder. Pages under `pages/*/` set
  `data-root="../../"` on the `<html>` tag so shared links and images resolve correctly.

## Forms

Forms submit through [Web3Forms](https://web3forms.com). Put the access key in
`formAccessKey` inside `assets/js/config.js`. Without a key, forms validate but do not send email.

## Deployment

The site is fully static and can be hosted on GitHub Pages, Netlify or any web server.
For GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.
