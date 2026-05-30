<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  type Placement = {
    browserWindowRect: Rect | null;
    screenshotRect: Rect;
  };

  const OUTPUT_WIDTH = 1920;
  const OUTPUT_HEIGHT = 1080;
  const EXPORT_SCALE = 2;

  const SCREENSHOT_SAFE_AREA = {
    x: 240,
    y: 170,
    width: 1440,
    height: 740
  } satisfies Rect;

  const BROWSER_WINDOW = {
    topBarHeight: 68,
    contentPadding: 0,
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

  const BACKGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 680 400"><path fill="#243b30" d="M0 0h110v115H0z"/><g stroke="#2e4a3c" stroke-linecap="round" stroke-width="1.3" opacity=".8"><path d="m-10 20 40-30M-10 40l60-50M-10 60l80-70M-10 80 90-10M-10 100 110-10M-10 120 110 10M10 120l100-90M30 120l80-70M50 120l60-50M70 120l40-30M90 120l20-10"/></g><path fill="#eaf4f0" d="M110 0h140v125H110z"/><g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="6" opacity=".55"><path d="M118 90q42-60 122-35"/><path d="M112 115q56-70 136-35"/><path d="M120 135q65-70 135-35"/></g><path fill="#5a8f75" d="M250 0h105v100H250z"/><g stroke="#3d6b56" stroke-linecap="round" stroke-width="2.8" opacity=".7"><path d="m265 13 13 13M278 13l-13 13M295 13l13 13M308 13l-13 13M325 13l13 13M338 13l-13 13M265 40l13 13M278 40l-13 13M295 40l13 13M308 40l-13 13M325 40l13 13M338 40l-13 13M265 67l13 13M278 67l-13 13M295 67l13 13M308 67l-13 13M325 67l13 13M338 67l-13 13"/></g><path fill="#c2ddd2" d="M355 0h115v110H355z"/><g stroke="#7db89e" stroke-linecap="round" stroke-width="5" opacity=".5"><path d="M372 5v100M390 5v100M408 5v100M426 5v100M444 5v100M462 5v100"/></g><path fill="#1a2e25" d="M470 0h110v120H470z"/><g stroke="#243b30" stroke-width=".9" opacity=".9"><path d="M470 20h110M470 40h110M470 60h110M470 80h110M470 100h110M490 0v120M510 0v120M530 0v120M550 0v120M570 0v120"/></g><path fill="#f2f8f5" d="M580 0h100v105H580z"/><g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="1.8" opacity=".7"><path d="M583 18q17-8 34 0t34 0 32 0M583 34q17-8 34 0t34 0 32 0M583 50q17-8 34 0t34 0 32 0M583 66q17-8 34 0t34 0 32 0M583 82q17-8 34 0t34 0 32 0M583 98q17-8 34 0t34 0 32 0"/></g><path fill="#dceee8" d="M0 115h145v135H0z"/><g fill="none" stroke="#7db89e" stroke-width="4" opacity=".5"><circle cx="32" cy="143" r="20"/><circle cx="75" cy="143" r="20"/><circle cx="118" cy="143" r="20"/><circle cx="32" cy="185" r="20"/><circle cx="75" cy="185" r="20"/><circle cx="118" cy="185" r="20"/><circle cx="32" cy="227" r="20"/><circle cx="75" cy="227" r="20"/><circle cx="118" cy="227" r="20"/></g><path fill="#4a7a63" d="M145 100h120v150H145z"/><g fill="none" stroke="#3d6b56" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" opacity=".65"><path d="m153 120 52-10 52 10M153 138l52-10 52 10M153 156l52-10 52 10M153 174l52-10 52 10M153 192l52-10 52 10M153 210l52-10 52 10M153 228l52-10 52 10M153 246l52-10 52 10"/></g><path fill="#f2f8f5" d="M265 105h125v140H265z"/><g fill="none" stroke="#a0cbb8" stroke-linecap="round" stroke-width="4" opacity=".6"><rect width="22" height="18" x="280" y="120" rx="2"/><rect width="22" height="18" x="313" y="120" rx="2"/><rect width="22" height="18" x="346" y="120" rx="2"/><rect width="22" height="18" x="280" y="150" rx="2"/><rect width="22" height="18" x="313" y="150" rx="2"/><rect width="22" height="18" x="346" y="150" rx="2"/><rect width="22" height="18" x="280" y="180" rx="2"/><rect width="22" height="18" x="313" y="180" rx="2"/><rect width="22" height="18" x="346" y="180" rx="2"/><rect width="22" height="18" x="280" y="210" rx="2"/><rect width="22" height="18" x="313" y="210" rx="2"/><rect width="22" height="18" x="346" y="210" rx="2"/></g><path fill="#2e4a3c" d="M390 110h105v130H390z"/><g fill="none" stroke="#3d6b56" stroke-linecap="round" stroke-width="1.4" opacity=".75"><path d="M398 128q17-8 34 2t34-2q14-10 29 0"/><path d="M398 146q14-10 32 2t36-2q15-10 29 0"/><path d="M398 164q16-10 33 2 18 12 36-3 15-11 28 1"/><path d="M398 182q18-10 35 2 18 12 36-3 14-11 26 1"/><path d="M398 200q15-10 33 2t36-3q15-11 28 1"/><path d="M398 218q17-10 35 2t35-3q15-11 27 1"/><path d="M398 236q16-10 34 2t36-3q14-11 27 1"/></g><path fill="#c2ddd2" d="M495 100h185v150H495z"/><g stroke="#7db89e" stroke-width=".9" opacity=".55"><path d="M495 116h185M495 131h185M495 146h185M495 161h185M495 176h185M495 191h185M495 206h185M495 221h185M495 236h185M510 100v150M525 100v150M540 100v150M555 100v150M570 100v150M585 100v150M600 100v150M615 100v150M630 100v150M645 100v150M660 100v150M675 100v150"/></g><path fill="#1a2e25" d="M0 250h155v150H0z"/><g fill="none" stroke="#2e4a3c" stroke-linecap="round" stroke-width="6" opacity=".75"><path d="M10 400q45-95 130-135"/><path d="M5 375q47-85 150-120M25 400q53-82 140-122M55 400q50-65 113-105"/></g><path fill="#5a8f75" d="M155 250h115v150H155z"/><g fill="#3d6b56" opacity=".65"><circle cx="175" cy="270" r="5.5"/><circle cx="202" cy="276" r="4"/><circle cx="228" cy="265" r="5.5"/><circle cx="250" cy="278" r="4.5"/><circle cx="170" cy="298" r="3.5"/><circle cx="197" cy="303" r="6"/><circle cx="222" cy="292" r="4.5"/><circle cx="248" cy="300" r="4"/><circle cx="182" cy="322" r="5"/><circle cx="208" cy="328" r="3.5"/><circle cx="233" cy="317" r="5.5"/><circle cx="255" cy="325" r="4.5"/><circle cx="170" cy="348" r="5.5"/><circle cx="196" cy="354" r="4"/><circle cx="220" cy="342" r="5"/><circle cx="247" cy="350" r="3.5"/><circle cx="180" cy="374" r="4.5"/><circle cx="206" cy="380" r="6"/><circle cx="230" cy="368" r="4"/><circle cx="252" cy="376" r="4.5"/></g><path fill="#eaf4f0" d="M270 245h140v155H270z"/><g stroke="#a0cbb8" stroke-linecap="round" stroke-width="6" opacity=".5"><path d="M275 263h130M275 281h130M275 299h130M275 317h130M275 335h130M275 353h130M275 371h130M275 389h130"/></g><path fill="#7db89e" d="M410 250h115v150H410z"/><g fill="none" stroke="#4a7a63" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" opacity=".6"><path d="m415 268 15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 288l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 308l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 328l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 348l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 368l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10M415 388l15-10 15 10 15-10 15 10 15-10 15 10 15-10 5 10"/></g><path fill="#3d6b56" d="M525 245h155v155H525z"/><g fill="none" stroke="#2e4a3c" stroke-width="2.2" opacity=".65"><path d="M525 400q45-65 90-105 33-30 65-40"/><path d="M525 400q37-50 70-84 37-36 85-46"/><path d="M525 400q29-35 53-58 36-37 102-54"/><path d="M525 400q21-22 37-35 34-35 118-57"/><path d="M525 400q13-8 23-15 28-30 132-57"/></g></svg>`;

  const BACKGROUND_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BACKGROUND_SVG)}`;

  let activeObjectUrl: string | null = null;
  let browserWindowRect: Rect | null = null;
  let browserWindowEnabled = true;
  let browserWindowScreenshotStyle = '';
  let browserWindowStyle = '';
  let errorMessage = '';
  let isExporting = false;
  let isLoading = false;
  let placement: Placement | null = null;
  let screenshotImage: HTMLImageElement | null = null;
  let screenshotRect: Rect | null = null;
  let screenshotStyle = '';
  let screenshotUrl: string | null = null;
  let statusMessage = 'Paste an image anywhere on this page, or upload one below.';

  $: placement = screenshotImage
    ? getPlacement(screenshotImage.naturalWidth, screenshotImage.naturalHeight, browserWindowEnabled)
    : null;
  $: browserWindowRect = placement?.browserWindowRect ?? null;
  $: browserWindowScreenshotStyle = browserWindowRect && screenshotRect
    ? toRelativePercentStyle(screenshotRect, browserWindowRect)
    : '';
  $: browserWindowStyle = browserWindowRect ? toBrowserWindowStyle(browserWindowRect) : '';
  $: screenshotRect = placement?.screenshotRect ?? null;
  $: screenshotStyle = screenshotRect ? toPercentStyle(screenshotRect) : '';

  onMount(() => {
    const pasteListener = (event: ClipboardEvent) => {
      void handlePaste(event);
    };

    window.addEventListener('paste', pasteListener);

    return () => {
      window.removeEventListener('paste', pasteListener);
    };
  });

  onDestroy(() => {
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
    }
  });

  function toPercentStyle(rect: Rect) {
    return [
      `left: ${(rect.x / OUTPUT_WIDTH) * 100}%`,
      `top: ${(rect.y / OUTPUT_HEIGHT) * 100}%`,
      `width: ${(rect.width / OUTPUT_WIDTH) * 100}%`,
      `height: ${(rect.height / OUTPUT_HEIGHT) * 100}%`
    ].join('; ');
  }

  function toRelativePercentStyle(rect: Rect, parentRect: Rect) {
    return [
      `left: ${((rect.x - parentRect.x) / parentRect.width) * 100}%`,
      `top: ${((rect.y - parentRect.y) / parentRect.height) * 100}%`,
      `width: ${(rect.width / parentRect.width) * 100}%`,
      `height: ${(rect.height / parentRect.height) * 100}%`
    ].join('; ');
  }

  function getFitRect(sourceWidth: number, sourceHeight: number, bounds: Rect): Rect {
    if (sourceWidth <= 0 || sourceHeight <= 0) {
      throw new Error('Image has no usable dimensions.');
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

  function getBrowserInsets() {
    const horizontalInset = BROWSER_WINDOW.contentPadding + BROWSER_WINDOW.borderWidth;
    const topInset = BROWSER_WINDOW.topBarHeight + BROWSER_WINDOW.contentPadding;
    const bottomInset = BROWSER_WINDOW.contentPadding + BROWSER_WINDOW.borderWidth;

    return { bottomInset, horizontalInset, topInset };
  }

  function getBrowserWindowPlacement(sourceWidth: number, sourceHeight: number): Placement {
    const { bottomInset, horizontalInset, topInset } = getBrowserInsets();
    const maxContentBounds = {
      x: 0,
      y: 0,
      width: SCREENSHOT_SAFE_AREA.width - horizontalInset * 2,
      height: SCREENSHOT_SAFE_AREA.height - topInset - bottomInset
    } satisfies Rect;
    const contentRect = getFitRect(sourceWidth, sourceHeight, maxContentBounds);
    const windowWidth = contentRect.width + horizontalInset * 2;
    const windowHeight = contentRect.height + topInset + bottomInset;
    const browserRect = {
      x: SCREENSHOT_SAFE_AREA.x + (SCREENSHOT_SAFE_AREA.width - windowWidth) / 2,
      y: SCREENSHOT_SAFE_AREA.y + (SCREENSHOT_SAFE_AREA.height - windowHeight) / 2,
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

  function getPlacement(
    sourceWidth: number,
    sourceHeight: number,
    useBrowserWindow: boolean
  ): Placement {
    if (useBrowserWindow) {
      return getBrowserWindowPlacement(sourceWidth, sourceHeight);
    }

    return {
      browserWindowRect: null,
      screenshotRect: getFitRect(sourceWidth, sourceHeight, SCREENSHOT_SAFE_AREA)
    };
  }

  function toBrowserWindowStyle(rect: Rect) {
    return [
      toPercentStyle(rect),
      `--top-bar-height: ${(BROWSER_WINDOW.topBarHeight / rect.height) * 100}%`,
      `--dot-size: ${((BROWSER_WINDOW.dotRadius * 2) / rect.width) * 100}%`,
      `--dot-gap: ${(BROWSER_WINDOW.dotGap / rect.width) * 100}%`,
      `--dot-left: ${(BROWSER_WINDOW.dotX / rect.width) * 100}%`
    ].join('; ');
  }

  function scaleRect(rect: Rect, scale: number): Rect {
    return {
      x: rect.x * scale,
      y: rect.y * scale,
      width: rect.width * scale,
      height: rect.height * scale
    };
  }

  function roundedRectPath(context: CanvasRenderingContext2D, rect: Rect, radius: number) {
    const cappedRadius = Math.min(radius, rect.width / 2, rect.height / 2);
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;

    context.beginPath();
    context.moveTo(rect.x + cappedRadius, rect.y);
    context.lineTo(right - cappedRadius, rect.y);
    context.quadraticCurveTo(right, rect.y, right, rect.y + cappedRadius);
    context.lineTo(right, bottom - cappedRadius);
    context.quadraticCurveTo(right, bottom, right - cappedRadius, bottom);
    context.lineTo(rect.x + cappedRadius, bottom);
    context.quadraticCurveTo(rect.x, bottom, rect.x, bottom - cappedRadius);
    context.lineTo(rect.x, rect.y + cappedRadius);
    context.quadraticCurveTo(rect.x, rect.y, rect.x + cappedRadius, rect.y);
    context.closePath();
  }

  function drawBrowserWindowBackground(context: CanvasRenderingContext2D, scale: number, windowRect: Rect) {
    const rect = scaleRect(windowRect, scale);
    const radius = BROWSER_WINDOW.borderRadius * scale;
    const topBarHeight = BROWSER_WINDOW.topBarHeight * scale;

    context.save();
    context.shadowBlur = BROWSER_WINDOW.shadowBlur * scale;
    context.shadowColor = BROWSER_WINDOW.shadowColor;
    context.shadowOffsetY = BROWSER_WINDOW.shadowOffsetY * scale;
    context.fillStyle = BROWSER_WINDOW.backgroundColor;
    roundedRectPath(context, rect, radius);
    context.fill();
    context.restore();

    context.save();
    roundedRectPath(context, rect, radius);
    context.clip();
    context.fillStyle = BROWSER_WINDOW.backgroundColor;
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = BROWSER_WINDOW.topBarColor;
    context.fillRect(rect.x, rect.y, rect.width, topBarHeight);
    context.restore();
  }

  function drawBrowserWindowChrome(context: CanvasRenderingContext2D, scale: number, windowRect: Rect) {
    const rect = scaleRect(windowRect, scale);
    const radius = BROWSER_WINDOW.borderRadius * scale;
    const topBarHeight = BROWSER_WINDOW.topBarHeight * scale;
    const borderWidth = BROWSER_WINDOW.borderWidth * scale;

    context.save();
    roundedRectPath(context, rect, radius);
    context.clip();
    context.fillStyle = BROWSER_WINDOW.separatorColor;
    context.fillRect(rect.x, rect.y + topBarHeight, rect.width, Math.max(1, scale));
    context.restore();

    context.save();
    context.lineWidth = borderWidth;
    context.strokeStyle = BROWSER_WINDOW.borderColor;
    roundedRectPath(context, rect, radius);
    context.stroke();
    context.restore();

    const dotColors = ['#ff5f57', '#ffbd2e', '#28c840'];
    const dotY = rect.y + BROWSER_WINDOW.dotY * scale;
    const dotStartX = rect.x + BROWSER_WINDOW.dotX * scale;
    const dotStep = (BROWSER_WINDOW.dotRadius * 2 + BROWSER_WINDOW.dotGap) * scale;

    dotColors.forEach((color, index) => {
      context.beginPath();
      context.fillStyle = color;
      context.arc(dotStartX + dotStep * index, dotY, BROWSER_WINDOW.dotRadius * scale, 0, Math.PI * 2);
      context.fill();
    });
  }

  function drawScreenshotImage(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    rect: Rect,
    scale: number,
    clipRect: Rect | null
  ) {
    context.save();

    if (clipRect) {
      roundedRectPath(context, scaleRect(clipRect, scale), BROWSER_WINDOW.borderRadius * scale);
      context.clip();
    }

    context.drawImage(
      image,
      rect.x * scale,
      rect.y * scale,
      rect.width * scale,
      rect.height * scale
    );
    context.restore();
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          reject(new Error('Image loaded without usable dimensions.'));
          return;
        }

        resolve(image);
      };
      image.onerror = () => reject(new Error('Failed to load image.'));
      image.src = src;
    });
  }

  function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('The browser did not return PNG data.'));
            return;
          }

          resolve(blob);
        }, 'image/png');
      } catch (error) {
        reject(error instanceof Error ? error : new Error('PNG export failed.'));
      }
    });
  }

  async function handleIncomingFile(file: File, sourceLabel: string) {
    if (!file.type.startsWith('image/')) {
      errorMessage = `${sourceLabel} is not a supported image file.`;
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    errorMessage = '';
    isLoading = true;
    statusMessage = 'Loading screenshot...';

    try {
      const loadedImage = await loadImage(objectUrl);
      getPlacement(loadedImage.naturalWidth, loadedImage.naturalHeight, browserWindowEnabled);

      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }

      activeObjectUrl = objectUrl;
      screenshotImage = loadedImage;
      screenshotUrl = objectUrl;
      statusMessage = `${sourceLabel} loaded at ${loadedImage.naturalWidth} x ${loadedImage.naturalHeight}. Export size: ${OUTPUT_WIDTH * EXPORT_SCALE} x ${OUTPUT_HEIGHT * EXPORT_SCALE}px.`;
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      errorMessage = error instanceof Error ? error.message : 'Failed to load that image.';
      statusMessage = 'Try pasting or uploading a different screenshot.';
    } finally {
      isLoading = false;
    }
  }

  async function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;

    if (!items || items.length === 0) {
      errorMessage = 'Clipboard did not include any readable contents.';
      return;
    }

    let pastedFile: File | null = null;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (item.kind === 'file' && item.type.startsWith('image/')) {
        pastedFile = item.getAsFile();
        break;
      }
    }

    if (!pastedFile) {
      errorMessage = 'Clipboard did not contain a supported image. Copy the image itself, then paste here.';
      return;
    }

    event.preventDefault();
    await handleIncomingFile(pastedFile, 'Pasted screenshot');
  }

  function handleUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    void handleIncomingFile(file, 'Uploaded screenshot');
    input.value = '';
  }

  async function downloadPng() {
    const currentBrowserWindowRect = browserWindowRect;
    const currentScreenshotRect = screenshotRect;

    if (!screenshotImage || !currentScreenshotRect) {
      errorMessage = 'Paste or upload a screenshot before downloading.';
      return;
    }

    errorMessage = '';
    isExporting = true;
    statusMessage = 'Rendering PNG in your browser...';

    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_WIDTH * EXPORT_SCALE;
      canvas.height = OUTPUT_HEIGHT * EXPORT_SCALE;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas is not available in this browser.');
      }

      const backgroundImage = await loadImage(BACKGROUND_DATA_URL);

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      if (browserWindowEnabled && currentBrowserWindowRect) {
        drawBrowserWindowBackground(context, EXPORT_SCALE, currentBrowserWindowRect);
        drawScreenshotImage(
          context,
          screenshotImage,
          currentScreenshotRect,
          EXPORT_SCALE,
          currentBrowserWindowRect
        );
        drawBrowserWindowChrome(context, EXPORT_SCALE, currentBrowserWindowRect);
      } else {
        drawScreenshotImage(context, screenshotImage, currentScreenshotRect, EXPORT_SCALE, null);
      }

      const blob = await canvasToBlob(canvas);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = 'fossa-docs-screenshot.png';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      statusMessage = `Downloaded ${canvas.width} x ${canvas.height}px PNG.`;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to export PNG.';
      statusMessage = 'PNG export failed. Try another screenshot or browser.';
    } finally {
      isExporting = false;
    }
  }
</script>

<svelte:head>
  <title>FOSSA Docs Screenshot Generator</title>
  <meta
    name="description"
    content="Paste or upload a product screenshot and export a composed docs image."
  />
</svelte:head>

<div class="page">
  <header class="hero">
    <div>
      <p class="eyebrow">FOSSA docs image tool</p>
      <h1>Paste a product screenshot. Download a docs-ready PNG.</h1>
    </div>
    <p class="intro">
      The browser composes your screenshot over the standard background, preserving aspect ratio and
      centering it inside the safe area.
    </p>
  </header>

  <main class="workspace">
    <section class="controls" aria-label="Screenshot controls">
      <div class="control-block">
        <p class="label">Input</p>
        <p class="hint">Copy an image and press <kbd>Cmd</kbd> + <kbd>V</kbd> or use upload.</p>
      </div>

      <label class="upload-button">
        <input accept="image/*" onchange={handleUpload} type="file" />
        Upload screenshot
      </label>

      <label class="toggle-row">
        <input bind:checked={browserWindowEnabled} type="checkbox" />
        <span>
          <strong>Browser window</strong>
          <small>Wrap the screenshot in a simple macOS-style frame.</small>
        </span>
      </label>

      <button
        class="download-button"
        disabled={!screenshotImage || isLoading || isExporting}
        onclick={downloadPng}
        type="button"
      >
        {isExporting ? 'Exporting...' : 'Download PNG'}
      </button>

      <div class="specs" aria-label="Composition settings">
        <p><strong>Base:</strong> {OUTPUT_WIDTH} x {OUTPUT_HEIGHT}px</p>
        <p><strong>Export:</strong> {OUTPUT_WIDTH * EXPORT_SCALE} x {OUTPUT_HEIGHT * EXPORT_SCALE}px</p>
        <p>
          <strong>Safe area:</strong> {SCREENSHOT_SAFE_AREA.width} x {SCREENSHOT_SAFE_AREA.height}px
        </p>
        <p><strong>Window:</strong> {browserWindowEnabled ? 'On' : 'Off'}</p>
      </div>

      <p class="status" aria-live="polite">{statusMessage}</p>
      {#if errorMessage}
        <p class="error" role="alert">{errorMessage}</p>
      {/if}
    </section>

    <section class="preview-card" aria-label="Generated image preview">
      <div class="preview-header">
        <p>Preview</p>
        <span>{screenshotImage ? 'Screenshot placed' : 'Waiting for image'}</span>
      </div>

      <div class="stage" style={`aspect-ratio: ${OUTPUT_WIDTH} / ${OUTPUT_HEIGHT};`}>
        <img class="background" src={BACKGROUND_DATA_URL} alt="" />

        {#if screenshotUrl && screenshotRect}
          {#if browserWindowEnabled && browserWindowRect}
            <div class="browser-window" style={browserWindowStyle}>
              <div class="browser-top-bar">
                <span class="browser-dot red"></span>
                <span class="browser-dot yellow"></span>
                <span class="browser-dot green"></span>
              </div>
              <img
                class="screenshot"
                src={screenshotUrl}
                alt="Selected product screenshot preview"
                style={browserWindowScreenshotStyle}
              />
            </div>
          {:else}
            <img
              class="screenshot"
              src={screenshotUrl}
              alt="Selected product screenshot preview"
              style={screenshotStyle}
            />
          {/if}
        {:else}
          <div class="empty-state">
            <strong>No screenshot yet</strong>
            <span>Paste from your clipboard or upload an image file.</span>
          </div>
        {/if}
      </div>
    </section>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    background: #edf4ef;
    color: #14241c;
    font-family: Avenir Next, Segoe UI, sans-serif;
  }

  :global(body) {
    margin: 0;
  }

  :global(button),
  :global(input) {
    font: inherit;
  }

  .page {
    min-height: 100vh;
    padding: clamp(20px, 4vw, 56px);
    background:
      radial-gradient(circle at 15% 0%, rgba(125, 184, 158, 0.28), transparent 34rem),
      linear-gradient(135deg, #f7fbf8 0%, #e5f0e9 100%);
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
    gap: 24px;
    margin: 0 auto 28px;
    max-width: 1220px;
  }

  .eyebrow {
    color: #4a7a63;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    margin: 0 0 10px;
    text-transform: uppercase;
  }

  h1 {
    font-size: clamp(2.1rem, 5vw, 4.8rem);
    letter-spacing: -0.055em;
    line-height: 0.95;
    margin: 0;
    max-width: 820px;
  }

  .intro {
    align-self: end;
    color: #395546;
    font-size: clamp(1rem, 1.6vw, 1.2rem);
    line-height: 1.55;
    margin: 0;
  }

  .workspace {
    align-items: start;
    display: grid;
    gap: 22px;
    grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
    margin: 0 auto;
    max-width: 1220px;
  }

  .controls,
  .preview-card {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(36, 59, 48, 0.12);
    border-radius: 24px;
    box-shadow: 0 24px 70px rgba(26, 46, 37, 0.13);
  }

  .controls {
    display: grid;
    gap: 16px;
    padding: 22px;
  }

  .control-block {
    border-bottom: 1px solid rgba(36, 59, 48, 0.11);
    padding-bottom: 14px;
  }

  .label,
  .preview-header p {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0 0 6px;
    text-transform: uppercase;
  }

  .hint,
  .status,
  .specs,
  .error {
    color: #4d6358;
    font-size: 0.94rem;
    line-height: 1.5;
    margin: 0;
  }

  kbd {
    background: #f6faf7;
    border: 1px solid rgba(36, 59, 48, 0.18);
    border-radius: 7px;
    box-shadow: 0 1px 0 rgba(36, 59, 48, 0.18);
    color: #1a2e25;
    display: inline-block;
    font-size: 0.82em;
    font-weight: 700;
    line-height: 1;
    padding: 4px 7px;
  }

  .upload-button,
  .download-button {
    align-items: center;
    border: 0;
    border-radius: 16px;
    cursor: pointer;
    display: inline-flex;
    font-weight: 800;
    justify-content: center;
    min-height: 50px;
    padding: 0 18px;
  }

  .upload-button {
    background: #1a2e25;
    color: #f7fbf8;
  }

  .upload-button input {
    height: 1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 1px;
  }

  .toggle-row {
    align-items: center;
    background: rgba(234, 244, 240, 0.72);
    border: 1px solid rgba(36, 59, 48, 0.12);
    border-radius: 16px;
    cursor: pointer;
    display: grid;
    gap: 12px;
    grid-template-columns: auto 1fr;
    padding: 13px 14px;
  }

  .toggle-row input {
    accent-color: #4a7a63;
    height: 20px;
    width: 20px;
  }

  .toggle-row span {
    display: grid;
    gap: 2px;
  }

  .toggle-row strong {
    color: #14241c;
  }

  .toggle-row small {
    color: #5b7467;
    line-height: 1.35;
  }

  .download-button {
    background: #7db89e;
    color: #0e1c16;
  }

  .download-button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .specs {
    background: rgba(234, 244, 240, 0.82);
    border-radius: 16px;
    padding: 13px 14px;
  }

  .specs p {
    margin: 0;
  }

  .specs p + p {
    margin-top: 6px;
  }

  .error {
    background: #fff3ef;
    border: 1px solid #f0b29e;
    border-radius: 14px;
    color: #8b321c;
    padding: 11px 13px;
  }

  .preview-card {
    min-width: 0;
    padding: 16px;
  }

  .preview-header {
    align-items: center;
    color: #395546;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .preview-header p {
    color: #14241c;
    margin-bottom: 0;
  }

  .preview-header span {
    color: #5b7467;
    font-size: 0.9rem;
  }

  .stage {
    background: transparent;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .background,
  .browser-window,
  .screenshot {
    display: block;
    position: absolute;
  }

  .background {
    height: 100%;
    inset: 0;
    object-fit: fill;
    width: 100%;
  }

  .browser-window {
    background: #f8fbf9;
    border: 0;
    border-radius: clamp(3px, 0.42vw, 8px);
    box-shadow:
      inset 0 0 0 1px rgba(26, 46, 37, 0.32),
      0 clamp(10px, 2.4vw, 30px) clamp(24px, 4.8vw, 60px) rgba(14, 28, 22, 0.28);
    overflow: hidden;
    z-index: 1;
  }

  .browser-top-bar {
    align-items: center;
    background: #eaf4f0;
    border-bottom: 1px solid rgba(26, 46, 37, 0.12);
    display: flex;
    gap: var(--dot-gap);
    height: var(--top-bar-height);
    padding-left: var(--dot-left);
    position: relative;
    z-index: 3;
  }

  .browser-dot {
    aspect-ratio: 1;
    border-radius: 999px;
    display: block;
    width: clamp(5px, var(--dot-size), 18px);
  }

  .browser-dot.red {
    background: #ff5f57;
  }

  .browser-dot.yellow {
    background: #ffbd2e;
  }

  .browser-dot.green {
    background: #28c840;
  }

  .screenshot {
    object-fit: fill;
    z-index: 2;
  }

  .empty-state {
    align-items: center;
    background: rgba(234, 244, 240, 0.86);
    border: 1px dashed rgba(36, 59, 48, 0.35);
    border-radius: 16px;
    color: #395546;
    display: flex;
    flex-direction: column;
    gap: 6px;
    left: 50%;
    padding: 22px;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(70%, 360px);
  }

  .empty-state strong {
    color: #14241c;
  }

  @media (max-width: 900px) {
    .hero,
    .workspace {
      grid-template-columns: 1fr;
    }

    .intro {
      align-self: start;
    }
  }

  @media (max-width: 560px) {
    .page {
      padding: 16px;
    }

    .controls,
    .preview-card {
      border-radius: 18px;
    }

    .preview-card {
      padding: 10px;
    }

    .preview-header {
      align-items: start;
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
