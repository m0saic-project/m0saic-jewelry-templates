import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicOverlayExpr,
  MosaicSource,
} from "@m0saic/types";
import { asAssetId } from "@m0saic/types";
import {
  bindProp,
  bindProps,
  composeMotion,
  entrance,
  exit,
  makeColorTile,
  placeInsetPieces,
  tag,
} from "@m0saic/template-utils";
import type { EntranceKind, LayoutConstraint } from "@m0saic/template-utils";
import { toM0String } from "@m0saic/dsl-stdlib";
import { textFitsMeasured, withLayoutIntent } from "./layout";
import { applyMediaControls, mediaControlsFor } from "./media-controls";
import { budget, cleanCopy, fitText, type TextFit } from "./text";

/**
 * The jewelry kit: what every template in this repo shares so each one can
 * be short. The pack is a VERTICAL - one industry, many recurring media
 * jobs - and the things that make a clip read as "fine jewelry" are the
 * same across all of them: the ivory / noir / velvet / blush pages, a metal
 * tone, a serif-feeling restraint (small caps kickers, generous margins), a
 * brand wordmark or logo on every frame, and a thin progress line.
 *
 * Nothing here is a template. It is the vocabulary: platforms (the canvas
 * as a knob), themes (the page and ink pairs), metals and stones (the
 * tints the bundled art takes), prop pickers (the gate every render runs),
 * colour math, text sources, the chrome, and beat timing.
 */

/* ── platforms: where the clip goes, as the canvas it wants ── */

export const JEWEL_PLATFORMS = {
  /** 9:16 - Stories, Reels, TikTok. */
  story: { width: 1080, height: 1920 },
  /** 4:5 - a portrait feed post. */
  feed: { width: 1080, height: 1350 },
  /** 1:1 - feed, Pinterest, an email tile. */
  square: { width: 1080, height: 1080 },
  /** 16:9 - a web banner, a player, an in-store screen. */
  landscape: { width: 1920, height: 1080 },
  /** 2:1 - an email hero at 2x. */
  email: { width: 1200, height: 600 },
} as const;
export type JewelPlatform = keyof typeof JEWEL_PLATFORMS;
export const JEWEL_PLATFORM_KEYS = Object.keys(JEWEL_PLATFORMS) as JewelPlatform[];

/* ── themes: the page and the ink ── */

export const JEWEL_THEMES = ["ivory", "noir", "velvet", "blush"] as const;
export type JewelTheme = (typeof JEWEL_THEMES)[number];

/** The page / text pair each theme starts from; `background` / `ink` override either half. */
export const JEWEL_THEME_COLORS: Record<JewelTheme, { background: string; ink: string }> = {
  /** Warm paper, near-black text - the "product on white" convention. */
  ivory: { background: "#f6f1ea", ink: "#1d1a17" },
  /** Near-black, warm light text - the "product on black" convention. */
  noir: { background: "#121010", ink: "#f3ede4" },
  /** Deep blue velvet, ivory text - the ring-box lining. */
  velvet: { background: "#141f3a", ink: "#f4efe6" },
  /** Blush paper, deep brown text - bridal and rose gold. */
  blush: { background: "#f7ebe6", ink: "#2b1f1f" },
};

/* ── metals and stones: the tints the bundled art takes ── */

export const JEWEL_METALS = ["gold", "rose", "white", "platinum"] as const;
export type JewelMetal = (typeof JEWEL_METALS)[number];

export const JEWEL_METAL_COLORS: Record<JewelMetal, { base: string; light: string; dark: string }> = {
  gold: { base: "#d4af37", light: "#f1dc8a", dark: "#8f6f1c" },
  rose: { base: "#c98a7a", light: "#efc3b5", dark: "#8b5447" },
  white: { base: "#d6d8dd", light: "#f6f7f9", dark: "#8d9199" },
  platinum: { base: "#c9ccd1", light: "#eef0f3", dark: "#7f848b" },
};

export const JEWEL_STONES = ["diamond", "sapphire", "ruby", "emerald", "amethyst", "aquamarine", "pearl", "morganite", "citrine", "garnet", "peridot", "opal", "topaz", "tanzanite"] as const;
export type JewelStone = (typeof JEWEL_STONES)[number];

