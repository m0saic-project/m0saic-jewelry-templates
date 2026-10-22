import type { MosaicDocument, MosaicEngineContext } from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { bindProp, defineMosaicTemplate, definePropsSchema } from "@m0saic/template-utils";
import {
  JEWEL_DEFAULT_ACCENT,
  JEWEL_METALS,
  JEWEL_STONES,
  JEWEL_THEMES,
  chromePieces,
  finishDocument,
  formatPrice,
  logoAsset,
  palette,
  pickMedia,
  pickNumber,
  pickOneOf,
  pickRequired,
  pickText,
  pieceList,
  svgAsset,
  tileSource,
  type JewelMetal,
  type JewelStone,
  type JewelTheme,
} from "../../../_shared/jewel";
import { ART_KINDS, artTone, jewelArtSvg, type ArtKind } from "../../../_shared/jewel-art";
import { codeSchema } from "../../../_shared/vnext";
import { blockPieces, heroAsset, heroPieces, layoutPhotoLed, photoLedContract, type LedBlock } from "../../../_shared/photo-led";
import {
  mediaControlsBindings,
  mediaControlsDefaults,
  mediaControlsSchema,
  renderWithMediaControls,
  type MediaControlProps,
  type MediaSlot,
} from "../../../_shared/media-controls";

/**
 * `@jewelry/print/window-card/v1` - the card in the window, as a still.
 *
 * ONE CONCEPT: **the window is the store's only billboard.** The piece in the
 * window gets a card - the name, the metal and stone, the price - printed at a
 * card size and trimmed, and it is the one thing a passer-by reads before
 * deciding to come in. This is that card from the same product row the ads
 * use, at A7, A6 or 4x6 at 300 dpi.
 *
 * The photo takes the top of the card (its left half on a landscape print), the
 * name, spec and price centred under it, a thin accent line on the card's edge
 * (`_shared/photo-led.ts`). A still: no progress line, no motion. Every media
 * input edits in place (`_shared/media-controls.ts`): an area drawn on the
 * preview moves and resizes it (the crop is the area), and its fit picks cover
 * or contain. An empty slot shows a real piece from the starter pack, never
 * clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `windowCardBase` is the card as such (the tests
 * hold the controls to it), `WindowCardV1` is that card with its media
 * controls - the template this repo ships.
 */

export const CARD_SIZES = ["a7", "a6", "4x6"] as const;
export type CardSize = (typeof CARD_SIZES)[number];
/**
 * Portrait, about 300 dpi: A7 74x105 mm, A6 105x148 mm, 4x6 in. The engine wants
 * 5-smooth canvas sides (only 2, 3 and 5 as factors), so the A sizes are rounded
 * to the nearest smooth pair at the same ratio (A7 874x1240 → 900x1280, A6
 * 1240x1748 → 1280x1800); 4x6 at 300 dpi is already smooth.
 */
export const CARD_DIMS: Record<CardSize, { width: number; height: number }> = {
  a7: { width: 900, height: 1280 },
  a6: { width: 1280, height: 1800 },
  "4x6": { width: 1200, height: 1800 },
};

export type WindowCardProps = {
  /** a7 | a6 | 4x6 - the print size; sets the canvas. */
  cardSize?: string;
  /** The small wordmark at the top of the card. Required. */
  brandName?: string;
  /** Zero or one logo in place of the wordmark. */
  brandLogo?: string[];
  /** The collection, small, in the accent. Empty removes it. */
  kicker?: string;
  /** The piece. Required. */
  productName?: string;
  /** Metal, stone, size - one or two lines. Empty removes it. */
  specLine?: string;
  /** The price. Required, above 0. */
  price?: number;
  /** The currency symbol before the price. */
  currency?: string;
  /** Under the price: "Ask to try it on". Empty removes it. */
  stampLine?: string;
  /** Which bundled illustration stands in for the piece when there is no photo. */
  productArt?: string;
  /** The metal the bundled art is drawn in (gold | rose | white | platinum). */
  metal?: string;
  /** The stone the bundled art is drawn with. */
  stone?: string;
  /** Zero or one photo of the piece (absolute path). */
  productImage?: string[];
  /** ivory | noir | velvet | blush - the paper and text pair. */
  theme?: string;
  /** The brand colour (#rrggbb): the edge line, the kicker, the price. */
  accent?: string;
  /** The paper (#rrggbb). Empty takes the theme's. */
  background?: string;
  /** The text (#rrggbb). Empty takes the theme's. */
  ink?: string;
  /** Dev-only: check the layout contract and draw it over the frame. */
  debugLayout?: boolean;
};

