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

## Placeholder images

These ship so the site looks complete before real photography lands. Replace
them through the matching image picker — no code change needed.

| Asset | Used by | Replace via |
|---|---|---|
| `placeholder-hero-1.webp` | Hero slide 1 | Customize → Hero slideshow → Slide → Image |
| `placeholder-cat-*.webp` (5) | Category tiles | Customize → Category tiles → Tile → Image |
| `placeholder-cta-left/right.webp` | CTA banner sides | Customize → Call to action banner |
| `about-jessica.webp` | About section | Customize → About feature → Photo |

The hero and category placeholders were cut from the low-resolution design
mockup, so they are soft. They are intentionally temporary.

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
