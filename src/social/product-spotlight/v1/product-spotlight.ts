import type { MosaicDocument, MosaicEngineContext } from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { defineMosaicTemplate, definePropsSchema, resolvePinnedDurationMs } from "@m0saic/template-utils";
import {
  JEWEL_DEFAULT_ACCENT,
  JEWEL_METALS,
  JEWEL_PLATFORMS,
  JEWEL_PLATFORM_KEYS,
  JEWEL_STONES,
  JEWEL_THEMES,
  formatPrice,
  numberOr,
  palette,
  pickInt,
  pickMedia,
  pickNumber,
  pickOneOf,
  pickRequired,
  pickText,
  platformDims,
  type JewelMetal,
  type JewelPlatform,
  type JewelStone,
  type JewelTheme,
} from "../../../_shared/jewel";
import { ART_KINDS, artTone, jewelArtSvg, type ArtKind } from "../../../_shared/jewel-art";
import { codeSchema } from "../../../_shared/vnext";
import { photoLedDocument, type LedBlock } from "../../../_shared/photo-led";
import {
  mediaControlsBindings,
  mediaControlsDefaults,
  mediaControlsSchema,
  renderWithMediaControls,
  type MediaControlProps,
  type MediaSlot,
} from "../../../_shared/media-controls";

/**
 * `@jewelry/social/product-spotlight/v1` - one piece, one social ad, photo-led.
 *
 * ONE CONCEPT: **the ad is a product row.** A jeweler's inventory system
 * already knows the piece: its name, its metal, its stone, its price and its
 * photo. Those fields ARE this template's props, so a new arrival becomes a
 * Story, a feed post and a square tile the moment it is entered - and a
 * hundred pieces are a loop over a hundred rows, inside one look.
 *
 * The piece - a photo or a clip - fills its side of the frame; the name, the
 * spec line, the price and where to go sit beside or under it
 * (`_shared/photo-led.ts`). Every media input edits in place
 * (`_shared/media-controls.ts`): it takes a photo or a clip, an area drawn on
 * the preview moves and resizes it (the crop is the area), and its fit picks
 * cover or contain. An empty slot shows a real piece from the starter pack,
 * never clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `productSpotlightBase` is the photo-led ad as
 * such (the tests hold the controls to it), `ProductSpotlightV1` is that ad
 * with its media controls - the template this repo ships.
 */

export type ProductSpotlightProps = {
  /** Where the clip is going (story | feed | square | landscape | email): sets the canvas. */
  platform?: string;
  /** The small wordmark on every frame. Required. */
  brandName?: string;
  /** Zero or one logo (image or short video) in place of the wordmark. */
  brandLogo?: string[];
  /** The short line above the name. Empty removes it. */
  kicker?: string;
  /** The piece. Required. */
  productName?: string;
  /** The metal as written: "18K Yellow Gold". Empty removes it. */
  metalLabel?: string;
  /** The stone as written: "1.20 ct Round Diamond". Empty removes it. */
  stoneLabel?: string;
  /** The price, as a number. 0 removes the price beat. */
  price?: number;
  /** The currency symbol before the price. */
  currency?: string;
  /** The call to action. Empty removes it. */
  ctaLabel?: string;
  /** Where to go, under the call to action. Empty removes it. */
  ctaUrl?: string;
  /** Which bundled illustration stands in for the piece when there is no photo. */
  productArt?: string;
  /** The metal the bundled art is drawn in (gold | rose | white | platinum). */
  metal?: string;
  /** The stone the bundled art is drawn with. */
  stone?: string;
  /** Zero or one product shot - a photo or a clip (absolute path). */
  productImage?: string[];
  /** ivory | noir | velvet | blush - the page and text pair. */
  theme?: string;
  /** The brand colour (#rrggbb): the kicker, the price, the progress line. */
  accent?: string;
  /** The page (#rrggbb). Empty takes the theme's. */
  background?: string;
  /** The text (#rrggbb). Empty takes the theme's. */
  ink?: string;
  /** Clip length in whole seconds (4..30). */
  durationSec?: number;
  /** Dev-only: check the layout contract and draw it over the frame. */
  debugLayout?: boolean;
};

