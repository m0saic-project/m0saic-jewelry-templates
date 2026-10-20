import type { MosaicEngineContext, MosaicSource, MosaicTemplate, MosaicTemplatePropDefinition } from "@m0saic/types";
import { bindProps, parseRegionsValue, regionRectsFromM0, resolveRegionsToPx } from "@m0saic/template-utils";
import type { LayoutConstraint, PropBindingEntry } from "@m0saic/template-utils";
import type { FileAsset } from "@m0saic/template-utils/dist/m0saic/assetPath";
import { minTextPx } from "./legible";
import { starterAsset } from "./starter";
import { budget, fitText, type Face } from "./text";

/**
 * MEDIA CONTROLS: every media input edits in place. The founder, 2026-10-19: "all media inputs should generally
 * accept image or video / and they ALL need a move prop binding such that user can resize and crop it / like a
 * setting for cover / contain / and then able to resize rect." So each media slot X of a version built on this
 * module takes
 *   - X: a photo OR a clip (a clip loops, muted);
 *   - `${X}Region`: one rect drawn on the preview (a regions picker, max 1). Set, the slot is drawn THERE instead
 *     of its place in the layout - resizing the rect is how the user crops. Empty keeps the layout's own rect;
 *   - `${X}Fit`: cover (fill the rect, crop the spill) or contain (all of it, the page around it): cover for a
 *     photo (the founder's default), contain where a crop would cut what matters (a logo, a finished render).
 * The rect that shows the slot carries all three handles: the drop target, the move glyph, the fit pick.
 *
 * And no clip art (founder, the same day): an EMPTY slot shows a photo or clip from the starter pack
 * (starter.ts) - the prop stays empty, the rect is still its drop target and the controls move it like the real
 * thing; decorative bundled art that is no media input is swapped for a pack photo, or left out where none fits.
 *
 * A version built here WRAPS the frozen one before it whole - its props, defaults, canvas, layout and render. The
 * render passes the controls down on the ctx (a private key); the kit's `finishDocument` and `imageAsset`
 * (jewel.ts) act on them only for the wrapped template's own id, so every other render - every shipped version,
 * and a template a mockup nests - is untouched. What a control acts on is found by its binding: the rects bound
 * to X ARE the slot (the media, or its stand-in: the wordmark for a logo), plus the pieces a version names as
 * part of it (`with`: the card behind the art, the ring around an avatar) - those move with it, in proportion.
 * Given the wrapped version's words and a file in every slot, it renders exactly as that version.
 */

export type MediaFit = "cover" | "contain";
export const MEDIA_FITS = ["cover", "contain"] as const;

export type MediaSlot = {
  /** The media prop. */
  key: string;
  /** The Fit prop's default. */
  fit: MediaFit;
  /** The starter-pack item (starter.ts) the slot shows while it is empty. */
  starter?: string;
  /** A prop that must be filled for the starter to show (a slot that is only drawn once its row has words). */
  starterWhen?: string;
  /** A prop that, filled, asks for something else in the empty slot (the template a frame nests): no starter then. */
  starterUnless?: string;
  /** Labels of pieces that are part of the slot without being bound to it; they move with it. */
  with?: string[];
  /**
   * Labels of pieces that ARE the slot's extent when they are drawn (the disc an avatar's initial sits on): the area
   * maps them onto the rect drawn, and what is bound inside them keeps its place in them.
   */
  frame?: string[];
  /**
   * A prop the wrapped version already has for this slot's fit (a template whose clips share one `fit` prop): the slot
   * gets no Fit prop of its own, that prop is bound on it as the pick, and the placement is left to the version.
   */
  fitProp?: string;
};

export const regionKey = (key: string) => `${key}Region`;
export const fitKey = (key: string) => `${key}Fit`;

/** The props a controlled version adds; the wrapped version's props type carries the rest. */
export type MediaControlProps = { [key: `${string}Region`]: unknown } & { [key: `${string}Fit`]: unknown };

/* ── the schema ── */

