# fossa-docs-screenshot-generator
Paste a screenshot, and get a pretty product screenshot ready to put on the docs site.

## Requirements

- Bun for repo development.
- Node.js 20 or newer for the packaged CLI.

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

Run all checks:

```sh
bun run check
```

## Build

```sh
bun run build
```

The static build is written to `build/`.

## CLI

This repo also includes a packageable CLI at `packages/cli`. It renders the same docs-ready PNG from a local screenshot file:

```sh
bun run --cwd packages/cli dev -- ./path/to/screenshot.png
```

By default, the output is written next to the input image with a `.pretty.png` suffix:

```sh
./path/to/screenshot.pretty.png
```

Common options:

- `--output <path>` writes a single input to a specific output path.
- `--force` overwrites an existing output file.
- `--scale <number>` changes the export multiplier. The default is `2`.
- `--screenshot-size <percent>` changes how large the screenshot appears in the background. The default is `100`.
- `--window-padding <pixels>` adds padding inside the macOS-style browser frame. The default is `0`.
- `--no-browser-window` exports without the browser frame.
- Multiple input files can be passed at once. Each output is written next to its source image.

Examples:

```sh
bun run --cwd packages/cli dev -- ./screenshots/settings.png
bun run --cwd packages/cli dev -- ./screenshots/*.png
bun run --cwd packages/cli dev -- --output ./docs/settings.png ./screenshots/settings.png
bun run --cwd packages/cli dev -- --screenshot-size 80 ./screenshots/settings.png
bun run --cwd packages/cli dev -- --window-padding 32 ./screenshots/settings.png
bun run --cwd packages/cli dev -- --no-browser-window --scale 1 ./screenshots/settings.png
```

Build and package the CLI for sharing:

```sh
bun run package:cli
```

That command creates a `.tgz` package in the repo root. A teammate can install it globally and run the binary from any folder:

```sh
npm install -g ./fossa-docs-screenshot-generator-0.2.0.tgz
fossa-docs-screenshot ./path/to/screenshot.png
```

If the package is published to a registry later, install it with `npm install -g @fossa/docs-screenshot-generator` instead.

## CLI releases

The CLI release workflow lives at `.github/workflows/cli-release.yml` and runs when a version tag like `v0.1.0` is pushed.

To cut a CLI release:

1. Update `version` in both `package.json` and `packages/cli/package.json`.
2. Commit the version change.
3. Create and push a matching tag, for example `git tag v0.1.1 && git push origin v0.1.1`.

The workflow verifies the tag matches both package versions, runs checks, packages `packages/cli` with `npm pack`, smoke-tests the globally installed binary, and attaches the versioned `.tgz` tarball to the GitHub release.

## Deployment

This project is configured for Netlify with `netlify.toml`:

```toml
[build]
command = "bun run build"
publish = "build"
```

## Placement settings

The composition constants live in `src/lib/screenshot-composition.ts` and are shared by the web app and CLI:

- `OUTPUT_WIDTH` and `OUTPUT_HEIGHT` set the base image size.
- `EXPORT_SCALE` controls the high-resolution PNG multiplier.
- `SCREENSHOT_SIZE` controls the default, min, max, and step values for screenshot placement size.
- `BROWSER_WINDOW_PADDING` controls the default, min, max, and step values for browser-frame padding.
- `SCREENSHOT_SAFE_AREA` controls where screenshots are centered and scaled.
