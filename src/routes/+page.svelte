<script lang="ts">
  import {
    BACKGROUND_DATA_URL,
    BROWSER_WINDOW,
    EXPORT_SCALE,
    OUTPUT_HEIGHT,
    OUTPUT_WIDTH,
    SCREENSHOT_SIZE,
    SCREENSHOT_SAFE_AREA,
    getPlacement,
    scaleRect,
    type Placement,
    type Rect
  } from '$lib/screenshot-composition';
  import { onDestroy, onMount } from 'svelte';

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
  let screenshotSize = SCREENSHOT_SIZE.defaultPercent / 100;
  let screenshotSizePercent = SCREENSHOT_SIZE.defaultPercent;
  let screenshotStyle = '';
  let screenshotUrl: string | null = null;
  let statusMessage = 'Paste an image anywhere on this page, or upload one below.';

  $: screenshotSize = screenshotSizePercent / 100;
  $: placement = screenshotImage
    ? getPlacement(
        screenshotImage.naturalWidth,
        screenshotImage.naturalHeight,
        browserWindowEnabled,
        screenshotSize
      )
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

  function toBrowserWindowStyle(rect: Rect) {
    return [
      toPercentStyle(rect),
      `--top-bar-height: ${(BROWSER_WINDOW.topBarHeight / rect.height) * 100}%`,
      `--dot-size: ${((BROWSER_WINDOW.dotRadius * 2) / rect.width) * 100}%`,
      `--dot-gap: ${(BROWSER_WINDOW.dotGap / rect.width) * 100}%`,
      `--dot-left: ${(BROWSER_WINDOW.dotX / rect.width) * 100}%`
    ].join('; ');
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
      getPlacement(loadedImage.naturalWidth, loadedImage.naturalHeight, browserWindowEnabled, screenshotSize);

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

      <label class="slider-row">
        <span class="slider-label">
          <span>
            <strong>Screenshot size</strong>
            <small>Adjust how much of the background the screenshot fills.</small>
          </span>
          <strong class="slider-value">{screenshotSizePercent}%</strong>
        </span>
        <input
          bind:value={screenshotSizePercent}
          max={SCREENSHOT_SIZE.maxPercent}
          min={SCREENSHOT_SIZE.minPercent}
          step={SCREENSHOT_SIZE.stepPercent}
          type="range"
        />
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
        <p><strong>Screenshot size:</strong> {screenshotSizePercent}%</p>
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

  .slider-row {
    background: rgba(234, 244, 240, 0.72);
    border: 1px solid rgba(36, 59, 48, 0.12);
    border-radius: 16px;
    display: grid;
    gap: 12px;
    padding: 13px 14px;
  }

  .slider-label {
    align-items: start;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  .toggle-row input {
    accent-color: #4a7a63;
    height: 20px;
    width: 20px;
  }

  .slider-row input {
    accent-color: #4a7a63;
    width: 100%;
  }

  .toggle-row span,
  .slider-label span {
    display: grid;
    gap: 2px;
  }

  .toggle-row strong,
  .slider-row strong {
    color: #14241c;
  }

  .slider-value {
    color: #4a7a63;
    white-space: nowrap;
  }

  .toggle-row small,
  .slider-row small {
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
    box-shadow: 0 clamp(10px, 2.4vw, 30px) clamp(24px, 4.8vw, 60px) rgba(14, 28, 22, 0.28);
    overflow: hidden;
    z-index: 1;
  }

  .browser-window::after {
    border: 1px solid rgba(26, 46, 37, 0.32);
    border-radius: inherit;
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: 4;
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
