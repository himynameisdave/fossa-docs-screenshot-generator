export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Placement = {
  browserWindowRect: Rect | null;
  screenshotRect: Rect;
};

export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;
export const EXPORT_SCALE = 2;

export const SCREENSHOT_SIZE = {
  defaultPercent: 100,
  minPercent: 50,
  maxPercent: 130,
  stepPercent: 5
};

export const BROWSER_WINDOW_PADDING = {
  defaultPixels: 0,
  minPixels: 0,
  maxPixels: 144,
  stepPixels: 4
};

export const SCREENSHOT_SAFE_AREA = {
  x: 240,
  y: 170,
  width: 1440,
  height: 740
} satisfies Rect;

export const BROWSER_WINDOW = {
  topBarHeight: 68,
  borderWidth: 2,
  borderRadius: 8,
  dotRadius: 9,
  dotGap: 14,
  dotX: 36,
  dotY: 34,
  backgroundColor: '#f8fbf9',
  borderColor: 'rgba(26, 46, 37, 0.32)',
  topBarColor: '#eaf4f0',
  separatorColor: 'rgba(26, 46, 37, 0.12)',
  shadowColor: 'rgba(14, 28, 22, 0.28)',
  shadowBlur: 60,
  shadowOffsetY: 30
};

export const BACKGROUND_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 680 400">',
  '<path fill="#243b30" d="M0 0h110v115H0z"/>',
  '<g stroke="#2e4a3c" stroke-linecap="round" stroke-width="1.3" opacity=".8">',
  '<path d="m-10 20 40-30M-10 40l60-50M-10 60l80-70M-10 80 90-10M-10 100 110-10M-10 120 110 10M10 120l100-90M30 120l80-70M50 120l60-50M70 120l40-30M90 120l20-10"/>',
  '</g>',
  '<path fill="#eaf4f0" d="M110 0h140v125H110z"/>',
  '<g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="6" opacity=".55">',
  '<path d="M118 90q42-60 122-35"/>',
  '<path d="M112 115q56-70 136-35"/>',
  '<path d="M120 135q65-70 135-35"/>',
  '</g>',
  '<path fill="#5a8f75" d="M250 0h105v100H250z"/>',
  '<g stroke="#3d6b56" stroke-linecap="round" stroke-width="2.8" opacity=".7">',
  '<path d="m265 13 13 13M278 13l-13 13M295 13l13 13M308 13l-13 13M325 13l13 13M338 13l-13 13M265 40l13 13M278 40l-13 13M295 40l13 13M308 40l-13 13M325 40l13 13M338 40l-13 13M265 67l13 13M278 67l-13 13M295 67l13 13M308 67l-13 13M325 67l13 13M338 67l-13 13"/>',
  '</g>',
  '<path fill="#c2ddd2" d="M355 0h115v110H355z"/>',
  '<g stroke="#7db89e" stroke-linecap="round" stroke-width="5" opacity=".5">',
  '<path d="M372 5v100M390 5v100M408 5v100M426 5v100M444 5v100M462 5v100"/>',
  '</g>',
  '<path fill="#1a2e25" d="M470 0h110v120H470z"/>',
  '<g stroke="#243b30" stroke-width=".9" opacity=".9">',
  '<path d="M470 20h110M470 40h110M470 60h110M470 80h110M470 100h110M490 0v120M510 0v120M530 0v120M550 0v120M570 0v120"/>',
  '</g>',
  '<path fill="#f2f8f5" d="M580 0h100v105H580z"/>',
  '<g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="1.8" opacity=".7">',
  '<path d="M583 18q17-8 34 0t34 0 32 0M583 34q17-8 34 0t34 0 32 0M583 50q17-8 34 0t34 0 32 0M583 66q17-8 34 0t34 0 32 0M583 82q17-8 34 0t34 0 32 0M583 98q17-8 34 0t34 0 32 0"/>',
  '</g>',
  '<path fill="#dceee8" d="M0 115h145v135H0z"/>',
  '<g fill="none" stroke="#7db89e" stroke-width="4" opacity=".5">',
  '<circle cx="32" cy="143" r="20"/>',
  '<circle cx="75" cy="143" r="20"/>',
  '<circle cx="118" cy="143" r="20"/>',
  '<circle cx="32" cy="185" r="20"/>',
  '<circle cx="75" cy="185" r="20"/>',
  '<circle cx="118" cy="185" r="20"/>',
  '<circle cx="32" cy="227" r="20"/>',
  '<circle cx="75" cy="227" r="20"/>',
  '<circle cx="118" cy="227" r="20"/>',
  '</g>',
  '<path fill="#4a7a63" d="M145 100h120v150H145z"/>',
  '<g fill="none" stroke="#3d6b56" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" opacity=".65">',
  '<path d="m153 120 52-10 52 10M153 138l52-10 52 10M153 156l52-10 52 10M153 174l52-10 52 10M153 192l52-10 52 10M153 210l52-10 52 10M153 228l52-10 52 10M153 246l52-10 52 10"/>',
  '</g>',
  '<path fill="#f2f8f5" d="M265 105h125v140H265z"/>',
  '<g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="4" opacity=".6">',
  '<rect width="22" height="18" x="280" y="120" rx="2"/>',
  '<rect width="22" height="18" x="313" y="120" rx="2"/>',
  '<rect width="22" height="18" x="346" y="120" rx="2"/>',
  '<rect width="22" height="18" x="280" y="150" rx="2"/>',
  '<rect width="22" height="18" x="313" y="150" rx="2"/>',
  '<rect width="22" height="18" x="346" y="150" rx="2"/>',
  '<rect width="22" height="18" x="280" y="180" rx="2"/>',
  '<rect width="22" height="18" x="313" y="180" rx="2"/>',
  '<rect width="22" height="18" x="346" y="180" rx="2"/>',
  '<rect width="22" height="18" x="280" y="210" rx="2"/>',
  '<rect width="22" height="18" x="313" y="210" rx="2"/>',
  '<rect width="22" height="18" x="346" y="210" rx="2"/>',
  '</g>',
  '<path fill="#2e4a3c" d="M390 110h105v130H390z"/>',
  '<g fill="none" stroke="#3d6b56" stroke-linecap="round" stroke-width="1.4" opacity=".75">',
  '<path d="M398 128q17-8 34 2t34-2q14-10 29 0"/>',
  '<path d="M398 146q14-10 32 2t36-2q15-10 29 0"/>',
  '<path d="M398 164q16-10 33 2 18 12 36-3 15-11 28 1"/>',
  '<path d="M398 182q18-10 35 2 18 12 36-3 14-11 26 1"/>',
  '<path d="M398 200q15-10 33 2t36-3q15-11 28 1"/>',
  '<path d="M398 218q17-10 35 2t35-3q15-11 27 1"/>',
  '<path d="M398 236q16-10 34 2t36-3q14-11 27 1"/>',
  '</g>',
  '<path fill="#c2ddd2" d="M495 100h185v150H495z"/>',
  '<g stroke="#7db89e" stroke-width=".9" opacity=".55">',
  '<path d="M495 116h185M495 131h185M495 146h185M495 161h185M495 176h185M495 191h185M495 206h185M495 221h185M495 236h185M510 100v150M525 100v150M540 100v150M555 100v150M570 100v150M585 100v150M600 100v150M615 100v150M630 100v150M645 100v150M660 100v150M675 100v150"/>',
  '</g>',
  '<path fill="#1a2e25" d="M0 250h155v150H0z"/>',
  '<g fill="none" stroke="#2e4a3c" stroke-linecap="round" stroke-width="6" opacity=".75">',
  '<path d="M10 400q45-95 130-135"/>',
  '<path d="M5 375q47-85 150-120M25 400q53-82 140-122M55 400q50-65 113-105"/>',
  '</g>',
  '<path fill="#5a8f75" d="M155 250h115v150H155z"/>',
  '<g fill="#3d6b56" opacity=".65">',
  '<circle cx="175" cy="270" r="5.5"/>',
  '<circle cx="202" cy="276" r="4"/>',
  '<circle cx="228" cy="265" r="5.5"/>',
  '<circle cx="250" cy="278" r="4.5"/>',
  '<circle cx="170" cy="298" r="3.5"/>',
  '<circle cx="197" cy="303" r="6"/>',
  '<circle cx="222" cy="292" r="4.5"/>',
  '<circle cx="248" cy="300" r="4"/>',
  '<circle cx="182" cy="322" r="5"/>',
  '<circle cx="208" cy="328" r="3.5"/>',
  '<circle cx="233" cy="317" r="5.5"/>',
  '<circle cx="255" cy="325" r="4.5"/>',
  '<circle cx="170" cy="348" r="5.5"/>',
  '<circle cx="196" cy="354" r="4"/>',
  '<circle cx="220" cy="342" r="5"/>',
  '<circle cx="247" cy="350" r="3.5"/>',
  '<circle cx="180" cy="374" r="4.5"/>',
  '<circle cx="206" cy="380" r="6"/>',
  '<circle cx="230" cy="368" r="4"/>',
  '<circle cx="252" cy="376" r="4.5"/>',
  '</g>',
  '<path fill="#eaf4f0" d="M270 245h140v155H270z"/>',
  '<g stroke="#a0cbb8" stroke-linecap="round" stroke-width="6" opacity=".5">',
  '<path d="M275 263h130M275 281h130M275 299h130M275 317h130M275 335h130M275 353h130M275 371h130M275 389h130"/>',
  '</g>',
  '<path fill="#7db89e" d="M410 250h115v150H410z"/>',
  '<g fill="none" stroke="#4a7a63" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" opacity=".6">',
  '<path d="m415 268 15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 288l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 308l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 328l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 348l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 368l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 388l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10"/>',
  '</g>',
  '<path fill="#3d6b56" d="M525 245h155v155H525z"/>',
  '<g fill="none" stroke="#2e4a3c" stroke-width="2.2" opacity=".65">',
  '<path d="M525 400q45-65 90-105 33-30 65-40"/>',
  '<path d="M525 400q37-50 70-84 37-36 85-46"/>',
  '<path d="M525 400q29-35 53-58 36-37 102-54"/>',
  '<path d="M525 400q21-22 37-35 34-35 118-57"/>',
  '<path d="M525 400q13-8 23-15 28-30 132-57"/>',
  '</g>',
  '</svg>'
].join('');