const REGION_DEF: MosaicTemplatePropDefinition = {
  type: "json",
  required: false,
  meta: { control: { picker: "regions", regions: { max: 1, shapes: ["rect"] } } },
} as MosaicTemplatePropDefinition;

const FIT_DEF: MosaicTemplatePropDefinition = {
  type: "string",
  required: false,
  meta: { constraints: { oneOf: [...MEDIA_FITS] } },
} as MosaicTemplatePropDefinition;

/** The wrapped schema with each slot taking a photo or a clip, and its Region and Fit right after it. */
export function mediaControlsSchema(schema: Record<string, MosaicTemplatePropDefinition>, slots: MediaSlot[]): Record<string, MosaicTemplatePropDefinition> {
  for (const s of slots) if (!schema[s.key]) throw new Error(`media-controls: no media prop "${s.key}" to control.`);
  const out: Record<string, MosaicTemplatePropDefinition> = {};
  for (const [key, def] of Object.entries(schema)) {
    const slot = slots.find((s) => s.key === key);
    if (!slot) {
      out[key] = def;
      continue;
    }
    const meta = (def.meta ?? {}) as { control?: Record<string, unknown> };
    out[key] = { ...def, meta: { ...meta, control: { ...(meta.control ?? {}), accept: ["image", "video"] } } } as MosaicTemplatePropDefinition;
    out[regionKey(key)] = REGION_DEF;
    if (!slot.fitProp) out[fitKey(key)] = FIT_DEF;
  }
  return out;
}

/**
 * Decorative bundled art that is no media input, by its piece's label: shown as a starter-pack photo or clip in
 * the same rect (cover-cropped), or - with no `starter`, where nothing in the pack fits - left out.
 */
export type MediaDecor = { label: string; starter?: string };

/** Each Fit's default. A Region has none (empty = the layout's rect). */
export function mediaControlsDefaults(slots: MediaSlot[]): Record<string, MediaFit> {
  return Object.fromEntries(slots.filter((s) => !s.fitProp).map((s) => [fitKey(s.key), s.fit]));
}

/** The wrapped version's roll call, with a slot that is not drawn at its defaults declaring its Region the same way. */
export function mediaControlsBindings<B extends { unbound?: Record<string, string> } | undefined>(bindings: B, slots: MediaSlot[]): B {
  const unbound = bindings?.unbound;
  if (!unbound) return bindings;
  const more = Object.fromEntries(slots.filter((s) => unbound[s.key]).map((s) => [regionKey(s.key), unbound[s.key]!]));
  return { ...bindings, unbound: { ...unbound, ...more } } as B;
}

/* ── the render ── */

type Regions = { canvas?: { w: number; h: number }; regions: Parameters<typeof resolveRegionsToPx>[0]["regions"]; m0?: string };
type ControlledSlot = { key: string; fit: MediaFit | null; fitProp: string | null; region: Regions | null; with: string[]; frame: string[] };
type ControlledDecor = { label: string; key: string | null; asset: FileAsset | null };
export type MediaControls = { id: string; forId: string; slots: ControlledSlot[]; decor: ControlledDecor[] };

const CONTROLS = Symbol.for("@jewelry/media-controls");

/** The controls a render carries for template `id` (the wrapped one), or null - every render but a controlled one. */
export function mediaControlsFor(ctx: MosaicEngineContext | undefined, id: string): MediaControls | null {
  const c = (ctx as unknown as Record<symbol, MediaControls | undefined> | undefined)?.[CONTROLS];
  return c && c.forId === id ? c : null;
}

/** A Region prop as drawn: null when empty; a malformed one is refused by name, with the reason. */
function pickRegion(id: string, value: unknown, name: string): Regions | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseRegionsValue(value);
  if (!parsed.ok) throw new Error(`${id}: ${name} is not a region - ${parsed.error}.`);
  if (parsed.m0) return { regions: [], m0: parsed.m0 };
  if (parsed.regions.length === 0) return null;
  if (parsed.regions.length > 1) throw new Error(`${id}: ${name} takes one rect (got ${parsed.regions.length}).`);
  return { ...(parsed.canvas ? { canvas: parsed.canvas } : {}), regions: parsed.regions };
}

