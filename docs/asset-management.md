# Asset Management

## Directories
- Root assets: `assets/`
- Logos: `assets/logos/` (svg, png, jpg; color variants)
- Favicons: `assets/favicons/` (ico, svg, png; platform icons)

## Naming
- Logos: `logo-{variant}.{format}` (variants: full-color, monochrome, inverted)
- Favicons: `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`
- Platform: `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`

## Usage
- Web app serves assets from `apps/web/public/`
- Assets are synced via `npm run sync:assets`
- Reference favicons in `apps/web/index.html`

## Maintenance
- Add new versions with semantic tags, e.g., `logo-full-color@v1.svg`
- Update README in each folder with changes
- Keep raster assets ≥300x300

