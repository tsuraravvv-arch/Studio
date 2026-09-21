# Crop Studio

Route: `/tools/crop-studio/`. All image decoding, preview rendering, and export happen locally in the browser. No image requests, persistence, or additional runtime dependencies.

- `presets.ts`: service presets, output-pixel safe-area rectangles, and ratio choices. X's safe area is a conservative composition suggestion, not a device-specific guarantee.
- `crop.ts`: output-pixel transforms, rotation-aware Fill/Fit, shared preview/export renderer, validation, and encoding. A scale of 1 is 100% of source resolution. Flip axes are image-local, before rotation.
- `CropCanvas.tsx`: bounded preview canvas, guide overlays, pointer drag/pinch, cursor-anchored wheel zoom, and focused keyboard movement. Snap uses a six-screen-pixel threshold around the image center; keyboard/button nudges bypass it.
- `CropStudioPage.tsx`: local file lifecycle, size selection, editing controls, download. Header, footer, uploader, base design, and download helper are reused from the splitter without modifying it.
- `crop-studio.module.css`: scoped additions; no global changes to the splitter.

Size changes reset placement, rotation, and flips to cover the new output. Ratio mode derives the integer height from the chosen width. Invalid drafts preserve the last valid preview and disable export. Outputs are limited to 8192px per side and 32 million pixels for browser memory; failed allocations/encodes are reported. The preview is capped at 1600px on its longest side; export uses the requested resolution. JPEG composites transparency on white, including transparent pixels inside the source image. Guides never enter the renderer.

## Verification

Run `npm run dev`, then `node scripts/test-crop-studio.mjs` with Playwright available. If it is supplied by a local tooling runtime, set `PLAYWRIGHT_MODULE` to that runtime's Playwright package directory. No project dependency is required. `TEST_BASE_URL` overrides the server URL, and `TEST_ARTIFACTS` enables desktop/mobile screenshots.

The script covers rotated Fill/Fit geometry, all input/output formats, pixel-checked flips/rotation/backgrounds, output sizes above/below source, snapping and nudging, wheel/pinch, presets/ratios, invalid input, mobile overflow, console/network checks, and the existing splitter's 2/4-panel output. Also run `npm run lint` and `npm run build` (the existing site's Google Fonts require network access during build).