function pickFit(id: string, value: unknown, fallback: MediaFit, name: string): MediaFit {
  if (value === undefined || value === null || value === "") return fallback;
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!(MEDIA_FITS as readonly string[]).includes(s)) throw new Error(`${id}: ${name} must be one of ${MEDIA_FITS.join(", ")}. Got ${JSON.stringify(value)}.`);
  return s as MediaFit;
}

const emptyMedia = (v: unknown) => v === undefined || v === null || (Array.isArray(v) && v.every((x) => String(x ?? "").trim() === ""));
const filled = (v: unknown) =>
  v !== undefined && v !== null && (typeof v === "object" ? Object.keys(v as object).length > 0 : String(v).trim() !== "" && String(v).trim() !== "{}");

/**
 * The render of a version that wraps `prev` with media controls: read the controls (a bad one is refused by name),
 * lay this version's `defaults` under the props (its own words, where they differ from `prev`'s), fill each empty
 * slot with its starter, then render `prev` carrying the controls. Its errors name this version.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWithMediaControls<P extends Record<string, any>>(prev: MosaicTemplate<any>, id: string, slots: MediaSlot[], opts: { defaults?: Record<string, unknown>; decor?: MediaDecor[] } = {}) {
  const forId = String(prev.id);
  return async function render(given: P, ctx: MosaicEngineContext) {
    const props: Record<string, unknown> = { ...(opts.defaults ?? {}) };
    for (const [k, v] of Object.entries(given)) if (v !== undefined) props[k] = v;
    for (const s of slots) {
      if (!s.starter || !emptyMedia(props[s.key])) continue;
      if (s.starterWhen && !filled(props[s.starterWhen])) continue;
      if (s.starterUnless && filled(props[s.starterUnless])) continue;
      const asset = starterAsset(s.starter);
      if (asset) props[s.key] = [asset.path];
    }
    const controls: MediaControls = {
      decor: (opts.decor ?? []).map((d) => ({ label: d.label, key: d.starter ?? null, asset: d.starter ? starterAsset(d.starter) : null })),
      id,
      forId,
      slots: slots.map((s) => ({
        key: s.key,
        fit: s.fitProp ? null : pickFit(id, props[fitKey(s.key)], s.fit, fitKey(s.key)),
        fitProp: s.fitProp ?? null,
        region: pickRegion(id, props[regionKey(s.key)], regionKey(s.key)),
        with: s.with ?? [],
        frame: s.frame ?? [],
      })),
    };
    try {
      return await prev.render(props as P, { ...ctx, [CONTROLS]: controls } as MosaicEngineContext);
    } catch (e) {
      throw new Error(String((e as Error)?.message ?? e).split(forId).join(id));
    }
  };
}

/* ── what finishDocument does with them ── */

type Rect = { x: number; y: number; w: number; h: number };
type Piece = { rect: Rect & { importance?: number }; source: MosaicSource };
type Assets = Record<string, { kind?: string; mediaType?: string } | undefined>;
type Binding = PropBindingEntry & Record<string, unknown>;
type Editable = { editor?: { binding?: Binding; bindings?: Binding[]; label?: string } & Record<string, unknown> };

const bindingsOf = (s: MosaicSource): Binding[] => {
  const e = (s as Editable).editor;
  if (Array.isArray(e?.bindings)) return e.bindings;
  return e?.binding ? [e.binding] : [];
};
const labelOf = (s: MosaicSource) => (s as Editable).editor?.label ?? "";
const boundTo = (s: MosaicSource, key: string) => bindingsOf(s).some((b) => b.propKey === key && !b.path && (b.index === undefined || b.index === 0));

