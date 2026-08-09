# Southern Bloom Bakery Co. — Shopify theme

A custom Shopify Online Store 2.0 theme built to match the approved design.
Mobile-first, no theme framework, no external JS dependencies.

---

## What the client can change without touching code

Everything visual is editable from **Online Store → Themes → Customize**.

| What | Where |
|---|---|
| Every photo on the site | Each section has an **image picker**. Hero slides, category tiles, the About photo, gallery photos, CTA side photos. |
| Every piece of text | Headings, sub-headings, body copy, button labels, eyebrow labels — all section settings. |
| Hero headline | Split into a **dark line** and a **rose line** so the two-tone look survives any wording. Press Enter for a new line. |
| Brand colours | Theme settings → **Colours** |
| Fonts | Theme settings → **Typography** (script / serif / body, each from a short curated list) |
| Phone, email, order-form link, service area, hours | Theme settings → **Contact details** |
| Social links | Theme settings → **Social media** |
| Products | Shopify admin → Products. They appear on the Shop page automatically. |
| Menus | Shopify admin → Navigation (`main-menu`, `footer`) |

Sections can also be **reordered, hidden, duplicated or removed** on any page.

---

## Pages

| Page | Template | Notes |
|---|---|---|
| Home | `templates/index.json` | Hero slideshow, occasion icons, category tiles, About, testimonials, CTA |
| Gallery | `templates/page.gallery.json` | Filter pills + 64 bundled photos, click to open a lightbox |
| Shop | `templates/collection.json` | Product grid with sorting and pagination |
| About me | `templates/page.about.json` | Story, promises, how-it-works, CTA |
| Contact | `templates/page.contact.json` | Contact details + enquiry form |

### Setting the pages up in Shopify

The JSON templates exist, but Shopify still needs the **pages** themselves:

1. Admin → **Online Store → Pages → Add page**
2. Create pages with these handles: `gallery`, `about`, `contact`
3. On each page, set **Theme template** to `gallery`, `about` or `contact`
4. Admin → **Navigation → Main menu**, add: Home, Gallery, Shop, About me, Contact

The header splits the main menu around the logo — the first two items sit on the
left, the rest on the right. Change the split in Customize → Header.

---

## The gallery

The 64 cookie photos ship as theme assets (`assets/gallery-01.webp` …
`gallery-64.webp`) and are split across two **Gallery grid** sections because
Shopify allows a maximum of 50 blocks per section. The **Gallery filter**
section above them filters both grids at once.

To change a photo: Customize → Gallery page → the grid → pick the photo block →
choose a new image. To add one: **Add block** in either grid.

Each photo block has a **Category** field. It must match a pill in the Gallery
filter section (for example `Birthdays`). Matching ignores case and spacing.

> Once the store is live it is worth moving these photos into
> **Content → Files** and re-selecting them through the image pickers. Files
> get Shopify's image CDN and responsive resizing; theme assets do not.

---

## Supplied photography

Every photo in the theme is real supplied artwork — there are no placeholder
images left. All of them are replaceable through the matching image picker,
no code change needed.

| Asset | Used by |
|---|---|
| `hero-bg.webp` / `hero-bg-mobile.webp` | Hero banner |
| `cat-birthdays` / `cat-baby-showers` / `cat-weddings` / `cat-graduations` / `cat-and-more` | Category tiles |
| `about-jessica.webp` | About section (carries its own ornate frame, transparent background) |
| `cta-bar.webp` / `cta-bar-mobile.webp` | Call to action banner |
| `gallery-01…64.webp` | Gallery page |

**The About photo** has its own frame baked in, so the section's *Photo has its
own frame* setting is on. That shows the whole image uncropped and removes the
theme's own shadow and border. Turn it off for an ordinary photo and it will
fill the shape instead, cropped to the chosen focal point.

---
## The hero

Two layouts, switchable in Customize → Hero slideshow → **Layout**:

- **Full-width photo, text on top** (default) — the banner fills the section
  edge to edge and the copy sits over the clear side of the photo. Suits a wide
  image with empty space on one side, like the supplied `hero-bg.webp`.
- **Text beside photo** — the original split column layout.

Useful controls:

| Setting | What it does |
|---|---|
| Height | Section height as a share of screen width. 42vw matches the supplied banner. |
| Text column width | How much of the width the copy occupies. |
| Keep this part of the photo in view | Focal point used when the photo gets cropped. Set to **Right** for the supplied banner so the cookie plate is never cut off. |
| Fade behind the text | A blush scrim behind the copy. Leave at 0 for the supplied banner; raise it if a busier photo makes the text hard to read. |
| Photo — mobile | Optional taller crop for phones. |

On phones the hero always stacks: photo band on top, copy beneath. The hero
copy aligns to the **left edge of the page**, not the centred content
container, so it does not drift inward on wide monitors.

---

## Local preview

The repo root is the theme, so the Shopify CLI works directly:

```bash
shopify theme dev
```

There is also a dependency-light static renderer in the parent working folder
(`tools/preview.mjs`) used during the build to check the design without a
store. It is not part of the theme.

---

## Deploying

### GitHub → Shopify (recommended)

Shopify's GitHub integration expects the theme at the **repository root**,
which is why this folder is the repo root rather than the project folder above it.

1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**
2. Pick `unit6854/Southern-Bloom` and the `main` branch
3. Shopify pulls the theme and keeps it in sync with every push

Edits made in the Shopify theme editor are committed back to the branch, so
pull before making local changes.

### Manual upload

Zip the contents of this folder (not the folder itself) and upload through
**Themes → Add theme → Upload zip**.

---

## Structure

```
assets/       CSS, JS, logo, photos
config/       theme settings schema + saved values
layout/       theme.liquid, password.liquid
locales/      en.default.json (all UI strings)
sections/     one file per editable section
snippets/     icon set, product card, pagination, cart drawer, social icons
templates/    JSON templates per page type
```

### Stylesheets

| File | Covers |
|---|---|
| `base.css` | Reset, design tokens, typography, buttons, forms, layout |
| `components.css` | Header, footer, hero, occasions, tiles, About, testimonials, CTA |
| `pages.css` | Gallery, shop, product, cart, contact, account, 404, password |

Colours and fonts are CSS custom properties printed by `layout/theme.liquid`
from theme settings, so the Customize panel drives the whole palette.

---

## Notes

- All icons are inline SVG (`snippets/icon.liquid`) — they recolour with the
  theme and stay sharp at any size.
- JavaScript is one file, no dependencies, and everything degrades gracefully
  without it.
- `prefers-reduced-motion` is respected; the slideshow and reveal animations
  switch off.