export const JEWEL_STONE_COLORS: Record<JewelStone, { base: string; light: string; dark: string }> = {
  diamond: { base: "#dfe9f3", light: "#ffffff", dark: "#9fb3c8" },
  sapphire: { base: "#1f4fa3", light: "#6f9be0", dark: "#0f2a5e" },
  ruby: { base: "#b3122e", light: "#e8607a", dark: "#6b0a1c" },
  emerald: { base: "#1a7a4a", light: "#5fc08c", dark: "#0d4a2b" },
  amethyst: { base: "#7a4fb3", light: "#b494e0", dark: "#482a70" },
  aquamarine: { base: "#6fc3d6", light: "#b6e6ef", dark: "#3a8a9c" },
  pearl: { base: "#f1ece4", light: "#ffffff", dark: "#c9bfae" },
  morganite: { base: "#e8a9a0", light: "#f7d3cc", dark: "#b7746b" },
  citrine: { base: "#e3a82a", light: "#f6d57a", dark: "#9c6f12" },
  garnet: { base: "#8a1a2b", light: "#c75a6a", dark: "#4f0d18" },
  peridot: { base: "#9fc23a", light: "#cfe38a", dark: "#5f7a1c" },
  opal: { base: "#e9e6f2", light: "#ffffff", dark: "#b7b1cf" },
  topaz: { base: "#3aa0d8", light: "#9ad2ef", dark: "#1f6a94" },
  tanzanite: { base: "#4a4fb3", light: "#9397e0", dark: "#2a2d70" },
};

/** The birthstone of each month, 1..12 (the traditional list). */
export const BIRTHSTONES: Record<number, JewelStone> = {
  1: "garnet",
  2: "amethyst",
  3: "aquamarine",
  4: "diamond",
  5: "emerald",
  6: "pearl",
  7: "ruby",
  8: "peridot",
  9: "sapphire",
  10: "opal",
  11: "topaz",
  12: "tanzanite",
};

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** One line of lore per stone - the body a birthstone template draws when the jeweler types nothing. */
export const STONE_LORE: Record<JewelStone, string> = {
  garnet: "Garnet, the stone of January: protection on every journey.",
  amethyst: "Amethyst, the stone of February: calm, clarity and a clear head.",
  aquamarine: "Aquamarine, the stone of March: the colour of calm seas.",
  diamond: "Diamond, the stone of April: the hardest thing there is, and the brightest.",
  emerald: "Emerald, the stone of May: new growth, and a green no other stone has.",
  pearl: "Pearl, the stone of June: the only gem made by a living thing.",
  ruby: "Ruby, the stone of July: the king of gems, and the colour of the heart.",
  peridot: "Peridot, the stone of August: born in volcanoes, bright as summer.",
  sapphire: "Sapphire, the stone of September: wisdom, loyalty and a royal blue.",
  opal: "Opal, the stone of October: every colour at once.",
  topaz: "Topaz, the stone of November: warmth for the turn of the year.",
  tanzanite: "Tanzanite, the stone of December: found in one place on earth.",
  morganite: "Morganite: a blush-pink beryl, the colour of first light.",
  citrine: "Citrine: bottled sunshine, the merchant's stone.",
};

/** The accent most jewelry templates start from: champagne gold. */
export const JEWEL_DEFAULT_ACCENT = "#b8955a";

/* ── pickers: the schema is documentation, render() is the gate ── */

const HEX = /^#[0-9a-fA-F]{6}$/;

/** undefined = the default, "" = removed. */
export function pickText(id: string, value: unknown, fallback: string, name: string): string {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") throw new Error(`${id}: ${name} must be a string.`);
  return cleanCopy(value);
}

/** A required line: empty is an error with the reason. */
export function pickRequired(id: string, value: unknown, fallback: string, name: string, why: string): string {
  const s = pickText(id, value, fallback, name);
  if (s.length === 0) throw new Error(`${id}: ${name} is required - ${why}.`);
  return s;
}