export const BACKGROUND_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BACKGROUND_SVG)}`;

export function getFitRect(sourceWidth: number, sourceHeight: number, bounds: Rect): Rect {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Image has no usable dimensions.');
  }

  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new Error('Screenshot size leaves no usable placement area.');
  }

  const scale = Math.min(bounds.width / sourceWidth, bounds.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
    width,
    height
  };
}

export function getPlacement(
  sourceWidth: number,
  sourceHeight: number,
  useBrowserWindow: boolean,
  screenshotSize = 1,
  browserWindowPadding = BROWSER_WINDOW_PADDING.defaultPixels
): Placement {
  if (!Number.isFinite(screenshotSize) || screenshotSize <= 0) {
    throw new Error('Screenshot size must be a positive number.');
  }

  if (!Number.isFinite(browserWindowPadding) || browserWindowPadding < 0) {
    throw new Error('Browser window padding must be a non-negative number.');
  }

  const placementBounds = scaleRectFromCenter(SCREENSHOT_SAFE_AREA, screenshotSize);

  if (useBrowserWindow) {
    return getBrowserWindowPlacement(sourceWidth, sourceHeight, placementBounds, browserWindowPadding);
  }

  return {
    browserWindowRect: null,
    screenshotRect: getFitRect(sourceWidth, sourceHeight, placementBounds)
  };
}

export function scaleRect(rect: Rect, scale: number): Rect {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

function getBrowserInsets(browserWindowPadding: number) {
  const horizontalInset = browserWindowPadding + BROWSER_WINDOW.borderWidth;
  const topInset = BROWSER_WINDOW.topBarHeight + browserWindowPadding;
  const bottomInset = browserWindowPadding + BROWSER_WINDOW.borderWidth;

  return { bottomInset, horizontalInset, topInset };
}

function scaleRectFromCenter(rect: Rect, scale: number): Rect {
  const width = rect.width * scale;
  const height = rect.height * scale;

  return {
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
    width,
    height
  };
}

function getBrowserWindowPlacement(
  sourceWidth: number,
  sourceHeight: number,
  bounds: Rect,
  browserWindowPadding: number
): Placement {
  const { bottomInset, horizontalInset, topInset } = getBrowserInsets(browserWindowPadding);
  const maxContentBounds = {
    x: 0,
    y: 0,
    width: bounds.width - horizontalInset * 2,
    height: bounds.height - topInset - bottomInset
  } satisfies Rect;
  const contentRect = getFitRect(sourceWidth, sourceHeight, maxContentBounds);
  const windowWidth = contentRect.width + horizontalInset * 2;
  const windowHeight = contentRect.height + topInset + bottomInset;
  const browserRect = {
    x: bounds.x + (bounds.width - windowWidth) / 2,
    y: bounds.y + (bounds.height - windowHeight) / 2,
    width: windowWidth,
    height: windowHeight
  } satisfies Rect;

  return {
    browserWindowRect: browserRect,
    screenshotRect: {
      x: browserRect.x + horizontalInset,
      y: browserRect.y + topInset,
      width: contentRect.width,
      height: contentRect.height
    }
  };
}
