import type { MosaicDocument, MosaicDocumentPipeline, MosaicEngineContext, MosaicOverlayExpr, MosaicSource } from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { bindProp, bindProps, defineMosaicTemplate, definePropsSchema, entrance, resolvePinnedDurationMs, tag } from "@m0saic/template-utils";
import type { LayoutConstraint } from "@m0saic/template-utils";
import { blockH, budget, fitText, type TextFit } from "../../../_shared/text";
import { minTextPx } from "../../../_shared/legible";
import {
  JEWEL_DEFAULT_ACCENT,
  JEWEL_METALS,
  JEWEL_PLATFORMS,
  JEWEL_PLATFORM_KEYS,
  JEWEL_STONES,
  JEWEL_THEMES,
  at,
  clampTo,
  fileAssetId,
  finishDocument,
  fitsContract,
  logoAsset,
  mediaKindOf,
  mediaSource,
  numberOr,
  palette,
  pickBool,
  pickMedia,
  pickNumber,
  pickOneOf,
  pickRequired,
  pickText,
  pieceList,
  platformDims,
  round3,
  svgAsset,
  textSource,
  tileSource,
  type Block,
  type JewelMetal,
  type JewelPlatform,
  type JewelStone,
  type JewelTheme,
  type Rect,
} from "../../../_shared/jewel";
import { ART_KINDS, artTone, jewelArtSvg, type ArtKind } from "../../../_shared/jewel-art";
import { codeSchema } from "../../../_shared/vnext";
import {
  mediaControlsBindings,
  mediaControlsDefaults,
  mediaControlsSchema,
  renderWithMediaControls,
  type MediaControlProps,
  type MediaSlot,
} from "../../../_shared/media-controls";

/**
 * `@jewelry/social/piece-reel/v1` - the brand's own clips cut into a Reel, the words never over the piece.
 *
 * ONE CONCEPT: **the footage is the ad.** A maker already films the pieces on the bench and in the hand; two to
 * five of those clips, each with the piece's name and one line of detail, then a closing card with where to buy or
 * where to find you at a show, is a Reel. Jewelers care that nothing covers the piece, so each clip gets a rect of
 * its own and the words sit on the page beside it: a band on top (the wordmark on every step, the hook on the
 * first), the clip, a band under it (the piece's name and detail), the show strip; on a wide canvas the clip on
 * the left and the words on the right. The bands keep their height on every step, so the clip holds still through
 * the crossfades. The closing card is data, not a mode: fill the shows for a booth, clear them and write the line
 * for a shop.
 *
 * Every media input edits in place (`_shared/media-controls.ts`): an area drawn on the preview moves and resizes it
 * (the crop is the area); the clips share one fit, `clipFit`. An empty slot shows a real clip or photo from the
 * starter pack, never clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `pieceReelBase` is the reel as such (the tests hold the controls to it),
 * `PieceReelV1` is that reel with its media controls - the template this repo ships.
 */

export type PieceReelProps = {
  platform?: string;
  brandName?: string;
  brandLogo?: string[];
  /** Under the wordmark on the closing card. Empty removes it. */
  tagline?: string;
  /** Over the first clip, the reel's opening line. Empty removes it. */
  hook?: string;
  /** Seconds each clip holds the frame, 2..8. The closing card holds a little longer. */
  secondsPerClip?: number;
  clip1?: string[];
  clip1Label?: string;
  clip1Detail?: string;
  clip1Art?: string;
  clip2?: string[];
  clip2Label?: string;
  clip2Detail?: string;
  clip2Art?: string;
  clip3?: string[];
  clip3Label?: string;
  clip3Detail?: string;
  clip3Art?: string;
  clip4?: string[];
  clip4Label?: string;
  clip4Detail?: string;
  clip4Art?: string;
  clip5?: string[];
  clip5Label?: string;
  clip5Detail?: string;
  clip5Art?: string;
  /** The line on the closing card: where to buy. Empty removes it. */
  ctaLine?: string;
  show1Name?: string;
  show1Dates?: string;
  show1Place?: string;
  show1Booth?: string;
  show2Name?: string;
  show2Dates?: string;
  show2Place?: string;
  show2Booth?: string;
  /** Run the first show as a band under every clip. */
  boothStrip?: boolean;
  /** cover crops a clip to fill the frame; contain shows all of it on the page (a square spin on a story canvas). */
  clipFit?: string;
  metal?: string;
  stone?: string;
  theme?: string;
  accent?: string;
  background?: string;
  ink?: string;
  debugLayout?: boolean;
};

/** The shipped props: the reel's own, plus an area per media input (the clips share `clipFit`; the logo has its own fit). */
export type PieceReelV1Props = PieceReelProps & MediaControlProps;

const ID = "@jewelry/social/piece-reel/v1";
const REEL_MIN_CLIP = 2;
const REEL_MAX_CLIP = 8;
const REEL_MAX_CLIPS = 5;
/** The crossfade between steps, before the short-clip cap. */
const REEL_XFADE_MS = 350;
const CLIP_FITS = ["cover", "contain"] as const;
type ClipFit = (typeof CLIP_FITS)[number];