/** The shipped props: the card's own, plus an area and a fit per media input. */
export type WindowCardV1Props = WindowCardProps & MediaControlProps;

const ID = "@jewelry/print/window-card/v1";

const DEFAULTS = {
  cardSize: "a7" as CardSize,
  brandName: "Maison Lumen",
  kicker: "In the window this week",
  productName: "The Aurelia Solitaire",
  // The words match the starter photo an empty slot shows (a white-gold solitaire).
  specLine: "18K white gold, four-prong diamond solitaire",
  price: 5600,
  currency: "$",
  stampLine: "Ask to try it on",
  productArt: "solitaire" as ArtKind,
  metal: "gold" as JewelMetal,
  stone: "diamond" as JewelStone,
  theme: "ivory" as JewelTheme,
  accent: JEWEL_DEFAULT_ACCENT,
};

const str = { type: "string" as const, required: false };
const propsSchema = definePropsSchema<WindowCardProps>({
  cardSize: { type: "string", required: false, meta: { constraints: { oneOf: [...CARD_SIZES] } } },
  brandName: str,
  brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  kicker: str,
  productName: str,
  specLine: str,
  price: { type: "number", required: false, meta: { constraints: { min: 1, max: 100_000_000 } } },
  currency: str,
  stampLine: str,
  productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...ART_KINDS] } } },
  metal: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_METALS] } } },
  stone: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_STONES] } } },
  productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image"] } } },
  theme: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_THEMES] } } },
  accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
  background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  debugLayout: { type: "boolean", required: false },
});

const cardDims = (size: unknown): { width: number; height: number } =>
  CARD_DIMS[(CARD_SIZES as readonly string[]).includes(String(size)) ? (size as CardSize) : DEFAULTS.cardSize];

/**
 * The card as such: the photo on top, the words centred under it. Not a
 * template of its own - `WindowCardV1` wraps it with the media controls - but
 * the tests hold the controls to it: given its words and a file in every slot,
 * the two render the same frame.
 */
export const windowCardBase = defineMosaicTemplate<WindowCardProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },
  outputHints: {
    ...CARD_DIMS[DEFAULTS.cardSize],
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "A still at a print card size, portrait, 300 dpi: A7 by default, A6 or 4x6 from the card-size knob; an explicit -w/-h wins.",
  },
  resolveOutputHints: (props) => ({ ...cardDims(props?.cardSize) }),
  propsSchema,
  defaultProps: {
    cardSize: DEFAULTS.cardSize,
    brandName: DEFAULTS.brandName,
    brandLogo: [],
    kicker: DEFAULTS.kicker,
    productName: DEFAULTS.productName,
    specLine: DEFAULTS.specLine,
    price: DEFAULTS.price,
    currency: DEFAULTS.currency,
    stampLine: DEFAULTS.stampLine,
    productArt: DEFAULTS.productArt,
    metal: DEFAULTS.metal,
    stone: DEFAULTS.stone,
    productImage: [],
    theme: DEFAULTS.theme,
    accent: DEFAULTS.accent,
    debugLayout: false,
  },
  // A still with no progress line: the accent's handle is the edge line.
  bindings: { unbound: { background: "canvas", ink: "theme" } },
  render,
});

/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export const WINDOW_CARD_MEDIA: MediaSlot[] = [
  { key: "productImage", fit: "cover", starter: "ring-solitaire" },
  { key: "brandLogo", fit: "contain" },
];

const DEFAULT_PROPS = { ...windowCardBase.defaultProps, ...mediaControlsDefaults(WINDOW_CARD_MEDIA) };

