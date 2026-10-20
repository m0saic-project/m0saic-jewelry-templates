/**
 * THE LEGIBILITY FLOOR. The founder, on round 3 of the reference field (2026-10-16): "if the text is under a
 * certain size relative to the canvas that template is in, which covers if it's being nested, then that is
 * basically a violation". So: no line of text under 1/45 of the canvas's short side - 24 px at 1080, 16 at
 * 720, 48 at 2160 - and a NESTED render counts its text at the size it lands in the outer canvas (the field
 * driver multiplies a leaf's text by the scale its frame draws it at: tools/reference-field.mjs).
 *
 * Calibrated on round 3's ratings: the renders whose smallest text sat at 13-17 px on a 1080 canvas scored 1-2
 * ("some of the text can't be read at all"); the 4s and 5s sat at 24-28 px.
 *
 * A layout meets the floor by giving words room, and when they still do not fit, by leaving the least of them
 * out (fine print first) - never by setting them smaller.
 */
export const MIN_TEXT_FRAC = 1 / 45;

/** The smallest font size, in px, a canvas of W x H may draw. */
export function minTextPx(W: number, H: number): number {
  return Math.ceil(Math.min(W, H) * MIN_TEXT_FRAC);
}

export type TextSize = { px: number; label: string; text: string };

/** Every drawn run of text in a document - or in each step of a pipeline - smallest first. */
export function textSizes(renderable: unknown): TextSize[] {
  const out: TextSize[] = [];
  const walk = (node: unknown, label: string): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const x of node) walk(x, label);
      return;
    }
    const n = node as { type?: unknown; layers?: unknown; editor?: { label?: unknown } };
    const here = typeof n.editor?.label === "string" ? n.editor.label : label;
    if (n.type === "text" && Array.isArray(n.layers)) {
      for (const l of n.layers as Array<{ content?: { text?: unknown }; style?: { fontSize?: unknown } }>) {
        const text = l?.content?.text;
        const px = l?.style?.fontSize;
        if (typeof text === "string" && text.trim() && typeof px === "number") out.push({ px, label: here, text });
      }
      return;
    }
    for (const v of Object.values(node)) walk(v, here);
  };
  const r = renderable as { kind?: string; steps?: Array<{ file?: unknown }>; sources?: unknown };
  if (r?.kind === "mosaic_pipeline" && Array.isArray(r.steps)) for (const s of r.steps) walk((s.file as { sources?: unknown })?.sources, "");
  else walk(r?.sources ?? r, "");
  return out.sort((a, b) => a.px - b.px);
}

/** The runs of text under the floor of a W x H canvas (empty when it is legible). */
export function illegibleText(renderable: unknown, W: number, H: number, scale = 1): TextSize[] {
  const floor = minTextPx(W, H);
  return textSizes(renderable).filter((t) => t.px * scale < floor - 1e-6);
}