const DEFAULTS = {
  platform: "story" as JewelPlatform,
  brandName: "Maison Lumen",
  tagline: "Fine jewelry, New York",
  hook: "Just off the bench",
  secondsPerClip: 3.5,
  // The words match the starter clips the empty slots show.
  clip1Label: "Oval & Emerald-Cut Solitaires",
  clip1Detail: "Two solitaires, just off the bench",
  clip1Art: "solitaire" as ArtKind,
  clip2Label: "Heart-Shaped Diamond",
  clip2Detail: "Loose, ready for its setting",
  clip2Art: "diamond" as ArtKind,
  clip3Label: "Tiger Head Cuff",
  clip3Detail: "Sculpted head, pavé-set bands",
  clip3Art: "tennis" as ArtKind,
  clip4Label: "",
  clip4Detail: "",
  clip4Art: "hoops" as ArtKind,
  clip5Label: "",
  clip5Detail: "",
  clip5Art: "studs" as ArtKind,
  // The shop close by default (founder 2026-10-22): a dated show would be frozen into every first open.
  ctaLine: "See the new line in store and online",
  show1Name: "",
  show1Dates: "",
  show1Place: "",
  show1Booth: "",
  show2Name: "",
  show2Dates: "",
  show2Place: "",
  show2Booth: "",
  boothStrip: true,
  clipFit: "cover" as ClipFit,
  metal: "gold" as JewelMetal,
  stone: "diamond" as JewelStone,
  theme: "ivory" as JewelTheme,
  accent: JEWEL_DEFAULT_ACCENT,
};

const clip = { type: "media[]" as const, required: false, meta: { control: { multiple: false, picker: "file" as const, accept: ["image" as const, "video" as const] } } };
const art = { type: "string" as const, required: false, meta: { constraints: { oneOf: [...ART_KINDS] } } };
const str = { type: "string" as const, required: false };

const propsSchema = definePropsSchema<PieceReelProps>({
  platform: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_PLATFORM_KEYS] } } },
  brandName: str,
  brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  tagline: str,
  hook: str,
  secondsPerClip: { type: "number", required: false, meta: { constraints: { min: REEL_MIN_CLIP, max: REEL_MAX_CLIP } } },
  clip1: clip,
  clip1Label: str,
  clip1Detail: str,
  clip1Art: art,
  clip2: clip,
  clip2Label: str,
  clip2Detail: str,
  clip2Art: art,
  clip3: clip,
  clip3Label: str,
  clip3Detail: str,
  clip3Art: art,
  clip4: clip,
  clip4Label: str,
  clip4Detail: str,
  clip4Art: art,
  clip5: clip,
  clip5Label: str,
  clip5Detail: str,
  clip5Art: art,
  ctaLine: str,
  show1Name: str,
  show1Dates: str,
  show1Place: str,
  show1Booth: str,
  show2Name: str,
  show2Dates: str,
  show2Place: str,
  show2Booth: str,
  boothStrip: { type: "boolean", required: false },
  clipFit: { type: "string", required: false, meta: { constraints: { oneOf: [...CLIP_FITS] } } },
  metal: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_METALS] } } },
  stone: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_STONES] } } },
  theme: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_THEMES] } } },
  accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
  background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  debugLayout: { type: "boolean", required: false },
});

/** A slot is drawn when it has a clip or a label. Never throws - the hints resolver uses it. */
function countClips(props: Record<string, unknown> | undefined): number {
  let n = 0;
  for (let k = 1; k <= REEL_MAX_CLIPS; k++) {
    const media = props?.[`clip${k}`];
    const v = props?.[`clip${k}Label`];
    const label = v === undefined || v === null ? (DEFAULTS as Record<string, unknown>)[`clip${k}Label`] : v;
    if ((Array.isArray(media) && media.some((m) => String(m).trim().length > 0)) || (typeof label === "string" && label.trim().length > 0)) n += 1;
  }
  return n;
}

/** The closing card holds a little longer than a clip, 3..6 seconds. */
function closingSec(clipSec: number): number {
  return round3(Math.min(6, Math.max(3, clipSec + 0.5)));
}

/**
 * The step table, in whole milliseconds: what each step SHOWS (`visible`),
 * what it RENDERS (`steps` - every step but the last carries the crossfade
 * on its tail), where it starts in the stitched clip, and the fade. The
 * stitched clip is `sum(visible)` exactly.
 */
type ReelTiming = { totalMs: number; visible: number[]; steps: number[]; starts: number[]; xfadeMs: number };
function reelTiming(clipCount: number, clipSec: number, pinnedMs?: number): ReelTiming {
  const natural = [...Array.from({ length: clipCount }, () => clipSec), closingSec(clipSec)].map((s) => s * 1000);
  const naturalMs = natural.reduce((a, b) => a + b, 0);
  const totalMs = Math.max(natural.length, Math.round(pinnedMs ?? naturalMs));
  const k = totalMs / naturalMs;
  const visible = natural.map((ms) => Math.max(1, Math.round(ms * k)));
  visible[visible.length - 1] += totalMs - visible.reduce((a, b) => a + b, 0);
  const xfadeMs = Math.max(0, Math.min(REEL_XFADE_MS, Math.floor(Math.min(...visible) / 3)));
  const starts: number[] = [];
  let acc = 0;
  for (const v of visible) {
    starts.push(acc);
    acc += v;
  }
  return { totalMs, visible, steps: visible.map((v, i) => (i < visible.length - 1 ? v + xfadeMs : v)), starts, xfadeMs };
}

