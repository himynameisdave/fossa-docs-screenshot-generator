# fossa-docs-screenshot-generator
Paste a screenshot, and get a pretty product screenshot ready to put on the docs site.

## Local development

Install dependencies:

```sh
bun install
```

Run the app locally:

```sh
bun run dev
```

Open the local URL from Vite, paste a copied screenshot with `Cmd+V` or `Ctrl+V`, or upload an image file.

## Build

```sh
bun run build
```

The static build is written to `build/`.

## Deployment

This project is configured for Netlify with `netlify.toml`:

```toml
[build]
command = "bun run build"
publish = "build"
```

## Placement settings

The composition constants live in `src/routes/+page.svelte`:

- `OUTPUT_WIDTH` and `OUTPUT_HEIGHT` set the base image size.
- `EXPORT_SCALE` controls the high-resolution PNG multiplier.
- `SCREENSHOT_SAFE_AREA` controls where screenshots are centered and scaled.