export function pickColor(id: string, value: unknown, fallback: string, name: string): MosaicColor {
  const s = typeof value === "string" ? value.trim() : "";
  if (s.length === 0) return fallback as MosaicColor;
  if (!HEX.test(s)) throw new Error(`${id}: ${name} ${JSON.stringify(value)} must be #rrggbb.`);
  return s as MosaicColor;
}

export function pickInt(id: string, value: unknown, fallback: number, min: number, max: number, name: string): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${id}: ${name} must be a whole number from ${min} to ${max}. Got ${JSON.stringify(value)}.`);
  }
  return n;
}

export function pickNumber(id: string, value: unknown, fallback: number, min: number, max: number, name: string): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max) {
    throw new Error(`${id}: ${name} must be a number from ${min} to ${max}. Got ${JSON.stringify(value)}.`);
  }
  return n;
}

export function pickBool(id: string, value: unknown, fallback: boolean, name: string): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${id}: ${name} must be true or false. Got ${JSON.stringify(value)}.`);
}

/** A closed-set knob: case-folded, trimmed, refused by name. */
export function pickOneOf<T extends string>(id: string, value: unknown, options: readonly T[], fallback: T, name: string): T {
  if (value === undefined || value === null || value === "") return fallback;
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!(options as readonly string[]).includes(s)) {
    throw new Error(`${id}: ${name} must be one of ${options.join(", ")}. Got ${JSON.stringify(value)}.`);
  }
  return s as T;
}

/** A zero-or-one media prop: an array of path strings; more than one is an error. */
export function pickMedia(id: string, value: unknown, name: string): string {
  if (value === undefined || value === null) return "";
  if (!Array.isArray(value)) throw new Error(`${id}: ${name} must be an array of zero or one path.`);
  const refs = value.map((v) => String(v).trim()).filter(Boolean);
  if (refs.length > 1) throw new Error(`${id}: ${name} accepts zero or one file (got ${refs.length}).`);
  return refs[0] ?? "";
}

/** A many-media prop: an array of path strings, capped. */
export function pickMediaList(id: string, value: unknown, name: string, max: number): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${id}: ${name} must be an array of paths.`);
  const refs = value.map((v) => String(v).trim()).filter(Boolean);
  if (refs.length > max) throw new Error(`${id}: ${name} accepts at most ${max} files (got ${refs.length}).`);
  return refs;
}

/** A JSON prop an editor may hand over as a string. */
export function pickJson(id: string, value: unknown, name: string): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`${id}: ${name} is not valid JSON.`);
    }
  }
  return value;
}

/** A finite number in range, or the fallback - for the hints resolver, which must never throw. */
export function numberOr(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** The platform's canvas for the hints resolver: junk falls back to the default. */
export function platformDims(v: unknown, fallback: JewelPlatform): { width: number; height: number } {
  const key = typeof v === "string" ? v.trim().toLowerCase() : "";
  return JEWEL_PLATFORMS[(key in JEWEL_PLATFORMS ? key : fallback) as JewelPlatform];
}

const VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|avi)$/i;

/** Image or video? The host's probe is the authority; otherwise the extension decides. */
export function mediaKindOf(ctx: MosaicEngineContext, assetId: string, ref: string): "image" | "video" {
  const known = ctx.media?.[assetId as keyof NonNullable<typeof ctx.media>] as { kind?: string } | undefined;
  if (known?.kind === "video" || known?.kind === "image") return known.kind;
  return VIDEO_EXT.test(ref) ? "video" : "image";
}

const ASSET_ID_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;

/** An id-shaped ref IS the asset id (a host's picker hands one over); a path gets the fixed id. */
export function fileAssetId(ref: string, fixed: string) {
  return asAssetId(ASSET_ID_RE.test(ref) ? ref : fixed);
}

/* ── colour ── */

export function rgb(c: MosaicColor | string): [number, number, number] {
  const n = parseInt(String(c).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hex(r: number, g: number, b: number): MosaicColor {
  const c = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  return `#${((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1)}` as MosaicColor;
}

/** Linear byte mix, `t` of `a` over `1 - t` of `b`: a static stand-in for opacity that costs no overlay layer. */
export function mix(a: MosaicColor | string, b: MosaicColor | string, t: number): MosaicColor {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  return hex(ar * t + br * (1 - t), ag * t + bg * (1 - t), ab * t + bb * (1 - t));
}