/** "418" reads as "Booth 418"; a value that starts with a word ("Stand 2.1/501") stands as typed. */
function boothText(v: string): string {
  return /^[A-Za-z]{3,}/.test(v) ? v : `Booth ${v}`;
}

/* ── layout ── */

type ClipCopy = {
  brandName: string;
  /** Drawn on this step (the first): the reel's hook. */
  hook: string;
  /** The reel's hook, for sizing: its band is kept on every step so the clip never moves at a crossfade. */
  hookSize: string;
  label: string;
  detail: string;
  /** Whether any step has a detail line: the band keeps its room on every step. */
  anyDetail: boolean;
  strip: string;
};
type ClipLayout = {
  W: number;
  H: number;
  /** The clip's own rect - nothing is ever drawn over it. */
  media: Rect;
  wordmark: Block;
  hook: Block | null;
  /** Where the bundled art goes when the slot has no clip: a card and the art inset in it. */
  artCard: Rect;
  art: Rect;
  label: Block | null;
  detail: Block | null;
  stripBand: Rect | null;
  strip: Block | null;
  bar: Rect;
};

const wide = (W: number, H: number) => W / H > 1.2;

/**
 * A clip step: the clip gets a rect of its own and the words sit BESIDE it, on the page - never over the piece.
 * Tall and square canvases: a band on top (the wordmark, then the hook on the first step), the clip, a band
 * under it (the piece's name and detail), then the booth strip. Wide canvases: the clip on the left, the words
 * on the right. Every band is the same height on every step, so the clip holds still through the crossfades.
 */
function layoutClipStep(copy: ClipCopy, W: number, H: number): ClipLayout {
  const S = Math.min(W, H);
  const minPx = minTextPx(W, H);
  const clamp = clampTo(W, H);
  const margin = Math.round(0.05 * S);
  const gap = Math.round(0.018 * S);
  const barH = Math.max(3, Math.round(0.006 * S));
  const bar: Rect = { x: 0, y: H - barH, w: W, h: barH };
  let stripBand: Rect | null = null;
  let strip: Block | null = null;
  if (copy.strip) {
    const bandH = Math.max(12, Math.round(0.07 * S));
    stripBand = clamp({ x: 0, y: bar.y - bandH, w: W, h: bandH });
    const fit = fitText(copy.strip.toUpperCase(), budget(W - 2 * margin), bandH * 0.8, Math.round(0.03 * S), Math.max(7, minPx), 1, "bold");
    strip = at(fit, clamp({ x: margin, y: stripBand.y + (bandH - fit.h) / 2, w: W - 2 * margin, h: fit.h }));
  }
  const floor = (stripBand ?? bar).y;
  const isWide = wide(W, H);
  const mediaW = isWide ? Math.round(W * 0.6) : W;
  const colX = isWide ? mediaW + margin : margin;
  const colW = isWide ? W - mediaW - 2 * margin : W - 2 * margin;
  const labelPx = Math.round((isWide ? 0.06 : 0.052) * S);
  const detailPx = Math.round(0.032 * S);
  const hookPx = Math.round((isWide ? 0.075 : 0.062) * S);
  const wmFit = fitText(copy.brandName.toUpperCase(), budget(colW), Math.round(0.05 * S), Math.round(0.026 * S), Math.max(8, minPx), 1, "bold");
  const hookRoom = copy.hookSize ? fitText(copy.hookSize, budget(colW), 0.2 * H, hookPx, Math.max(10, minPx), 2, "bold").h : 0;
  const labelRoom = blockH(2, labelPx) + (copy.anyDetail ? Math.round(gap / 2) + blockH(2, detailPx) : 0);
  const hookFit = copy.hook ? fitText(copy.hook, budget(colW), Math.max(hookRoom, 1), hookPx, Math.max(10, minPx), 2, "bold") : null;
  const labelFit = copy.label ? fitText(copy.label, budget(colW), blockH(2, labelPx), labelPx, Math.max(9, minPx), 2, "bold") : null;
  const detailFit = copy.detail ? fitText(copy.detail, budget(colW), blockH(2, detailPx), detailPx, Math.max(7, minPx), 2, "regular") : null;

  let media: Rect;
  let wordmark: Block;
  let hook: Block | null = null;
  let label: Block | null = null;
  let detail: Block | null = null;
  if (!isWide) {
    const y0 = Math.round(margin * 0.8);
    wordmark = at(wmFit, clamp({ x: margin, y: y0, w: colW, h: wmFit.h }));
    const hookY = y0 + wmFit.h + gap;
    if (hookFit) hook = at(hookFit, clamp({ x: margin, y: hookY, w: colW, h: hookFit.h }));
    const top = hookY + (hookRoom ? hookRoom + gap : 0);
    const bottom = floor - gap - labelRoom - gap;
    media = clamp({ x: 0, y: top, w: W, h: Math.max(1, bottom - top) });
    let y = bottom + gap;
    if (labelFit) {
      label = at(labelFit, clamp({ x: margin, y, w: colW, h: labelFit.h }));
      y += labelFit.h + Math.round(gap / 2);
    }
    if (detailFit) detail = at(detailFit, clamp({ x: margin, y, w: colW, h: detailFit.h }));
  } else {
    media = clamp({ x: 0, y: 0, w: mediaW, h: floor });
    wordmark = at(wmFit, clamp({ x: colX, y: margin, w: colW, h: wmFit.h }));
    const hookY = margin + wmFit.h + 2 * gap;
    if (hookFit) hook = at(hookFit, clamp({ x: colX, y: hookY, w: colW, h: hookFit.h }));
    const zoneTop = hookY + (hookRoom ? hookRoom + 2 * gap : 0);
    const used = (labelFit?.h ?? 0) + (detailFit ? Math.round(gap / 2) + detailFit.h : 0);
    let y = zoneTop + Math.max(0, Math.round((floor - margin - zoneTop - used) / 2));
    if (labelFit) {
      label = at(labelFit, clamp({ x: colX, y, w: colW, h: labelFit.h }));
      y += labelFit.h + Math.round(gap / 2);
    }
    if (detailFit) detail = at(detailFit, clamp({ x: colX, y, w: colW, h: detailFit.h }));
  }
  const side = Math.max(8, Math.round(Math.min(media.w, media.h) * 0.8));
  const artCard = clamp({ x: media.x + (media.w - side) / 2, y: media.y + (media.h - side) / 2, w: side, h: side });
  const inset = Math.round(0.09 * artCard.w);
  const art = clamp({ x: artCard.x + inset, y: artCard.y + inset, w: artCard.w - 2 * inset, h: artCard.h - 2 * inset });
  return { W, H, media, wordmark, hook, artCard, art, label, detail, stripBand, strip, bar };
}