/** The slot's media: its own file (never the bundled art, never a nested template) at the fit asked for; a clip loops, muted. */
function fitted(src: MosaicSource, slot: ControlledSlot, assets: Assets): MosaicSource {
  const s = src as MosaicSource & { type?: string; assetId?: string; mediaType?: string; placement?: { fit?: string } & Record<string, unknown>; playback?: unknown; audio?: unknown; loopMode?: unknown };
  const asset = s.type === "media" && s.assetId ? assets[s.assetId] : undefined;
  if (asset?.kind !== "file") return src;
  const out = { ...s } as typeof s;
  if (slot.fit && out.placement?.fit !== slot.fit) {
    out.placement = slot.fit === "cover" ? { fit: "cover", focusX: 0.5, focusY: 0.5 } : { fit: "contain", vAlign: "middle" };
  }
  if (asset.mediaType === "video") {
    out.mediaType = "video";
    // jewel.ts `mediaSource` wrote its loop at the top level, where nothing reads it: a clip's loop lives in `playback`.
    if (!out.playback) out.playback = { loopMode: out.loopMode === "once" ? "freeze" : "loop" };
    delete out.loopMode;
    if (!out.audio) out.audio = { enabled: false };
  }
  return out as MosaicSource;
}

/** The slot's handles beside the ones it has: the drop target stays first, then the move glyph and the fit pick. */
function withHandles(src: MosaicSource, slot: ControlledSlot): MosaicSource {
  const editor = { ...((src as Editable).editor ?? {}) };
  const entries = bindingsOf(src);
  delete editor.binding;
  const clone = { ...src, editor } as MosaicSource;
  const fit = slot.fitProp ?? (slot.fit ? fitKey(slot.key) : null);
  return bindProps(clone as { editor?: object }, [...entries, { propKey: regionKey(slot.key), kind: "rect" }, ...(fit ? [{ propKey: fit, kind: "choice" as const }] : [])]) as MosaicSource;
}

/** Words that moved are fitted again to their new rect, at the size the rect's height asks for and never under the floor. */
function refitted(src: MosaicSource, from: Rect, to: Rect, W: number, H: number): MosaicSource {
  const s = src as MosaicSource & { type?: string; layers?: Array<{ content?: { kind?: string; text?: string }; style?: { fontSize?: number; fontWeight?: string; fontStyle?: string } }> };
  const layer = s.type === "text" && s.layers?.length === 1 ? s.layers[0] : undefined;
  const text = layer?.content?.kind === "literal" ? layer.content.text : undefined;
  const px = layer?.style?.fontSize;
  if (!layer || !text || typeof px !== "number") return src;
  const face: Face = layer.style?.fontWeight === "bold" ? "bold" : layer.style?.fontStyle === "italic" ? "italic" : "regular";
  const floor = minTextPx(W, H);
  const want = Math.max(floor, Math.round((px * to.h) / Math.max(1, from.h)));
  const lines = text.split("\n");
  // At the floor and still too wide, fitText ellipsizes - a degrade, never words nobody can read (legible.ts).
  const fit = fitText(lines.join(" "), budget(to.w), to.h, want, floor, lines.length, face);
  return { ...s, layers: [{ ...layer, content: { ...layer.content, text: fit.lines.join("\n") }, style: { ...layer.style, fontSize: fit.px } }] } as MosaicSource;
}

/** The rect a Region names on this canvas, or null (empty, or entirely off it - the layout's rect then). */
function regionRect(r: Regions | null, W: number, H: number): Rect | null {
  if (!r) return null;
  if (r.m0) return regionRectsFromM0(r.m0, { width: W, height: H })[0] ?? null;
  const v = resolveRegionsToPx(r, { width: W, height: H })[0];
  return v && v.ok ? { x: v.x, y: v.y, w: v.w, h: v.h } : null;
}

/**
 * Apply a render's controls to its pieces, before they are placed: each slot's media takes its fit (a clip plays),
 * every rect of the slot carries its handles, and a drawn Region moves the slot - the rects bound to it map onto
 * the region, the pieces named with it keep their place around it. A moved piece is no longer held to the layout's
 * promises for it, so its constraints go.
 */
