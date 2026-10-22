import type { MosaicDocument, MosaicEngineContext, MosaicSource } from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { bindProps, defineMosaicTemplate, definePropsSchema, resolvePinnedDurationMs, tag } from "@m0saic/template-utils";
import {
  JEWEL_DEFAULT_ACCENT,
  JEWEL_METALS,
  JEWEL_PLATFORMS,
  JEWEL_PLATFORM_KEYS,
  JEWEL_STONES,
  JEWEL_THEMES,
  chromePieces,
  clampTo,
  finishDocument,
  logoAsset,
  motion,
  numberOr,
  palette,
  pickInt,
  pickMedia,
  pickNumber,
  pickOneOf,
  pickRequired,
  pickText,
  pieceList,
  platformDims,
  shareBeats,
  svgAsset,
  tileSource,
  type JewelMetal,
  type JewelPlatform,
  type JewelStone,
  type JewelTheme,
  type Rect,
} from "../../../_shared/jewel";
import { ART_KINDS, artTone, jewelArtSvg, type ArtKind } from "../../../_shared/jewel-art";
import { codeSchema } from "../../../_shared/vnext";
import { blockPieces, heroAsset, heroMediaSource, layoutPhotoLed, photoLedContract, type HeroAsset, type LedBlock } from "../../../_shared/photo-led";
import {
  mediaControlsBindings,
  mediaControlsDefaults,
  mediaControlsSchema,
  renderWithMediaControls,
  type MediaControlProps,
  type MediaSlot,
} from "../../../_shared/media-controls";

/**
 * `@jewelry/social/new-arrivals/v1` - the drop: "48 new pieces, Friday at 10",
 * four of them shown.
 *
 * ONE CONCEPT: **the count is the hook, the pieces are the proof.** A store that
 * restocks every week announces it the same way every time; the receiving log
 * already has the count and the photos. So the weekly post is a weekly render.
 *
 * The drop itself is the hero (`_shared/photo-led.ts`): the pieces' photos as
 * one mosaic that fills the photo side edge to edge - two side by side, three
 * as one large and two small, four as a 2x2 - arriving one by one; the count,
 * the day and the pieces' names on the other side. Every media input edits in
 * place (`_shared/media-controls.ts`): an area drawn on the preview moves and
 * resizes it (the crop is the area), and its fit picks cover or contain. An
 * empty slot shows a real piece from the starter pack, never clip art; the
 * bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `newArrivalsBase` is the drop as such (the tests
 * hold the controls to it), `NewArrivalsV1` is that drop with its media
 * controls - the template this repo ships.
 */

export type NewArrivalsProps = {
  /** Where the clip is going (feed | story | square | landscape | email): sets the canvas. */
  platform?: string;
  /** The small wordmark on every frame. Required. */
  brandName?: string;
  /** Zero or one logo (image or short video) in place of the wordmark. */
  brandLogo?: string[];
  /** Above the number: "Just in". Empty removes it. */
  kicker?: string;
  /** How many pieces, 1..9999. */
  count?: number;
  /** The words after the count: "new pieces". Required. */
  countLabel?: string;
  /** When: "Friday at 10". Empty removes it. */
  whenLine?: string;
  /** Each item: its name (empty drops the tile), its bundled art, its photo. */
  item1Name?: string;
  item1Art?: string;
  item1Image?: string[];
  item2Name?: string;
  item2Art?: string;
  item2Image?: string[];
  item3Name?: string;
  item3Art?: string;
  item3Image?: string[];
  item4Name?: string;
  item4Art?: string;
  item4Image?: string[];
  /** The last line. Empty removes it. */
  ctaLabel?: string;
  /** Where to go, under the call to action. Empty removes it. */
  ctaUrl?: string;
  /** The metal every bundled illustration is drawn in. */
  metal?: string;
  /** The stone every bundled illustration is drawn with. */
  stone?: string;
  /** ivory | noir | velvet | blush - the page and text pair. */
  theme?: string;
  /** The brand colour (#rrggbb): the count, the kicker, the progress line. */
  accent?: string;
  /** The page (#rrggbb). Empty takes the theme's. */
  background?: string;
  /** The text (#rrggbb). Empty takes the theme's. */
  ink?: string;
  /** Clip length in whole seconds (5..30). */
  durationSec?: number;
  /** Dev-only: check the layout contract and draw it over the frame. */
  debugLayout?: boolean;
};

/** The shipped props: the drop's own, plus an area and a fit per media input. */
export type NewArrivalsV1Props = NewArrivalsProps & MediaControlProps;