type ShowCopy = { name: string; meta: string; booth: string };
type ClosingCopy = { brandName: string; hasLogo: boolean; tagline: string; cta: string; shows: ShowCopy[] };
type ShowLayout = { card: Rect; name: Block; meta: Block | null; booth: Block | null };
type ClosingLayout = {
  W: number;
  H: number;
  logo: Rect | null;
  wordmark: Block | null;
  tagline: Block | null;
  rule: Rect;
  cta: Block | null;
  shows: ShowLayout[];
  bar: Rect;
  /** The type scale the stack needed to fit (1 = none). */
  scale: number;
};

/** The closing card: wordmark, tagline, a rule, the line, the shows - one centred stack, shrunk until it fits. */
function layoutClosing(copy: ClosingCopy, W: number, H: number): ClosingLayout {
  let L = closingAt(copy, W, H, 1);
  for (let s = 0.9; s >= 0.5 && L.overflow > 0; s = round3(s - 0.1)) L = closingAt(copy, W, H, s);
  return L.layout;
}

function closingAt(copy: ClosingCopy, W: number, H: number, scale: number): { layout: ClosingLayout; overflow: number } {
  const S = Math.min(W, H);
  const minPx = minTextPx(W, H);
  // A tall canvas has room to spare: the closing type steps up a size there.
  const tall = H / W > 1.3 ? 1.3 : 1;
  const z = (f: number) => Math.round(f * S * scale * tall);
  const clamp = clampTo(W, H);
  const margin = Math.round(0.06 * S);
  const gap = Math.max(2, z(0.022));
  const pad = Math.max(4, z(0.03));
  const barH = Math.max(3, Math.round(0.006 * S));
  const bar: Rect = { x: 0, y: H - barH, w: W, h: barH };
  const colW = wide(W, H) ? Math.round(Math.min(W - 2 * margin, 0.66 * W)) : W - 2 * margin;
  const colX = Math.round((W - colW) / 2);
  const availTop = margin;
  const availBottom = bar.y - margin;

  const logoH = copy.hasLogo ? Math.max(8, z(0.14)) : 0;
  const wmFit = copy.hasLogo ? null : fitText(copy.brandName.toUpperCase(), budget(colW), 0.16 * H, z(0.085), Math.max(10, minPx), 1, "bold");
  const tagFit = copy.tagline ? fitText(copy.tagline.toUpperCase(), budget(colW), 0.06 * H, z(0.026), Math.max(7, minPx), 1, "bold") : null;
  const ruleH = Math.max(2, Math.round(0.004 * S));
  const ctaFit = copy.cta ? fitText(copy.cta, budget(colW), 0.14 * H, z(0.042), Math.max(8, minPx), 2, "regular") : null;

  // Shows: side by side on a wide canvas, stacked otherwise.
  const n = copy.shows.length;
  const sideBySide = n > 1 && wide(W, H);
  const cardW = sideBySide ? Math.floor((colW - gap) / 2) : colW;
  const innerW = cardW - 2 * pad;
  const fits = copy.shows.map((s) => ({
    name: fitText(s.name, budget(innerW), 0.08 * H, z(0.044), Math.max(8, minPx), 1, "bold"),
    meta: s.meta ? fitText(s.meta, budget(innerW), 0.06 * H, z(0.03), Math.max(7, minPx), 1, "regular") : null,
    booth: s.booth ? fitText(s.booth.toUpperCase(), budget(innerW), 0.07 * H, z(0.036), Math.max(7, minPx), 1, "bold") : null,
  }));
  const small = Math.round(gap / 2);
  const cardHs = fits.map((f) => 2 * pad + f.name.h + (f.meta ? small + f.meta.h : 0) + (f.booth ? small + f.booth.h : 0));
  const showsH = n === 0 ? 0 : sideBySide ? Math.max(...cardHs) : cardHs.reduce((a, b) => a + b, 0) + gap * (n - 1);

  const blocks = [logoH || wmFit?.h || 0, tagFit?.h ?? 0, ruleH, ctaFit?.h ?? 0, showsH];
  const live = blocks.filter((h) => h > 0);
  const total = live.reduce((a, b) => a + b, 0) + gap * 1.5 * (live.length - 1);
  const overflow = total - (availBottom - availTop);
  let y = availTop + Math.max(0, (availBottom - availTop - total) / 2);
  const take = (h: number) => {
    const r = y;
    if (h > 0) y += h + gap * 1.5;
    return r;
  };

  const logo = copy.hasLogo ? clamp({ x: colX, y: take(logoH), w: colW, h: logoH }) : null;
  const wordmark = wmFit ? at(wmFit, clamp({ x: colX, y: take(wmFit.h), w: colW, h: wmFit.h })) : null;
  const tagline = tagFit ? at(tagFit, clamp({ x: colX, y: take(tagFit.h), w: colW, h: tagFit.h })) : null;
  const ruleW = Math.max(8, Math.round(0.12 * S));
  const rule = clamp({ x: (W - ruleW) / 2, y: take(ruleH), w: ruleW, h: ruleH });
  const cta = ctaFit ? at(ctaFit, clamp({ x: colX, y: take(ctaFit.h), w: colW, h: ctaFit.h })) : null;
  const showsY = take(showsH);
  let sy = showsY;
  const shows: ShowLayout[] = fits.map((f, i) => {
    const cx = sideBySide ? colX + i * (cardW + gap) : colX;
    const cy = sideBySide ? showsY : sy;
    const ch = sideBySide ? Math.max(...cardHs) : cardHs[i];
    if (!sideBySide) sy += ch + gap;
    const card = clamp({ x: cx, y: cy, w: cardW, h: ch });
    let ty = card.y + pad + (ch - cardHs[i]) / 2;
    const row = (fit: TextFit | null, between: number) => {
      if (!fit) return null;
      ty += between;
      const b = at(fit, clamp({ x: card.x + pad, y: ty, w: innerW, h: fit.h }));
      ty += fit.h;
      return b;
    };
    const name = row(f.name, 0)!;
    const meta = row(f.meta, small);
    const booth = row(f.booth, small);
    return { card, name, meta, booth };
  });

  return { layout: { W, H, logo, wordmark, tagline, rule, cta, shows, bar, scale }, overflow };
}

