import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import sharp from 'sharp';

import {
  BACKGROUND_SVG,
  BROWSER_WINDOW,
  EXPORT_SCALE,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH,
  getPlacement,
  scaleRect,
  type Rect
} from '../../../src/lib/screenshot-composition';

type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ParsedColor = {
  color: string;
  opacity?: number;
};

export type RenderScreenshotOptions = {
  inputPath: string;
  outputPath: string;
  scale?: number;
  browserWindow?: boolean;
  browserWindowPadding?: number;
  screenshotSize?: number;
};

export type RenderScreenshotResult = {
  inputPath: string;
  outputPath: string;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
};

export async function renderScreenshotPng(
  options: RenderScreenshotOptions
): Promise<RenderScreenshotResult> {
  const scale = options.scale ?? EXPORT_SCALE;
  const browserWindow = options.browserWindow ?? true;

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('Scale must be a positive number.');
  }

  const source = sharp(options.inputPath, { failOn: 'none' });
  const metadata = await source.metadata();
  const inputWidth = metadata.width;
  const inputHeight = metadata.height;

  if (!inputWidth || !inputHeight) {
    throw new Error('Input image has no usable dimensions.');
  }

  const outputWidth = Math.max(1, Math.round(OUTPUT_WIDTH * scale));
  const outputHeight = Math.max(1, Math.round(OUTPUT_HEIGHT * scale));
  const placement = getPlacement(
    inputWidth,
    inputHeight,
    browserWindow,
    options.screenshotSize,
    options.browserWindowPadding
  );
  const screenshotRect = toPixelRect(placement.screenshotRect, scale);
  const composites: sharp.OverlayOptions[] = [];

  if (browserWindow && placement.browserWindowRect) {
    const windowRect = toPixelRect(placement.browserWindowRect, scale);

    composites.push({
      input: createBrowserWindowBackgroundSvg(outputWidth, outputHeight, windowRect, scale),
      left: 0,
      top: 0
    });

    composites.push({
      input: await createClippedScreenshotLayer(
        options.inputPath,
        outputWidth,
        outputHeight,
        screenshotRect,
        windowRect,
        scale
      ),
      left: 0,
      top: 0
    });

    composites.push({
      input: createBrowserWindowChromeSvg(outputWidth, outputHeight, windowRect, scale),
      left: 0,
      top: 0
    });
  } else {
    composites.push({
      input: await resizeScreenshot(options.inputPath, screenshotRect),
      left: screenshotRect.x,
      top: screenshotRect.y
    });
  }

  await mkdir(dirname(options.outputPath), { recursive: true });

  await sharp(Buffer.from(BACKGROUND_SVG))
    .resize(outputWidth, outputHeight, { fit: 'fill' })
    .composite(composites)
    .png()
    .toFile(options.outputPath);

  return {
    inputPath: options.inputPath,
    outputPath: options.outputPath,
    inputWidth,
    inputHeight,
    outputWidth,
    outputHeight
  };
}

function toPixelRect(rect: Rect, scale: number): PixelRect {
  const scaled = scaleRect(rect, scale);

  return {
    x: Math.round(scaled.x),
    y: Math.round(scaled.y),
    width: Math.max(1, Math.round(scaled.width)),
    height: Math.max(1, Math.round(scaled.height))
  };
}

async function resizeScreenshot(inputPath: string, rect: PixelRect) {
  return sharp(inputPath, { failOn: 'none' })
    .resize(rect.width, rect.height, { fit: 'fill' })
    .png()
    .toBuffer();
}