/** The shipped props: the ad's own, plus an area and a fit per media input. */
export type ProductSpotlightV1Props = ProductSpotlightProps & MediaControlProps;

const ID = "@jewelry/social/product-spotlight/v1";
export const SPOTLIGHT_MIN_SEC = 4;
export const SPOTLIGHT_MAX_SEC = 30;

const DEFAULTS = {
  platform: "story" as JewelPlatform,
  brandName: "Maison Lumen",
  kicker: "New in bridal",
  productName: "The Aurelia Solitaire",
  // The words match the starter photo an empty slot shows (a white-gold solitaire).
  metalLabel: "18K White Gold",
  stoneLabel: "Diamond solitaire, four prongs",
  price: 5600,
  currency: "$",
  ctaLabel: "Book a private viewing",
  ctaUrl: "maisonlumen.example/aurelia",
  productArt: "solitaire" as ArtKind,
  metal: "gold" as JewelMetal,
  stone: "diamond" as JewelStone,
  theme: "ivory" as JewelTheme,
  accent: JEWEL_DEFAULT_ACCENT,
  durationSec: 8,
};

const propsSchema = definePropsSchema<ProductSpotlightProps>({
  platform: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_PLATFORM_KEYS] } } },
  brandName: { type: "string", required: false },
  brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  kicker: { type: "string", required: false },
  productName: { type: "string", required: false },
  metalLabel: { type: "string", required: false },
  stoneLabel: { type: "string", required: false },
  price: { type: "number", required: false, meta: { constraints: { min: 0, max: 100_000_000 } } },
  currency: { type: "string", required: false },
  ctaLabel: { type: "string", required: false },
  ctaUrl: { type: "string", required: false },
  productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...ART_KINDS] } } },
  metal: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_METALS] } } },
  stone: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_STONES] } } },
  productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  theme: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_THEMES] } } },
  accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
  background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  durationSec: { type: "number", required: false, meta: { constraints: { min: SPOTLIGHT_MIN_SEC, max: SPOTLIGHT_MAX_SEC } } },
  debugLayout: { type: "boolean", required: false },
});

/** "18K Yellow Gold · 1.20 ct Round Brilliant" - whichever halves are present. */
export function specLine(metalLabel: string, stoneLabel: string): string {
  return [metalLabel, stoneLabel].filter(Boolean).join(" · ");
}

/**
 * The photo-led ad as such: the piece fills its side of the frame, the copy
 * sits beside or under it. Not a template of its own - `ProductSpotlightV1`
 * wraps it with the media controls - but the tests hold the controls to it:
 * given its words and a file in every slot, the two render the same frame.
 */
export const productSpotlightBase = defineMosaicTemplate<ProductSpotlightProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },
  outputHints: {
    ...JEWEL_PLATFORMS[DEFAULTS.platform],
    fps: 30,
    durationMs: DEFAULTS.durationSec * 1000,
    format: { kind: "video", container: "mp4" },
    note: "The canvas follows the platform knob (story by default; feed, square, landscape and email re-flow with the piece beside the copy); an explicit -w/-h wins. The clip is durationSec long.",
  },
  resolveOutputHints: (props) => ({
    ...platformDims(props?.platform, DEFAULTS.platform),
    durationMs: Math.round(numberOr(props?.durationSec, DEFAULTS.durationSec, SPOTLIGHT_MIN_SEC, SPOTLIGHT_MAX_SEC) * 1000),
  }),
  propsSchema,
  defaultProps: {
    platform: DEFAULTS.platform,
    brandName: DEFAULTS.brandName,
    brandLogo: [],
    kicker: DEFAULTS.kicker,
    productName: DEFAULTS.productName,
    metalLabel: DEFAULTS.metalLabel,
    stoneLabel: DEFAULTS.stoneLabel,
    price: DEFAULTS.price,
    currency: DEFAULTS.currency,
    ctaLabel: DEFAULTS.ctaLabel,
    ctaUrl: DEFAULTS.ctaUrl,
    productArt: DEFAULTS.productArt,
    metal: DEFAULTS.metal,
    stone: DEFAULTS.stone,
    productImage: [],
    theme: DEFAULTS.theme,
    accent: DEFAULTS.accent,
    durationSec: DEFAULTS.durationSec,
    debugLayout: false,
  },
  bindings: { unbound: { background: "canvas", ink: "theme", durationSec: "timing" } },
  render: renderPhotoLed,
});