const progressContract: LayoutConstraint = { label: "progress", minWidthFrac: 0.98, within: { yFrac: [0.9, 1] } };

/** The labels are the sources' own: `k` is the clip slot (1..5). */
function clipStepContract(L: ClipLayout, k: number): LayoutConstraint[] {
  const isWide = L.W / L.H > 1.2;
  return [
    progressContract,
    ...fitsContract([["wordmark", L.wordmark], ["hook", L.hook], [`label-${k}`, L.label], [`detail-${k}`, L.detail], ["strip", L.strip]]),
    { label: `clip-${k}`, minWidthFrac: isWide ? 0.55 : 0.98, minHeightFrac: isWide ? 0.8 : 0.45 },
  ];
}

/** `showKeys[i]` is the show number (1 or 2) drawn in card i. */
function closingContract(L: ClosingLayout, showKeys: number[]): LayoutConstraint[] {
  return [
    progressContract,
    ...fitsContract([
      ["wordmark", L.wordmark],
      ["tagline", L.tagline],
      ["cta", L.cta],
      ...L.shows.flatMap((s, i): Array<[string, Block | null]> => {
        const k = showKeys[i];
        return [[`show-${k}-name`, s.name], [`show-${k}-meta`, s.meta], [`show-${k}-booth`, s.booth]];
      }),
    ]),
  ];
}

/* ── the template ── */

/**
 * The reel as such: one step per clip, then the closing card. Not a template of its own - `PieceReelV1` wraps it
 * with the media controls - but the tests hold the controls to it: given its words and a file in every slot, the
 * two render the same reel.
 */
