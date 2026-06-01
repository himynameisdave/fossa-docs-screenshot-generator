# @fossa/docs-screenshot-generator

Generate FOSSA docs-ready PNG screenshots from local image files.

## Requirements

- Node.js 20 or newer.

## Usage

```sh
fossa-docs-screenshot ./product-screenshot.png
```

The default output is written next to the input image:

```sh
./product-screenshot.pretty.png
```

Multiple inputs are supported:

```sh
fossa-docs-screenshot ./screenshots/*.png
```

## Options

```sh
fossa-docs-screenshot [options] <image...>
```

- `-o, --output <path>` writes a single input to a specific output path.
- `-f, --force` overwrites existing output files.
- `--scale <number>` changes the export multiplier. The default is `2`.
- `--screenshot-size <percent>` changes how large the screenshot appears in the background. The default is `100`.
- `--window-padding <pixels>` adds padding inside the macOS-style browser frame. The default is `0`.
- `--no-browser-window` exports without the macOS-style browser frame.
- `-h, --help` prints help.

## Examples

```sh
fossa-docs-screenshot ./screenshots/settings.png
fossa-docs-screenshot --output ./docs/settings.png ./screenshots/settings.png
fossa-docs-screenshot --force ./screenshots/settings.png
fossa-docs-screenshot --screenshot-size 80 ./screenshots/settings.png
fossa-docs-screenshot --window-padding 32 ./screenshots/settings.png
fossa-docs-screenshot --no-browser-window --scale 1 ./screenshots/settings.png
```

## Local Development

From the repo root:

```sh
bun run --cwd packages/cli dev -- ./screenshot.png
```

Build the CLI bundle:

```sh
bun run build:cli
```

## Build And Package

From the repo root:

```sh
bun run package:cli
```

The package exposes the `fossa-docs-screenshot` binary and depends on `sharp` for Node-side image rendering.

Install the generated tarball globally to use it like a normal command:

```sh
npm install -g ./fossa-docs-screenshot-generator-0.1.0.tgz
fossa-docs-screenshot ./screenshot.png
```

If this package is published to a registry later, install it with:

```sh
npm install -g @fossa/docs-screenshot-generator
```