export function applyMediaControls(c: MediaControls, W: number, H: number, pieces: Piece[], assets: Assets, constraints: LayoutConstraint[]): { id: string; pieces: Piece[]; constraints: LayoutConstraint[] } {
  let out: Piece[] = pieces.map((p) => ({ rect: { ...p.rect }, source: p.source }));
  const moved = new Set<string>();
  // Decorative bundled art: a pack photo in its rect, or nothing.
  for (const d of c.decor) {
    const at = out.filter((p) => labelOf(p.source) === d.label);
    if (at.length === 0) continue;
    moved.add(d.label);
    if (!d.asset) {
      out = out.filter((p) => !at.includes(p));
      continue;
    }
    const assetId = `starter-${d.key}`;
    assets[assetId] = { ...d.asset };
    for (const p of at) p.source = decorSource(p.source, assetId, d.asset.mediaType);
  }
  const clampRect = (r: Rect): Rect => {
    const x = Math.max(0, Math.min(W - 1, Math.round(r.x)));
    const y = Math.max(0, Math.min(H - 1, Math.round(r.y)));
    return { x, y, w: Math.max(1, Math.min(W - x, Math.round(r.w))), h: Math.max(1, Math.min(H - y, Math.round(r.h))) };
  };
  for (const slot of c.slots) {
    const bound = out.filter((p) => boundTo(p.source, slot.key));
    if (bound.length === 0) continue;
    const frames = out.filter((p) => !bound.includes(p) && slot.frame.includes(labelOf(p.source)));
    const companions = out.filter((p) => !bound.includes(p) && !frames.includes(p) && slot.with.includes(labelOf(p.source)));
    for (const p of bound) p.source = withHandles(fitted(p.source, slot, assets), slot);
    const R = regionRect(slot.region, W, H);
    if (!R) continue;
    // The extent the area replaces: the slot's frame when one is drawn, else the rects bound to it.
    const extent = frames.length ? frames : bound;
    const x0 = Math.min(...extent.map((p) => p.rect.x));
    const y0 = Math.min(...extent.map((p) => p.rect.y));
    const bw = Math.max(1, Math.max(...extent.map((p) => p.rect.x + p.rect.w)) - x0);
    const bh = Math.max(1, Math.max(...extent.map((p) => p.rect.y + p.rect.h)) - y0);
    const sx = R.w / bw;
    const sy = R.h / bh;
    for (const p of [...bound, ...frames, ...companions]) {
      const from: Rect = { x: p.rect.x, y: p.rect.y, w: p.rect.w, h: p.rect.h };
      const to = clampRect({ x: R.x + (from.x - x0) * sx, y: R.y + (from.y - y0) * sy, w: from.w * sx, h: from.h * sy });
      p.rect = { ...to, ...(p.rect.importance !== undefined ? { importance: p.rect.importance } : {}) };
      p.source = refitted(p.source, from, to, W, H);
      const label = labelOf(p.source);
      if (label) moved.add(label);
    }
  }
  // Bundled art that nothing draws any more is no part of the document.
  const used = new Set(out.map((p) => (p.source as { assetId?: string }).assetId).filter(Boolean));
  for (const [k, a] of Object.entries(assets)) {
    if (a?.kind === "data-uri" && /\(bundled art\)$/.test(String((a as { displayName?: unknown }).displayName ?? "")) && !used.has(k)) delete assets[k];
  }
  const kept = moved.size ? constraints.filter((k) => !moved.has(String((k as { label?: unknown }).label ?? ""))) : constraints;
  return { id: c.id, pieces: out, constraints: kept };
}

/** A decorative piece as a pack photo or clip: cover-cropped to its rect, keeping its motion and its label. */
function decorSource(src: MosaicSource, assetId: string, kind: "image" | "video"): MosaicSource {
  const s = src as MosaicSource & { overlay?: unknown; editor?: unknown };
  return {
    type: "media",
    mediaType: kind,
    assetId,
    placement: { fit: "cover", focusX: 0.5, focusY: 0.5 },
    ...(kind === "video" ? { playback: { loopMode: "loop" }, audio: { enabled: false } } : {}),
    ...(s.overlay ? { overlay: s.overlay } : {}),
    ...(s.editor ? { editor: s.editor } : {}),
  } as unknown as MosaicSource;
}