export const pieceReelBase = defineMosaicTemplate<PieceReelProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },
  outputHints: {
    ...JEWEL_PLATFORMS[DEFAULTS.platform],
    fps: 30,
    durationMs: reelTiming(countClips(undefined), DEFAULTS.secondsPerClip).totalMs,
    format: { kind: "video", container: "mp4" },
    note: "The canvas follows the platform knob (story by default - a Reel). The clip is clips x secondsPerClip plus the closing hold; a pinned duration scales every slot.",
  },
  resolveOutputHints: (props) => ({
    ...platformDims(props?.platform, DEFAULTS.platform),
    durationMs: reelTiming(countClips(props as Record<string, unknown> | undefined), numberOr(props?.secondsPerClip, DEFAULTS.secondsPerClip, REEL_MIN_CLIP, REEL_MAX_CLIP)).totalMs,
  }),
  propsSchema,
  defaultProps: {
    platform: DEFAULTS.platform,
    brandName: DEFAULTS.brandName,
    brandLogo: [],
    tagline: DEFAULTS.tagline,
    hook: DEFAULTS.hook,
    secondsPerClip: DEFAULTS.secondsPerClip,
    clip1: [],
    clip1Label: DEFAULTS.clip1Label,
    clip1Detail: DEFAULTS.clip1Detail,
    clip1Art: DEFAULTS.clip1Art,
    clip2: [],
    clip2Label: DEFAULTS.clip2Label,
    clip2Detail: DEFAULTS.clip2Detail,
    clip2Art: DEFAULTS.clip2Art,
    clip3: [],
    clip3Label: DEFAULTS.clip3Label,
    clip3Detail: DEFAULTS.clip3Detail,
    clip3Art: DEFAULTS.clip3Art,
    clip4: [],
    clip4Label: DEFAULTS.clip4Label,
    clip4Detail: DEFAULTS.clip4Detail,
    clip4Art: DEFAULTS.clip4Art,
    clip5: [],
    clip5Label: DEFAULTS.clip5Label,
    clip5Detail: DEFAULTS.clip5Detail,
    clip5Art: DEFAULTS.clip5Art,
    ctaLine: DEFAULTS.ctaLine,
    show1Name: DEFAULTS.show1Name,
    show1Dates: DEFAULTS.show1Dates,
    show1Place: DEFAULTS.show1Place,
    show1Booth: DEFAULTS.show1Booth,
    show2Name: DEFAULTS.show2Name,
    show2Dates: DEFAULTS.show2Dates,
    show2Place: DEFAULTS.show2Place,
    show2Booth: DEFAULTS.show2Booth,
    boothStrip: DEFAULTS.boothStrip,
    clipFit: DEFAULTS.clipFit,
    metal: DEFAULTS.metal,
    stone: DEFAULTS.stone,
    theme: DEFAULTS.theme,
    accent: DEFAULTS.accent,
    debugLayout: false,
  },
  // Clips four and five and both shows are empty by default (a slot is drawn when it has a clip or a label, a show
  // when it has a name); the clip length is timing.
  bindings: {
    unbound: {
      background: "canvas",
      ink: "theme",
      secondsPerClip: "timing",
      clip4: "empty slot",
      clip4Label: "empty slot",
      clip4Detail: "empty slot",
      clip5: "empty slot",
      clip5Label: "empty slot",
      clip5Detail: "empty slot",
      show1Name: "empty show",
      show1Dates: "empty show",
      show1Place: "empty show",
      show1Booth: "empty show",
      show2Name: "empty show",
      show2Dates: "empty show",
      show2Place: "empty show",
      show2Booth: "empty show",
    },
  },
  render,
});

/**
 * The media inputs, each with its Fit's default and the starter it shows while empty; `with` names what moves with
 * a slot; a row drawn only once it has words takes its starter only then.
 */
export const PIECE_REEL_MEDIA: MediaSlot[] = [
  { key: "clip1", fit: "cover", starter: "clip-solitaires", with: ["art-card-1"], fitProp: "clipFit" },
  { key: "clip2", fit: "cover", starter: "clip-diamond", with: ["art-card-2"], fitProp: "clipFit" },
  { key: "clip3", fit: "cover", starter: "clip-cuff", with: ["art-card-3"], fitProp: "clipFit" },
  { key: "clip4", fit: "cover", starter: "clip-bench", starterWhen: "clip4Label", with: ["art-card-4"], fitProp: "clipFit" },
  { key: "clip5", fit: "cover", starter: "ring-emerald", starterWhen: "clip5Label", with: ["art-card-5"], fitProp: "clipFit" },
  { key: "brandLogo", fit: "contain" },
];

const DEFAULT_PROPS = { ...pieceReelBase.defaultProps, ...mediaControlsDefaults(PIECE_REEL_MEDIA) };

export const PieceReelV1 = defineMosaicTemplate<PieceReelV1Props>({
  id: asTemplateId(ID),
  capabilities: pieceReelBase.capabilities,
  outputHints: pieceReelBase.outputHints,
  resolveOutputHints: pieceReelBase.resolveOutputHints,
  propsSchema: mediaControlsSchema(codeSchema(pieceReelBase.propsSchema), PIECE_REEL_MEDIA),
  defaultProps: DEFAULT_PROPS,
  bindings: mediaControlsBindings(pieceReelBase.bindings, PIECE_REEL_MEDIA),
  render: renderWithMediaControls<PieceReelV1Props>(pieceReelBase, ID, PIECE_REEL_MEDIA, { defaults: DEFAULT_PROPS }),
});

export default PieceReelV1;

type Slot = { k: number; ref: string; label: string; detail: string; art: ArtKind };