export function luminance(c: MosaicColor | string): number {
  const [r, g, b] = rgb(c);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Whichever of the two reads better on `fill`. */
export function onColor(fill: MosaicColor | string, a: MosaicColor | string, b: MosaicColor | string): MosaicColor {
  const l = luminance(fill);
  return (Math.abs(luminance(a) - l) >= Math.abs(luminance(b) - l) ? a : b) as MosaicColor;
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** The theme's page, ink and the derived tones a template draws with. */
export type Palette = {
  bg: MosaicColor;
  ink: MosaicColor;
  dim: MosaicColor;
  faint: MosaicColor;
  accent: MosaicColor;
  /** A card fill: the accent whispered over the page. */
  card: MosaicColor;
  /** A line / rule: the ink thinned toward the page. */
  rule: MosaicColor;
  /** Text on the accent. */
  onAccent: MosaicColor;
  dark: boolean;
};

export function palette(id: string, props: { theme?: unknown; accent?: unknown; background?: unknown; ink?: unknown }, defaults: { theme: JewelTheme; accent: string }): Palette {
  const theme = JEWEL_THEME_COLORS[pickOneOf(id, props.theme, JEWEL_THEMES, defaults.theme, "theme")];
  const accent = pickColor(id, props.accent, defaults.accent, "accent");
  const bg = pickColor(id, props.background, theme.background, "background");
  const ink = pickColor(id, props.ink, theme.ink, "ink");
  return {
    bg,
    ink,
    dim: mix(ink, bg, 0.62),
    faint: mix(ink, bg, 0.3),
    accent,
    card: mix(accent, bg, 0.1),
    rule: mix(ink, bg, 0.16),
    onAccent: onColor(accent, bg, ink),
    dark: luminance(bg) < 0.45,
  };
}

/* ── geometry ── */

export type Rect = { x: number; y: number; w: number; h: number };
export type Block = { fit: TextFit; rect: Rect };

export function clampTo(W: number, H: number) {
  return (r: Rect): Rect => {
    const x = Math.max(0, Math.min(W - 1, Math.round(r.x)));
    const y = Math.max(0, Math.min(H - 1, Math.round(r.y)));
    return { x, y, w: Math.max(1, Math.min(W - x, Math.round(r.w))), h: Math.max(1, Math.min(H - y, Math.round(r.h))) };
  };
}

/**
 * Lay a stack of heights in a column between `y0` and `y1`; `anchor` centres
 * the stack or hangs it from the top. Zero heights are skipped and return a
 * null so callers can index by meaning.
 */
export function stackColumn(W: number, H: number, x: number, w: number, y0: number, y1: number, heights: number[], between: number, anchor: "center" | "top" | "bottom" = "center"): (Rect | null)[] {
  const clamp = clampTo(W, H);
  const live = heights.filter((h) => h > 0);
  const total = live.reduce((a, b) => a + b, 0) + between * Math.max(0, live.length - 1);
  let y = y0 + (anchor === "top" ? 0 : anchor === "bottom" ? Math.max(0, y1 - y0 - total) : Math.max(0, (y1 - y0 - total) / 2));
  return heights.map((h) => {
    if (h <= 0) return null;
    const r = clamp({ x, y, w, h });
    y += h + between;
    return r;
  });
}

export const at = (fit: TextFit, rect: Rect): Block => ({ fit, rect });

/** Shortcuts over fitText with the kit's faces: a kicker is small caps bold, a title large bold, a body regular. */
export const fitKicker = (text: string, w: number, maxH: number, S: number, scale = 0.028) => fitText(text.toUpperCase(), budget(w), maxH, Math.round(scale * S), 8, 1, "bold");
export const fitTitle = (text: string, w: number, maxH: number, S: number, scale = 0.08, lines = 2) => fitText(text, budget(w), maxH, Math.round(scale * S), 12, lines, "bold");
export const fitBody = (text: string, w: number, maxH: number, S: number, scale = 0.036, lines = 3) => fitText(text, budget(w), maxH, Math.round(scale * S), 9, lines, "regular");
export const fitItalic = (text: string, w: number, maxH: number, S: number, scale = 0.036, lines = 2) => fitText(text, budget(w), maxH, Math.round(scale * S), 9, lines, "italic");

/* ── the chrome: a wordmark or logo on top, a progress line on the bottom ── */

export type Chrome = {
  wordmark: Block;
  logo: Rect | null;
  bar: Rect;
  /** Where content may start / must end. */
  top: number;
  bottom: number;
  margin: number;
};

/**
 * `S` sizes the chrome by another canvas than W x H (a side of a split sized as the whole canvas, so its
 * wordmark is not half size); `minPx` is the wordmark's floor (legible.ts).
 */
export function chromeLayout(W: number, H: number, brandName: string, hasLogo: boolean, opts: { bar?: boolean; S?: number; minPx?: number } = {}): Chrome {
  const S = opts.S ?? Math.min(W, H);
  const clamp = clampTo(W, H);
  const margin = Math.round(0.06 * S);
  const minPx = opts.minPx ?? 8;
  const wmH = Math.max(10, Math.round(0.04 * S), Math.ceil(minPx * 1.3));
  const wmFit = fitText(brandName.toUpperCase(), budget(W - 2 * margin), wmH, Math.max(minPx, Math.round(0.026 * S)), minPx, 1, "bold");
  const wordmark: Block = { fit: wmFit, rect: clamp({ x: margin, y: Math.round(0.045 * S), w: W - 2 * margin, h: wmFit.h }) };
  const logo = hasLogo ? clamp({ x: margin, y: Math.round(0.035 * S), w: Math.round(Math.min(W - 2 * margin, 0.4 * W)), h: Math.round(0.085 * S) }) : null;
  const chromeBottom = logo ? logo.y + logo.h : wordmark.rect.y + wordmark.rect.h;
  const barH = opts.bar === false ? 0 : Math.max(3, Math.round(0.006 * S));
  const bar: Rect = { x: 0, y: H - Math.max(1, barH), w: W, h: Math.max(1, barH) };
  return {
    wordmark,
    logo,
    bar,
    top: chromeBottom + Math.round(0.04 * S),
    bottom: H - barH - Math.round(0.05 * S),
    margin,
  };
}

export function chromeContract(C: Chrome, withBar = true): LayoutConstraint[] {
  const out: LayoutConstraint[] = [];
  if (!C.logo) out.push(textFitsMeasured("wordmark", C.wordmark.fit.lines.join("\n"), C.wordmark.fit.px, C.wordmark.fit.width));
  out.push({ label: C.logo ? "logo" : "wordmark", within: { yFrac: [0, 0.25] } });
  if (withBar) out.push({ label: "progress", minWidthFrac: 0.98, within: { yFrac: [0.9, 1] } });
  return out;
}

/** Every block's fit as a measured-text constraint; nulls are skipped. */
export function fitsContract(entries: Array<[string, TextFit | Block | null | undefined]>): LayoutConstraint[] {
  const out: LayoutConstraint[] = [];
  for (const [label, v] of entries) {
    if (!v) continue;
    const fit = "fit" in v ? v.fit : v;
    out.push(textFitsMeasured(label, fit.lines.join("\n"), fit.px, fit.width));
  }
  return out;
}

/* ── sources ── */

/** One svg-rasterized text block (the bundled font, no drawtext), aligned in its rect. */
export function textSource(fit: TextFit, color: MosaicColor, label: string, overlay?: MosaicOverlayExpr, hAlign: "left" | "center" | "right" = "center", vAlign: "top" | "middle" | "bottom" = "middle"): MosaicSource {
  return tag({
    type: "text",
    rasterizer: "svg",
    renderMode: { kind: "image" },
    layers: [
      {
        content: { kind: "literal", text: fit.lines.join("\n") },
        style: {
          fontSize: fit.px,
          fontColor: color,
          ...(fit.face === "bold" ? { fontWeight: "bold" } : {}),
          ...(fit.face === "italic" ? { fontStyle: "italic" } : {}),
        },
        placement: { hAlign, vAlign },
      },
    ],
    ...(overlay ? { overlay } : {}),
    editor: { owner: "template" },
  } as MosaicSource, label);
}

/** A colour tile, optionally rounded or a pill, with motion. */
export function tileSource(color: MosaicColor, label: string, opts: { radius?: number; pill?: boolean; overlay?: MosaicOverlayExpr } = {}): MosaicSource {
  const effects = opts.pill
    ? { rounding: { cornerStyle: "pill" as const } }
    : opts.radius !== undefined
      ? { rounding: { cornerStyle: "rounded" as const, borderRadius: opts.radius } }
      : undefined;
  return tag(makeColorTile(color, { ...(effects ? { effects } : {}), ...(opts.overlay ? { overlay: opts.overlay } : {}) }) as MosaicSource, label);
}

/** An image or video asset in a rect, contain-fitted by default. */
export function mediaSource(assetId: ReturnType<typeof asAssetId>, kind: "image" | "video", label: string, opts: { fit?: "contain" | "cover"; hAlign?: "left" | "center" | "right"; overlay?: MosaicOverlayExpr; loop?: boolean } = {}): MosaicSource {
  return tag({
    type: "media",
    mediaType: kind,
    assetId,
    placement: { fit: opts.fit ?? "contain", ...(opts.hAlign ? { hAlign: opts.hAlign } : {}), vAlign: "middle" },
    ...(kind === "video" ? { loopMode: opts.loop === false ? "once" : "loop", audio: { enabled: false } } : {}),
    ...(opts.overlay ? { overlay: opts.overlay } : {}),
    editor: { owner: "template" },
  } as MosaicSource, label);
}

/** The progress line: one full-width tile that slides in from the left over the clip. */
export function progressSource(color: MosaicColor, totalSec: number): MosaicSource {
  return tag(makeColorTile(color, { overlay: { xExpr: `-W*(1-min(1,t/${totalSec}))` } }) as MosaicSource, "progress");
}

export type Pieces = Parameters<typeof placeInsetPieces>[0]["pieces"];

/** A piece list with the push shortcut every template uses. */
export function pieceList() {
  const pieces: Pieces = [];
  const piece = (rect: Rect, importance: number, source: MosaicSource) => pieces.push({ rect: { ...rect, importance }, source });
  return { pieces, piece };
}

/**
 * Place the pieces and finish the document: the canvas is the document's
 * own background (never a full-frame rect), the length is authored, and the
 * layout intent travels with the document for the test sweep.
 */
export function finishDocument(
  id: string,
  ctx: MosaicEngineContext,
  W: number,
  H: number,
  pieces: Pieces,
  assets: NonNullable<MosaicDocument["assets"]>,
  bg: MosaicColor,
  durationMs: number,
  label: string,
  constraints: LayoutConstraint[],
  debug: boolean,
): MosaicDocument {
  // A version with media controls (media-controls.ts) renders the one it wraps carrying them; nothing else does.
  const controls = mediaControlsFor(ctx, id);
  if (controls) ({ id, pieces, constraints } = applyMediaControls(controls, W, H, pieces, assets as Parameters<typeof applyMediaControls>[4], constraints));
  const placed = placeInsetPieces({ rootW: W, rootH: H, pieces });
  const doc: MosaicDocument = {
    kind: "mosaic_document",
    version: 1,
    m0: toM0String(placed.m0, id),
    assets,
    size: { width: W, height: H },
    fps: ctx.target.fps,
    durationMs,
    backgroundColor: bg,
    sources: placed.sources,
    editor: { label },
  };
  return withLayoutIntent(doc, ctx, { templateId: id, constraints, debug });
}

/**
 * The chrome's pieces: the logo (bound to the media prop, the drop target)
 * or the wordmark (bound to the brand name AND the logo prop so it is the
 * drop target), and the progress line in the accent.
 */
export function chromePieces(
  piece: (rect: Rect, importance: number, source: MosaicSource) => void,
  C: Chrome,
  P: Palette,
  logo: { id?: ReturnType<typeof asAssetId>; kind: "image" | "video" },
  totalSec: number,
  keys: { brandName: string; brandLogo: string } = { brandName: "brandName", brandLogo: "brandLogo" },
  withBar = true,
): void {
  if (C.logo && logo.id) {
    piece(C.logo, 1, bindProp(mediaSource(logo.id, logo.kind, "logo", { hAlign: "left" }), keys.brandLogo, 0));
  } else {
    piece(C.wordmark.rect, 1, bindProps(textSource(C.wordmark.fit, P.ink, "wordmark", undefined, "left"), [{ propKey: keys.brandName }, { propKey: keys.brandLogo, index: 0 }]));
  }
  if (withBar) piece(C.bar, 1, bindProp(progressSource(P.accent, totalSec), "accent"));
}

/** The logo asset from a media ref: id, kind and the manifest entry. */
export function logoAsset(ctx: MosaicEngineContext, ref: string, assets: NonNullable<MosaicDocument["assets"]>): { id?: ReturnType<typeof asAssetId>; kind: "image" | "video" } {
  if (!ref) return { kind: "image" };
  const id = fileAssetId(ref, "brand-logo");
  const kind = mediaKindOf(ctx, String(id), ref);
  assets[id] = { kind: "file", path: ref, mediaType: kind };
  return { id, kind };
}

/** An image asset from a media ref, refusing a probed video. */
export function imageAsset(id: string, ctx: MosaicEngineContext, ref: string, fixed: string, assets: NonNullable<MosaicDocument["assets"]>, name: string) {
  const assetId = fileAssetId(ref, fixed);
  // A slot with media controls takes a clip as well (media-controls.ts plays it); every other render refuses one.
  if (mediaControlsFor(ctx, id)?.slots.some((s) => s.key === name)) {
    assets[assetId] = { kind: "file", path: ref, mediaType: mediaKindOf(ctx, String(assetId), ref) };
    return assetId;
  }
  assets[assetId] = { kind: "file", path: ref, mediaType: "image" };
  const known = ctx.media?.[assetId];
  if (known && known.kind !== "image") throw new Error(`${id}: ${name} must be an image (got ${known.kind}).`);
  return assetId;
}

/** An inline SVG as a data-uri image asset. */
export function svgAsset(svg: string, fixed: string, displayName: string, assets: NonNullable<MosaicDocument["assets"]>) {
  const assetId = asAssetId(fixed);
  assets[assetId] = { kind: "data-uri", uri: `data:image/svg+xml,${encodeURIComponent(svg)}`, mediaType: "image", displayName };
  return assetId;
}

/* ── timing ── */

export type Beats = {
  total: number;
  /** Where each beat after the first begins. */
  cuts: number[];
  fade: number;
  rise: number;
  stagger: number;
};

/** Beats as shares of the clip, with ramps that shorten on a short clip. */
export function shareBeats(totalSec: number, shares: number[]): Beats {
  const D = round3(totalSec);
  const sum = shares.reduce((a, b) => a + b, 0);
  const cuts: number[] = [];
  let acc = 0;
  for (let i = 0; i < shares.length - 1; i++) {
    acc += shares[i] / sum;
    cuts.push(round3(acc * D));
  }
  return {
    total: D,
    cuts,
    fade: round3(Math.min(0.3, 0.04 * D)),
    rise: round3(Math.min(0.45, 0.06 * D)),
    stagger: round3(Math.min(0.4, 0.045 * D)),
  };
}

/** Motion helpers bound to a beat table. */
export function motion(T: Beats) {
  const leave = (endSec: number) => exit({ kind: "fade", durationMs: T.fade * 1000, atSec: round3(Math.max(0, endSec - T.fade)) });
  const arrive = (startSec: number, step: number, endSec?: number, kind: EntranceKind = "rise") => {
    const enter = entrance({ kind, durationMs: T.rise * 1000, atSec: round3(startSec + step * T.stagger), ease: "easeOut" });
    return endSec === undefined ? enter : composeMotion(enter, leave(endSec));
  };
  return { leave, arrive };
}

/** A price as drawn: a currency symbol, thousands separators, no cents when whole. */
export function formatPrice(n: number, currency = "$"): string {
  const whole = Number.isInteger(n);
  const s = whole ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency}${s}`;
}