export const WindowCardV1 = defineMosaicTemplate<WindowCardV1Props>({
  id: asTemplateId(ID),
  capabilities: windowCardBase.capabilities,
  outputHints: windowCardBase.outputHints,
  resolveOutputHints: windowCardBase.resolveOutputHints,
  propsSchema: mediaControlsSchema(codeSchema(windowCardBase.propsSchema), WINDOW_CARD_MEDIA),
  defaultProps: DEFAULT_PROPS,
  bindings: mediaControlsBindings(windowCardBase.bindings, WINDOW_CARD_MEDIA),
  render: renderWithMediaControls<WindowCardV1Props>(windowCardBase, ID, WINDOW_CARD_MEDIA, { defaults: DEFAULT_PROPS }),
});

export default WindowCardV1;

async function render(props: WindowCardProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
  const brandName = pickRequired(ID, props.brandName, DEFAULTS.brandName, "brandName", "the card is a store's");
  const productName = pickRequired(ID, props.productName, DEFAULTS.productName, "productName", "the card names a piece");
  const price = pickNumber(ID, props.price, DEFAULTS.price, 1, 100_000_000, "price");
  const currency = pickText(ID, props.currency, DEFAULTS.currency, "currency");
  const logoRef = pickMedia(ID, props.brandLogo, "brandLogo");
  const imageRef = pickMedia(ID, props.productImage, "productImage");
  pickOneOf(ID, props.cardSize, CARD_SIZES, DEFAULTS.cardSize, "cardSize");
  const art = pickOneOf(ID, props.productArt, ART_KINDS, DEFAULTS.productArt, "productArt");
  const metal = pickOneOf(ID, props.metal, JEWEL_METALS, DEFAULTS.metal, "metal");
  const stone = pickOneOf(ID, props.stone, JEWEL_STONES, DEFAULTS.stone, "stone");
  const P = palette(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });

  const assets: NonNullable<MosaicDocument["assets"]> = {};
  const logo = logoAsset(ctx, logoRef, assets);
  const hero = imageRef
    ? heroAsset(ctx, imageRef, "product-image", assets)
    : { kind: "art" as const, id: svgAsset(jewelArtSvg(art, artTone(metal, stone, P.ink, P.accent)), "product-art", `${art} (bundled art)`, assets) };

  const blocks: LedBlock[] = [
    { label: "kicker", role: "kicker", text: pickText(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
    { label: "name", role: "title", text: productName, bind: [{ propKey: "productName" }] },
    { label: "spec", role: "body", text: pickText(ID, props.specLine, DEFAULTS.specLine, "specLine"), bind: [{ propKey: "specLine" }] },
    { label: "price", role: "price", text: formatPrice(price, currency), bind: [{ propKey: "price" }, { propKey: "currency" }] },
    { label: "stamp", role: "aside", text: pickText(ID, props.stampLine, DEFAULTS.stampLine, "stampLine"), bind: [{ propKey: "stampLine" }] },
  ];

  const W = Math.max(1, Math.round(ctx.target.width));
  const H = Math.max(1, Math.round(ctx.target.height));
  const L = layoutPhotoLed(W, H, brandName, logoRef.length > 0, blocks, { bar: false, align: "center" });
  const { pieces, piece } = pieceList();
  chromePieces(piece, L.chrome, P, logo, 0, undefined, false);
  heroPieces(piece, L.hero, L.art, hero, P, "hero", "productImage");
  blockPieces(piece, L.placed, P, null, L.align);
  // The card's edge in the accent, over the photo's bleed too - the gilt line a case card has.
  const t = Math.max(2, Math.round(0.01 * Math.min(W, H)));
  for (const r of [{ x: 0, y: 0, w: W, h: t }, { x: 0, y: H - t, w: W, h: t }, { x: 0, y: t, w: t, h: H - 2 * t }, { x: W - t, y: t, w: t, h: H - 2 * t }]) {
    piece(r, 3, bindProp(tileSource(P.accent, "frame"), "accent"));
  }

  return finishDocument(ID, ctx, W, H, pieces, assets, P.bg, Math.max(1, Math.round(ctx.target.durationMs ?? 2000)), `Window Card - ${productName}`, photoLedContract(L), props.debugLayout === true);
}