/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export const PRODUCT_SPOTLIGHT_MEDIA: MediaSlot[] = [
  { key: "productImage", fit: "cover", starter: "ring-solitaire" },
  { key: "brandLogo", fit: "contain" },
];

const DEFAULT_PROPS = { ...productSpotlightBase.defaultProps, ...mediaControlsDefaults(PRODUCT_SPOTLIGHT_MEDIA) };

export const ProductSpotlightV1 = defineMosaicTemplate<ProductSpotlightV1Props>({
  id: asTemplateId(ID),
  capabilities: productSpotlightBase.capabilities,
  outputHints: productSpotlightBase.outputHints,
  resolveOutputHints: productSpotlightBase.resolveOutputHints,
  propsSchema: mediaControlsSchema(codeSchema(productSpotlightBase.propsSchema), PRODUCT_SPOTLIGHT_MEDIA),
  defaultProps: DEFAULT_PROPS,
  bindings: mediaControlsBindings(productSpotlightBase.bindings, PRODUCT_SPOTLIGHT_MEDIA),
  render: renderWithMediaControls<ProductSpotlightV1Props>(productSpotlightBase, ID, PRODUCT_SPOTLIGHT_MEDIA, { defaults: DEFAULT_PROPS }),
});

export default ProductSpotlightV1;

async function renderPhotoLed(props: ProductSpotlightProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
  const brandName = pickRequired(ID, props.brandName, DEFAULTS.brandName, "brandName", "it is from someone");
  const logoRef = pickMedia(ID, props.brandLogo, "brandLogo");
  const imageRef = pickMedia(ID, props.productImage, "productImage");
  const art = pickOneOf(ID, props.productArt, ART_KINDS, DEFAULTS.productArt, "productArt");
  const metal = pickOneOf(ID, props.metal, JEWEL_METALS, DEFAULTS.metal, "metal");
  const stone = pickOneOf(ID, props.stone, JEWEL_STONES, DEFAULTS.stone, "stone");
  pickOneOf(ID, props.platform, JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
  const P = palette(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
  const productName = pickRequired(ID, props.productName, DEFAULTS.productName, "productName", "the ad is about a piece");
  const price = pickNumber(ID, props.price, DEFAULTS.price, 0, 100_000_000, "price");
  const currency = pickText(ID, props.currency, DEFAULTS.currency, "currency");
  const blocks: LedBlock[] = [
    { label: "kicker", role: "kicker", text: pickText(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
    { label: "name", role: "title", text: productName, bind: [{ propKey: "productName" }] },
    { label: "spec", role: "body", text: specLine(pickText(ID, props.metalLabel, DEFAULTS.metalLabel, "metalLabel"), pickText(ID, props.stoneLabel, DEFAULTS.stoneLabel, "stoneLabel")), bind: [{ propKey: "metalLabel" }, { propKey: "stoneLabel" }] },
    { label: "price", role: "price", text: price > 0 ? formatPrice(price, currency) : "", bind: [{ propKey: "price" }, { propKey: "currency" }] },
    { label: "cta", role: "cta", text: pickText(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }] },
    { label: "cta-url", role: "url", text: pickText(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
  ];
  const label = `Product Spotlight - ${productName}`;
  const pinned = resolvePinnedDurationMs(ctx);
  const durationMs = pinned !== undefined ? Math.round(pinned) : pickInt(ID, props.durationSec, DEFAULTS.durationSec, SPOTLIGHT_MIN_SEC, SPOTLIGHT_MAX_SEC, "durationSec") * 1000;
  return photoLedDocument({
    id: ID,
    ctx,
    P,
    brandName,
    logoRef,
    heroRef: imageRef,
    heroKey: "productImage",
    heroFixed: "product-image",
    art: { svg: jewelArtSvg(art, artTone(metal, stone, P.ink, P.accent)), key: "product-art", name: `${art} (bundled art)` },
    blocks,
    durationMs,
    label,
    debug: props.debugLayout === true,
  });
}