async function createClippedScreenshotLayer(
  inputPath: string,
  outputWidth: number,
  outputHeight: number,
  screenshotRect: PixelRect,
  windowRect: PixelRect,
  scale: number
) {
  const screenshot = await resizeScreenshot(inputPath, screenshotRect);
  const screenshotLayer = await sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: screenshot, left: screenshotRect.x, top: screenshotRect.y }])
    .png()
    .toBuffer();

  return sharp(screenshotLayer)
    .composite([
      {
        input: createRoundedRectMaskSvg(outputWidth, outputHeight, windowRect, BROWSER_WINDOW.borderRadius * scale),
        left: 0,
        top: 0,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();
}

function createBrowserWindowBackgroundSvg(
  outputWidth: number,
  outputHeight: number,
  rect: PixelRect,
  scale: number
) {
  const radius = BROWSER_WINDOW.borderRadius * scale;
  const topBarHeight = BROWSER_WINDOW.topBarHeight * scale;
  const shadowBlur = BROWSER_WINDOW.shadowBlur * scale;
  const shadowOffsetY = BROWSER_WINDOW.shadowOffsetY * scale;

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">
      <defs>
        <filter id="window-shadow" x="-40%" y="-40%" width="180%" height="220%">
          <feDropShadow dx="0" dy="${shadowOffsetY}" stdDeviation="${shadowBlur / 2}" ${svgPaintAttributes('flood-color', BROWSER_WINDOW.shadowColor)} />
        </filter>
        <clipPath id="window-clip">
          ${roundedRectElement(rect, radius)}
        </clipPath>
      </defs>
      ${roundedRectElement(rect, radius, `${svgPaintAttributes('fill', BROWSER_WINDOW.backgroundColor)} filter="url(#window-shadow)"`)}
      <g clip-path="url(#window-clip)">
        <rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" ${svgPaintAttributes('fill', BROWSER_WINDOW.backgroundColor)} />
        <rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${topBarHeight}" ${svgPaintAttributes('fill', BROWSER_WINDOW.topBarColor)} />
      </g>
    </svg>
  `);
}

function createBrowserWindowChromeSvg(
  outputWidth: number,
  outputHeight: number,
  rect: PixelRect,
  scale: number
) {
  const radius = BROWSER_WINDOW.borderRadius * scale;
  const topBarHeight = BROWSER_WINDOW.topBarHeight * scale;
  const borderWidth = BROWSER_WINDOW.borderWidth * scale;
  const dotY = rect.y + BROWSER_WINDOW.dotY * scale;
  const dotStartX = rect.x + BROWSER_WINDOW.dotX * scale;
  const dotRadius = BROWSER_WINDOW.dotRadius * scale;
  const dotStep = (BROWSER_WINDOW.dotRadius * 2 + BROWSER_WINDOW.dotGap) * scale;
  const separatorHeight = Math.max(1, scale);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">
      <defs>
        <clipPath id="window-clip">
          ${roundedRectElement(rect, radius)}
        </clipPath>
      </defs>
      <g clip-path="url(#window-clip)">
        <rect x="${rect.x}" y="${rect.y + topBarHeight}" width="${rect.width}" height="${separatorHeight}" ${svgPaintAttributes('fill', BROWSER_WINDOW.separatorColor)} />
      </g>
      ${roundedRectElement(rect, radius, `fill="none" ${svgPaintAttributes('stroke', BROWSER_WINDOW.borderColor)} stroke-width="${borderWidth}"`)}
      <circle cx="${dotStartX}" cy="${dotY}" r="${dotRadius}" fill="#ff5f57" />
      <circle cx="${dotStartX + dotStep}" cy="${dotY}" r="${dotRadius}" fill="#ffbd2e" />
      <circle cx="${dotStartX + dotStep * 2}" cy="${dotY}" r="${dotRadius}" fill="#28c840" />
    </svg>
  `);
}

function createRoundedRectMaskSvg(
  outputWidth: number,
  outputHeight: number,
  rect: PixelRect,
  radius: number
) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">
      ${roundedRectElement(rect, radius, 'fill="#fff"')}
    </svg>
  `);
}

function roundedRectElement(rect: PixelRect, radius: number, attributes = '') {
  const cappedRadius = Math.min(radius, rect.width / 2, rect.height / 2);

  return `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="${cappedRadius}" ry="${cappedRadius}" ${attributes} />`;
}

function svgPaintAttributes(attribute: 'fill' | 'stroke' | 'flood-color', color: string) {
  const parsed = parseColor(color);
  const opacityAttribute = attribute === 'flood-color' ? 'flood-opacity' : `${attribute}-opacity`;
  const opacity = parsed.opacity === undefined ? '' : ` ${opacityAttribute}="${parsed.opacity}"`;

  return `${attribute}="${parsed.color}"${opacity}`;
}

function parseColor(color: string): ParsedColor {
  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);

  if (!rgbaMatch) {
    return { color };
  }

  return {
    color: `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`,
    opacity: Number(rgbaMatch[4])
  };
}