const ID = "@jewelry/social/new-arrivals/v1";
export const ARRIVALS_MIN_SEC = 5;
export const ARRIVALS_MAX_SEC = 30;

const DEFAULTS = {
  platform: "feed" as JewelPlatform,
  brandName: "Maison Lumen",
  kicker: "Just in",
  count: 48,
  countLabel: "new pieces",
  whenLine: "Friday at 10, in store and online",
  // The names match the starter photos the empty slots show.
  item1Name: "Emerald Cluster Ring",
  item1Art: "solitaire" as ArtKind,
  item2Name: "Diamond Cluster Drops",
  item2Art: "studs" as ArtKind,
  item3Name: "Diamond Line Bracelet",
  item3Art: "tennis" as ArtKind,
  item4Name: "Heart Drop Bar Necklace",
  item4Art: "pendant" as ArtKind,
  ctaLabel: "First look for subscribers Thursday night",
  ctaUrl: "maisonlumen.example/new",
  metal: "gold" as JewelMetal,
  stone: "diamond" as JewelStone,
  theme: "ivory" as JewelTheme,
  accent: JEWEL_DEFAULT_ACCENT,
  durationSec: 8,
};

const media = { type: "media[]" as const, required: false, meta: { control: { multiple: false, picker: "file" as const, accept: ["image" as const] } } };
const art = { type: "string" as const, required: false, meta: { constraints: { oneOf: [...ART_KINDS] } } };
const str = { type: "string" as const, required: false };
const propsSchema = definePropsSchema<NewArrivalsProps>({
  platform: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_PLATFORM_KEYS] } } },
  brandName: str,
  brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  kicker: str,
  count: { type: "number", required: false, meta: { constraints: { min: 1, max: 9999 } } },
  countLabel: str,
  whenLine: str,
  item1Name: str,
  item1Art: art,
  item1Image: media,
  item2Name: str,
  item2Art: art,
  item2Image: media,
  item3Name: str,
  item3Art: art,
  item3Image: media,
  item4Name: str,
  item4Art: art,
  item4Image: media,
  ctaLabel: str,
  ctaUrl: str,
  metal: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_METALS] } } },
  stone: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_STONES] } } },
  theme: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_THEMES] } } },
  accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
  background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  durationSec: { type: "number", required: false, meta: { constraints: { min: ARRIVALS_MIN_SEC, max: ARRIVALS_MAX_SEC } } },
  debugLayout: { type: "boolean", required: false },
});

/**
 * The drop as such: the pieces as one mosaic on the photo side, the count and
 * the words on the other. Not a template of its own - `NewArrivalsV1` wraps it
 * with the media controls - but the tests hold the controls to it: given its
 * words and a file in every slot, the two render the same frame.
 */
export const newArrivalsBase = defineMosaicTemplate<NewArrivalsProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },
  outputHints: {
    ...JEWEL_PLATFORMS[DEFAULTS.platform],
    fps: 30,
    durationMs: DEFAULTS.durationSec * 1000,
    format: { kind: "video", container: "mp4" },
    note: "The canvas follows the platform knob (feed 4:5 by default; landscape and email put the count beside the pieces); an explicit -w/-h wins.",
  },
  resolveOutputHints: (props) => ({
    ...platformDims(props?.platform, DEFAULTS.platform),
    durationMs: Math.round(numberOr(props?.durationSec, DEFAULTS.durationSec, ARRIVALS_MIN_SEC, ARRIVALS_MAX_SEC) * 1000),
  }),
  propsSchema,
  defaultProps: {
    platform: DEFAULTS.platform,
    brandName: DEFAULTS.brandName,
    brandLogo: [],
    kicker: DEFAULTS.kicker,
    count: DEFAULTS.count,
    countLabel: DEFAULTS.countLabel,
    whenLine: DEFAULTS.whenLine,
    item1Name: DEFAULTS.item1Name,
    item1Art: DEFAULTS.item1Art,
    item1Image: [],
    item2Name: DEFAULTS.item2Name,
    item2Art: DEFAULTS.item2Art,
    item2Image: [],
    item3Name: DEFAULTS.item3Name,
    item3Art: DEFAULTS.item3Art,
    item3Image: [],
    item4Name: DEFAULTS.item4Name,
    item4Art: DEFAULTS.item4Art,
    item4Image: [],
    ctaLabel: DEFAULTS.ctaLabel,
    ctaUrl: DEFAULTS.ctaUrl,
    metal: DEFAULTS.metal,
    stone: DEFAULTS.stone,
    theme: DEFAULTS.theme,
    accent: DEFAULTS.accent,
    durationSec: DEFAULTS.durationSec,
    debugLayout: false,
  },
  bindings: { unbound: { background: "canvas", ink: "theme", durationSec: "timing" } },
  render,
});