async function render(props: PieceReelProps, ctx: MosaicEngineContext): Promise<MosaicDocumentPipeline> {
  const brandName = pickRequired(ID, props.brandName, DEFAULTS.brandName, "brandName", "the reel is someone's");
  const logoRef = pickMedia(ID, props.brandLogo, "brandLogo");
  const clipSec = pickNumber(ID, props.secondsPerClip, DEFAULTS.secondsPerClip, REEL_MIN_CLIP, REEL_MAX_CLIP, "secondsPerClip");
  const metal = pickOneOf(ID, props.metal, JEWEL_METALS, DEFAULTS.metal, "metal");
  const stone = pickOneOf(ID, props.stone, JEWEL_STONES, DEFAULTS.stone, "stone");
  pickOneOf(ID, props.platform, JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
  const P = palette(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
  const tone = artTone(metal, stone, P.ink, P.accent);
  const hook = pickText(ID, props.hook, DEFAULTS.hook, "hook");
  const strip = pickBool(ID, props.boothStrip, DEFAULTS.boothStrip, "boothStrip");
  const fit = pickOneOf(ID, props.clipFit, CLIP_FITS, DEFAULTS.clipFit, "clipFit");

  const d = DEFAULTS as Record<string, unknown>;
  const p = props as Record<string, unknown>;
  const slots: Slot[] = Array.from({ length: REEL_MAX_CLIPS }, (_, i) => i + 1)
    .map((k) => ({
      k,
      ref: pickMedia(ID, p[`clip${k}`], `clip${k}`),
      label: pickText(ID, p[`clip${k}Label`], d[`clip${k}Label`] as string, `clip${k}Label`),
      detail: pickText(ID, p[`clip${k}Detail`], d[`clip${k}Detail`] as string, `clip${k}Detail`),
      art: pickOneOf(ID, p[`clip${k}Art`], ART_KINDS, d[`clip${k}Art`] as ArtKind, `clip${k}Art`),
    }))
    .filter((s) => s.ref.length > 0 || s.label.length > 0);
  if (slots.length === 0) throw new Error(`${ID}: at least one clip slot needs a clip or a label - a reel has pieces.`);

  // A show is real when it has a name; the rest of its row is optional.
  const shows = [1, 2]
    .map((k) => ({
      k,
      name: pickText(ID, p[`show${k}Name`], d[`show${k}Name`] as string, `show${k}Name`),
      dates: pickText(ID, p[`show${k}Dates`], d[`show${k}Dates`] as string, `show${k}Dates`),
      place: pickText(ID, p[`show${k}Place`], d[`show${k}Place`] as string, `show${k}Place`),
      booth: pickText(ID, p[`show${k}Booth`], d[`show${k}Booth`] as string, `show${k}Booth`),
    }))
    .filter((s) => s.name.length > 0);
  const first = shows.find((s) => s.k === 1);
  const stripText = strip && first ? [first.name, first.dates, first.booth ? boothText(first.booth) : ""].filter(Boolean).join(" · ") : "";

  const T = reelTiming(slots.length, clipSec, resolvePinnedDurationMs(ctx));
  const totalSec = T.totalMs / 1000;
  const W = Math.max(1, Math.round(ctx.target.width));
  const H = Math.max(1, Math.round(ctx.target.height));
  const debug = props.debugLayout === true;
  const xSec = T.xfadeMs / 1000;
  const rise = round3(Math.min(0.4, 0.12 * clipSec));
  const arrive = (atSec: number): MosaicOverlayExpr => entrance({ kind: "rise", durationMs: rise * 1000, atSec: round3(atSec), ease: "easeOut" });

  /** The progress line runs across the whole reel: each step starts it where the last one left off. */
  const progress = (offsetSec: number) =>
    bindProp(tileSource(P.accent, "progress", { overlay: { xExpr: `-W*(1-min(1,(t+${round3(offsetSec)})/${round3(totalSec)}))` } }), "accent");

  const anyDetail = slots.some((s) => s.detail.length > 0);
  const files: MosaicDocument[] = slots.map((s, i) => {
    const stepSec = T.steps[i] / 1000;
    const L = layoutClipStep({ brandName, hook: i === 0 ? hook : "", hookSize: hook, label: s.label, detail: s.detail, anyDetail, strip: stripText }, W, H);
    const assets: NonNullable<MosaicDocument["assets"]> = {};
    const { pieces, piece } = pieceList();
    // Frame 0 of the reel is the thumbnail: the first step's words are static; later words rise in after the fade.
    const enter = i === 0 ? undefined : arrive(xSec);
    if (s.ref) {
      const id = fileAssetId(s.ref, `clip-${s.k}`);
      const kind = mediaKindOf(ctx, String(id), s.ref);
      assets[id] = { kind: "file", path: s.ref, mediaType: kind };
      piece(L.media, 1, bindProp(clipSource(id, kind, `clip-${s.k}`, fit), `clip${s.k}`, 0));
    } else {
      const artId = svgAsset(jewelArtSvg(s.art, tone), `clip-${s.k}-art`, `${s.art} (bundled art)`, assets);
      piece(L.artCard, 1, bindProp(tileSource(P.card, `art-card-${s.k}`, { radius: 0.1 }), "accent"));
      piece(L.art, 2, bindProp(artSource(artId, `art-${s.k}`, stepSec), `clip${s.k}`, 0));
    }
    piece(L.wordmark.rect, 2, bindProps(textSource(L.wordmark.fit, P.ink, "wordmark", undefined, "left"), [{ propKey: "brandName" }, { propKey: "brandLogo", index: 0 }]));
    if (L.hook) piece(L.hook.rect, 2, bindProp(textSource(L.hook.fit, P.ink, "hook", undefined, "left"), "hook"));
    if (L.label) piece(L.label.rect, 2, bindProp(textSource(L.label.fit, P.ink, `label-${s.k}`, enter, "left"), `clip${s.k}Label`));
    if (L.detail) piece(L.detail.rect, 2, bindProp(textSource(L.detail.fit, P.dim, `detail-${s.k}`, enter, "left"), `clip${s.k}Detail`));
    if (L.stripBand && L.strip) {
      piece(L.stripBand, 3, bindProp(tileSource(P.accent, "strip-band"), "accent"));
      piece(L.strip.rect, 4, bindProps(textSource(L.strip.fit, P.onAccent, "strip"), [{ propKey: "show1Name" }, { propKey: "show1Dates" }, { propKey: "show1Booth" }]));
    }
    piece(L.bar, 5, progress(T.starts[i] / 1000));
    return finishDocument(ID, ctx, W, H, pieces, assets, P.bg, T.steps[i], `Piece Reel - ${s.label || `clip ${s.k}`}`, clipStepContract(L, s.k), debug);
  });

  // The closing card: brand, line, shows. It arrives through the crossfade; the line and the shows rise in after it.
  const copy: ClosingCopy = {
    brandName,
    hasLogo: logoRef.length > 0,
    tagline: pickText(ID, props.tagline, DEFAULTS.tagline, "tagline"),
    cta: pickText(ID, props.ctaLine, DEFAULTS.ctaLine, "ctaLine"),
    shows: shows.map((s) => ({ name: s.name, meta: [s.dates, s.place].filter(Boolean).join(" · "), booth: s.booth ? boothText(s.booth) : "" })),
  };
  const C = layoutClosing(copy, W, H);
  {
    const assets: NonNullable<MosaicDocument["assets"]> = {};
    const { pieces, piece } = pieceList();
    const logo = logoAsset(ctx, logoRef, assets);
    if (C.logo && logo.id) piece(C.logo, 2, bindProp(mediaSource(logo.id, logo.kind, "logo"), "brandLogo", 0));
    if (C.wordmark) piece(C.wordmark.rect, 2, bindProps(textSource(C.wordmark.fit, P.ink, "wordmark"), [{ propKey: "brandName" }, { propKey: "brandLogo", index: 0 }]));
    if (C.tagline) piece(C.tagline.rect, 2, bindProp(textSource(C.tagline.fit, P.dim, "tagline"), "tagline"));
    piece(C.rule, 2, bindProp(tileSource(P.accent, "rule"), "accent"));
    const stagger = round3(Math.min(0.3, 0.08 * clipSec));
    if (C.cta) piece(C.cta.rect, 2, bindProp(textSource(C.cta.fit, P.ink, "cta", arrive(xSec + stagger)), "ctaLine"));
    C.shows.forEach((L, i) => {
      const k = shows[i].k;
      const enter = arrive(xSec + stagger * (i + 2));
      piece(L.card, 2, tileSource(P.card, `show-${k}-card`, { radius: 0.12, overlay: enter }));
      piece(L.name.rect, 3, bindProp(textSource(L.name.fit, P.ink, `show-${k}-name`, enter, "left"), `show${k}Name`));
      if (L.meta) piece(L.meta.rect, 3, bindProps(textSource(L.meta.fit, P.dim, `show-${k}-meta`, enter, "left"), [{ propKey: `show${k}Dates` }, { propKey: `show${k}Place` }]));
      if (L.booth) piece(L.booth.rect, 3, bindProp(textSource(L.booth.fit, P.accent, `show-${k}-booth`, enter, "left"), `show${k}Booth`));
    });
    piece(C.bar, 5, progress(T.starts[slots.length] / 1000));
    files.push(finishDocument(ID, ctx, W, H, pieces, assets, P.bg, T.steps[slots.length], `Piece Reel - ${brandName} closing`, closingContract(C, shows.map((s) => s.k)), debug));
  }

  return {
    kind: "mosaic_pipeline",
    version: 1,
    emit: "single",
    size: { width: W, height: H },
    fps: ctx.target.fps,
    durationMs: T.totalMs,
    backgroundColor: P.bg,
    steps: files.map((file, i) => ({
      name: i < slots.length ? `clip-${slots[i].k}` : "closing",
      durationMs: T.steps[i],
      ...(i < files.length - 1 && T.xfadeMs > 0 ? { transitionToNext: { type: "fade" as const, durationMs: T.xfadeMs } } : {}),
      file,
    })),
  };
}

/** A clip covering the frame: video loops muted if it is shorter than its slot. */
function clipSource(assetId: ReturnType<typeof fileAssetId>, kind: "image" | "video", label: string, fit: ClipFit): MosaicSource {
  return tag({
    type: "media",
    mediaType: kind,
    assetId,
    placement: fit === "cover" ? { fit: "cover" } : { fit: "contain", vAlign: "middle" },
    ...(kind === "video" ? { playback: { loopMode: "loop" }, audio: { enabled: false } } : {}),
    editor: { owner: "template" },
  } as MosaicSource, label);
}

/** The bundled art, still (a slow push-in through the engine's camera jitters); `_stepSec` kept for the call sites. */
function artSource(assetId: ReturnType<typeof fileAssetId>, label: string, _stepSec: number): MosaicSource {
  void _stepSec;
  return tag({
    type: "media",
    mediaType: "image",
    assetId,
    placement: { fit: "contain", vAlign: "middle" },
    editor: { owner: "template" },
  } as MosaicSource, label);
}

/** The step layout, for tests (named for the reel: the pack index re-exports every module's names). */
export { layoutClipStep as layoutReelStep };