/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export const NEW_ARRIVALS_MEDIA: MediaSlot[] = [
  { key: "item1Image", fit: "cover", starter: "ring-emerald" },
  { key: "item2Image", fit: "cover", starter: "earrings-drops" },
  { key: "item3Image", fit: "cover", starter: "bracelet-tennis" },
  { key: "item4Image", fit: "cover", starter: "necklace-bar" },
  { key: "brandLogo", fit: "contain" },
];

const DEFAULT_PROPS = { ...newArrivalsBase.defaultProps, ...mediaControlsDefaults(NEW_ARRIVALS_MEDIA) };

export const NewArrivalsV1 = defineMosaicTemplate<NewArrivalsV1Props>({
  id: asTemplateId(ID),
  capabilities: newArrivalsBase.capabilities,
  outputHints: newArrivalsBase.outputHints,
  resolveOutputHints: newArrivalsBase.resolveOutputHints,
  propsSchema: mediaControlsSchema(codeSchema(newArrivalsBase.propsSchema), NEW_ARRIVALS_MEDIA),
  defaultProps: DEFAULT_PROPS,
  bindings: mediaControlsBindings(newArrivalsBase.bindings, NEW_ARRIVALS_MEDIA),
  render: renderWithMediaControls<NewArrivalsV1Props>(newArrivalsBase, ID, NEW_ARRIVALS_MEDIA, { defaults: DEFAULT_PROPS }),
});

export default NewArrivalsV1;

/**
 * The mosaic: n tiles cut from the photo side, `gap` apart. Two split the long side; three give the first piece the
 * larger part and stack the other two; four are a 2x2.
 */
export function arrivalTiles(hero: Rect, n: number, gap: number): Rect[] {
  const { x, y, w, h } = hero;
  const wide = w >= h;
  const half = (a: number) => Math.floor((a - gap) / 2);
  if (n <= 1) return [hero];
  if (n === 2) return wide ? [{ x, y, w: half(w), h }, { x: x + half(w) + gap, y, w: w - half(w) - gap, h }] : [{ x, y, w, h: half(h) }, { x, y: y + half(h) + gap, w, h: h - half(h) - gap }];
  if (n === 3) {
    if (wide) {
      const big = Math.round((w - gap) * 0.58);
      const rx = x + big + gap;
      return [{ x, y, w: big, h }, { x: rx, y, w: w - big - gap, h: half(h) }, { x: rx, y: y + half(h) + gap, w: w - big - gap, h: h - half(h) - gap }];
    }
    const big = Math.round((h - gap) * 0.58);
    const ry = y + big + gap;
    return [{ x, y, w, h: big }, { x, y: ry, w: half(w), h: h - big - gap }, { x: x + half(w) + gap, y: ry, w: w - half(w) - gap, h: h - big - gap }];
  }
  const cw = half(w);
  const ch = half(h);
  return [
    { x, y, w: cw, h: ch },
    { x: x + cw + gap, y, w: w - cw - gap, h: ch },
    { x, y: y + ch + gap, w: cw, h: h - ch - gap },
    { x: x + cw + gap, y: y + ch + gap, w: w - cw - gap, h: h - ch - gap },
  ];
}

async function render(props: NewArrivalsProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
  const brandName = pickRequired(ID, props.brandName, DEFAULTS.brandName, "brandName", "the post is from someone");
  const countLabel = pickRequired(ID, props.countLabel, DEFAULTS.countLabel, "countLabel", "the count says what it counts");
  const count = Math.round(pickNumber(ID, props.count, DEFAULTS.count, 1, 9999, "count"));
  const logoRef = pickMedia(ID, props.brandLogo, "brandLogo");
  const metal = pickOneOf(ID, props.metal, JEWEL_METALS, DEFAULTS.metal, "metal");
  const stone = pickOneOf(ID, props.stone, JEWEL_STONES, DEFAULTS.stone, "stone");
  pickOneOf(ID, props.platform, JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
  const P = palette(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
  const tone = artTone(metal, stone, P.ink, P.accent);

  const assets: NonNullable<MosaicDocument["assets"]> = {};
  const logo = logoAsset(ctx, logoRef, assets);
  const d = DEFAULTS as Record<string, unknown>;
  const p = props as Record<string, unknown>;
  // The pieces, in order; an empty name drops the tile.
  const items: Array<{ k: number; name: string; hero: HeroAsset; heroKey: string }> = [];
  for (const k of [1, 2, 3, 4] as const) {
    const name = pickText(ID, p[`item${k}Name`], d[`item${k}Name`] as string, `item${k}Name`);
    if (!name) continue;
    const artKind = pickOneOf(ID, p[`item${k}Art`], ART_KINDS, d[`item${k}Art`] as ArtKind, `item${k}Art`);
    const ref = pickMedia(ID, p[`item${k}Image`], `item${k}Image`);
    const hero: HeroAsset = ref ? heroAsset(ctx, ref, `item-${k}-image`, assets) : { kind: "art", id: svgAsset(jewelArtSvg(artKind, tone), `item-${k}-art`, `${artKind} (bundled art)`, assets) };
    items.push({ k, name, hero, heroKey: `item${k}Image` });
  }
  if (items.length === 0) throw new Error(`${ID}: at least one item needs a name - a drop shows something.`);

  const blocks: LedBlock[] = [
    { label: "kicker", role: "kicker", text: pickText(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }], beat: 0 },
    { label: "count", role: "numeral", text: String(count), bind: [{ propKey: "count" }], beat: 0, keep: true },
    { label: "count-label", role: "subtitle", text: countLabel, bind: [{ propKey: "countLabel" }], beat: 0 },
    { label: "when", role: "body", text: pickText(ID, props.whenLine, DEFAULTS.whenLine, "whenLine"), bind: [{ propKey: "whenLine" }] },
    { label: "names", role: "aside", text: items.map((i) => i.name).join(" · "), bind: items.map((i) => ({ propKey: `item${i.k}Name` })) },
    { label: "cta", role: "cta", text: pickText(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }, { propKey: "ctaUrl" }] },
    { label: "cta-url", role: "url", text: pickText(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
  ];

  const pinned = resolvePinnedDurationMs(ctx);
  const durationMs = pinned !== undefined ? Math.round(pinned) : pickInt(ID, props.durationSec, DEFAULTS.durationSec, ARRIVALS_MIN_SEC, ARRIVALS_MAX_SEC, "durationSec") * 1000;
  const T = shareBeats(durationMs / 1000, [25, 75]);
  const m = motion(T);

  const W = Math.max(1, Math.round(ctx.target.width));
  const H = Math.max(1, Math.round(ctx.target.height));
  const L = layoutPhotoLed(W, H, brandName, logoRef.length > 0, blocks);
  const clamp = clampTo(W, H);
  const { pieces, piece } = pieceList();
  chromePieces(piece, L.chrome, P, logo, T.total);
  // A tile is its piece: its photo and its name edit there (the names line is the first thing dropped for room).
  // The photo side is the page between the tiles (the hero the contract holds to its share), then each piece.
  piece(L.hero, 1, tileSource(P.bg, "hero"));
  const gap = Math.max(2, Math.round(0.008 * Math.min(W, H)));
  arrivalTiles(L.hero, items.length, gap).forEach((r, i) => {
    const it = items[i]!;
    const rect = clamp(r);
    const enter = m.arrive(0, i, undefined, "fade");
    if (it.hero.kind === "media") {
      const src = heroMediaSource(it.hero, `item-${it.k}-photo`);
      piece(rect, 2, bindProps({ ...src, overlay: enter } as MosaicSource, [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
    } else {
      piece(rect, 2, bindProps(tileSource(P.card, `item-${it.k}-photo`, { overlay: enter }), [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
      const side = Math.round(Math.min(rect.w, rect.h) * 0.66);
      const art = clamp({ x: rect.x + (rect.w - side) / 2, y: rect.y + (rect.h - side) / 2, w: side, h: side });
      const src = tileArt(it.hero.id, `item-${it.k}-art`);
      piece(art, 3, bindProps({ ...src, overlay: enter } as MosaicSource, [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
    }
  });
  blockPieces(piece, L.placed, P, T, L.align);

  return finishDocument(ID, ctx, W, H, pieces, assets, P.bg, durationMs, `New Arrivals - ${count} ${countLabel}`, photoLedContract(L), props.debugLayout === true);
}

/** Bundled art on its panel, contained (the art fallback when an item has no photo). */
function tileArt(id: Extract<HeroAsset, { kind: "art" }>["id"], label: string): MosaicSource {
  return tag({ type: "media", mediaType: "image", assetId: id, placement: { fit: "contain", vAlign: "middle" }, editor: { owner: "template" } } as MosaicSource, label);
}
