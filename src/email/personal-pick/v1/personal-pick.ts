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
  chromePieces,
  finishDocument,
  logoAsset,
  numberOr,
  palette,
  pickInt,
  pickMedia,
  pickOneOf,
  pickRequired,
  pickText,
  pieceList,
  platformDims,
  shareBeats,
  svgAsset,
  type JewelMetal,
  type JewelPlatform,
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
 * `@jewelry/email/personal-pick/v1` - the newsletter hero addressed to ONE
 * client: her name, the occasion the store knows about, the piece chosen for
 * her, and the private offer.
 *
 * ONE CONCEPT: **the clienteling record is the ad.** A jeweler's client book
 * already holds the name, the anniversary, the ring size, what she bought and
 * what she wished for. Those fields ARE this template's props: the Monday send
 * fills them per client and every hero renders inside the same look, so "Hi
 * Susie, your anniversary is three weeks away" costs nothing more than the row.
 *
 * The piece - a photo or a clip - takes its side of the frame
 * (`_shared/photo-led.ts`): hello and the occasion first, with the photo; then
 * the piece, why it is hers, the offer, the code and where to go. Every media
 * input edits in place (`_shared/media-controls.ts`): an area drawn on the
 * preview moves and resizes it (the crop is the area), and its fit picks cover
 * or contain. An empty slot shows a real piece from the starter pack, never
 * clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `personalPickBase` is the hero as such (the tests
 * hold the controls to it), `PersonalPickV1` is that hero with its media
 * controls - the template this repo ships.
 */

export type PersonalPickProps = {
  /** Where it is going (email | story | feed | square | landscape): sets the canvas. */
  platform?: string;
  /** The small wordmark on every frame. Required. */
  brandName?: string;
  /** Zero or one logo (image or short video) in place of the wordmark. */
  brandLogo?: string[];
  /** Who it is for. Required. */
  customerName?: string;
  /** The word before the name. Empty leaves the name alone. */
  greeting?: string;
  /** Why she is hearing from you: the occasion. Empty removes it. */
  occasion?: string;
  /** The short line above the piece. Empty removes it. */
  kicker?: string;
  /** The piece chosen for her. Required. */
  productName?: string;
  /** One line on why this piece, for her. Empty removes it. */
  reason?: string;
  /** The private offer. Empty removes it. */
  offer?: string;
  /** Her code, shown as "Code …". Empty removes it. */
  promoCode?: string;
  /** Until when. Empty removes it. */
  expiry?: string;
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
  /** Zero or one photo or clip of the piece (absolute path). */
  productImage?: string[];
  /** ivory | noir | velvet | blush - the page and text pair. */
  theme?: string;
  /** The brand colour (#rrggbb): the kicker, the offer, the progress line. */
  accent?: string;
  /** The page (#rrggbb). Empty takes the theme's. */
  background?: string;
  /** The text (#rrggbb). Empty takes the theme's. */
  ink?: string;
  /** Clip length in whole seconds (6..30). */
  durationSec?: number;
  /** Dev-only: check the layout contract and draw it over the frame. */
  debugLayout?: boolean;
};

/** The shipped props: the hero's own, plus an area and a fit per media input. */
export type PersonalPickV1Props = PersonalPickProps & MediaControlProps;

const ID = "@jewelry/email/personal-pick/v1";
export const PICK_MIN_SEC = 6;
export const PICK_MAX_SEC = 30;

const DEFAULTS = {
  platform: "email" as JewelPlatform,
  brandName: "Maison Lumen",
  customerName: "Susie",
  greeting: "Hi",
  occasion: "Your anniversary is three weeks away.",
  kicker: "Chosen for you",
  // The words match the starter photo an empty slot shows (an emerald halo pendant).
  productName: "Emerald Halo Pendant",
  reason: "Emerald and diamond, to go with the earrings you chose last year.",
  offer: "15% off, just for you",
  promoCode: "SUSIE-PICK",
  expiry: "Until the 30th, in store and online",
  ctaLabel: "Reserve it for a private viewing",
  ctaUrl: "maisonlumen.example/susie",
  productArt: "pendant" as ArtKind,
  metal: "white" as JewelMetal,
  stone: "emerald" as JewelStone,
  theme: "ivory" as JewelTheme,
  accent: JEWEL_DEFAULT_ACCENT,
  durationSec: 10,
};

const str = { type: "string" as const, required: false };
const propsSchema = definePropsSchema<PersonalPickProps>({
  platform: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_PLATFORM_KEYS] } } },
  brandName: str,
  brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  customerName: str,
  greeting: str,
  occasion: str,
  kicker: str,
  productName: str,
  reason: str,
  offer: str,
  promoCode: str,
  expiry: str,
  ctaLabel: str,
  ctaUrl: str,
  productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...ART_KINDS] } } },
  metal: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_METALS] } } },
  stone: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_STONES] } } },
  productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
  theme: { type: "string", required: false, meta: { constraints: { oneOf: [...JEWEL_THEMES] } } },
  accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
  background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
  durationSec: { type: "number", required: false, meta: { constraints: { min: PICK_MIN_SEC, max: PICK_MAX_SEC } } },
  debugLayout: { type: "boolean", required: false },
});

/**
 * The hero as such: the piece on its side of the frame, the words beside or
 * under it. Not a template of its own - `PersonalPickV1` wraps it with the
 * media controls - but the tests hold the controls to it: given its words and
 * a file in every slot, the two render the same frame.
 */
export const personalPickBase = defineMosaicTemplate<PersonalPickProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },
  outputHints: {
    ...JEWEL_PLATFORMS[DEFAULTS.platform],
    fps: 30,
    durationMs: DEFAULTS.durationSec * 1000,
    format: { kind: "video", container: "mp4" },
    note: "The canvas follows the platform knob (email 1200x600 by default - the hero of a newsletter; story, feed, square and landscape re-flow); an explicit -w/-h wins.",
  },
  resolveOutputHints: (props) => ({
    ...platformDims(props?.platform, DEFAULTS.platform),
    durationMs: Math.round(numberOr(props?.durationSec, DEFAULTS.durationSec, PICK_MIN_SEC, PICK_MAX_SEC) * 1000),
  }),
  propsSchema,
  defaultProps: {
    platform: DEFAULTS.platform,
    brandName: DEFAULTS.brandName,
    brandLogo: [],
    customerName: DEFAULTS.customerName,
    greeting: DEFAULTS.greeting,
    occasion: DEFAULTS.occasion,
    kicker: DEFAULTS.kicker,
    productName: DEFAULTS.productName,
    reason: DEFAULTS.reason,
    offer: DEFAULTS.offer,
    promoCode: DEFAULTS.promoCode,
    expiry: DEFAULTS.expiry,
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
  render,
});

/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export const PERSONAL_PICK_MEDIA: MediaSlot[] = [
  { key: "productImage", fit: "cover", starter: "pendant-emerald" },
  { key: "brandLogo", fit: "contain" },
];

const DEFAULT_PROPS = { ...personalPickBase.defaultProps, ...mediaControlsDefaults(PERSONAL_PICK_MEDIA) };

export const PersonalPickV1 = defineMosaicTemplate<PersonalPickV1Props>({
  id: asTemplateId(ID),
  capabilities: personalPickBase.capabilities,
  outputHints: personalPickBase.outputHints,
  resolveOutputHints: personalPickBase.resolveOutputHints,
  propsSchema: mediaControlsSchema(codeSchema(personalPickBase.propsSchema), PERSONAL_PICK_MEDIA),
  defaultProps: DEFAULT_PROPS,
  bindings: mediaControlsBindings(personalPickBase.bindings, PERSONAL_PICK_MEDIA),
  render: renderWithMediaControls<PersonalPickV1Props>(personalPickBase, ID, PERSONAL_PICK_MEDIA, { defaults: DEFAULT_PROPS }),
});

export default PersonalPickV1;

async function render(props: PersonalPickProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
  const brandName = pickRequired(ID, props.brandName, DEFAULTS.brandName, "brandName", "the hero is from someone");
  const customerName = pickRequired(ID, props.customerName, DEFAULTS.customerName, "customerName", "the hero is addressed to someone");
  const productName = pickRequired(ID, props.productName, DEFAULTS.productName, "productName", "the hero is about a piece");
  const logoRef = pickMedia(ID, props.brandLogo, "brandLogo");
  const imageRef = pickMedia(ID, props.productImage, "productImage");
  const greeting = pickText(ID, props.greeting, DEFAULTS.greeting, "greeting");
  const code = pickText(ID, props.promoCode, DEFAULTS.promoCode, "promoCode");
  const art = pickOneOf(ID, props.productArt, ART_KINDS, DEFAULTS.productArt, "productArt");
  const metal = pickOneOf(ID, props.metal, JEWEL_METALS, DEFAULTS.metal, "metal");
  const stone = pickOneOf(ID, props.stone, JEWEL_STONES, DEFAULTS.stone, "stone");
  pickOneOf(ID, props.platform, JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
  const P = palette(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });

  const assets: NonNullable<MosaicDocument["assets"]> = {};
  const logo = logoAsset(ctx, logoRef, assets);
  const hero = imageRef
    ? heroAsset(ctx, imageRef, "product-image", assets)
    : { kind: "art" as const, id: svgAsset(jewelArtSvg(art, artTone(metal, stone, P.ink, P.accent)), "product-art", `${art} (bundled art)`, assets) };

  const blocks: LedBlock[] = [
    { label: "hello", role: "subtitle", text: greeting ? `${greeting} ${customerName},` : `${customerName},`, bind: [{ propKey: "greeting" }, { propKey: "customerName" }], beat: 0 },
    { label: "sub", role: "body", text: pickText(ID, props.occasion, DEFAULTS.occasion, "occasion"), bind: [{ propKey: "occasion" }], beat: 0 },
    { label: "kicker", role: "kicker", text: pickText(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
    { label: "title", role: "title", text: productName, bind: [{ propKey: "productName" }] },
    { label: "body", role: "body", text: pickText(ID, props.reason, DEFAULTS.reason, "reason"), bind: [{ propKey: "reason" }] },
    { label: "offer", role: "price", text: pickText(ID, props.offer, DEFAULTS.offer, "offer"), bind: [{ propKey: "offer" }] },
    { label: "code", role: "kicker", text: code ? `Code ${code}` : "", bind: [{ propKey: "promoCode" }] },
    { label: "expiry", role: "note", text: pickText(ID, props.expiry, DEFAULTS.expiry, "expiry"), bind: [{ propKey: "expiry" }] },
    { label: "cta", role: "cta", text: pickText(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }] },
    { label: "cta-url", role: "url", text: pickText(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
  ];

  const pinned = resolvePinnedDurationMs(ctx);
  const durationMs = pinned !== undefined ? Math.round(pinned) : pickInt(ID, props.durationSec, DEFAULTS.durationSec, PICK_MIN_SEC, PICK_MAX_SEC, "durationSec") * 1000;
  const T = shareBeats(durationMs / 1000, [30, 70]);

  const W = Math.max(1, Math.round(ctx.target.width));
  const H = Math.max(1, Math.round(ctx.target.height));
  const L = layoutPhotoLed(W, H, brandName, logoRef.length > 0, blocks);
  const { pieces, piece } = pieceList();
  chromePieces(piece, L.chrome, P, logo, T.total);
  heroPieces(piece, L.hero, L.art, hero, P, "hero", "productImage");
  blockPieces(piece, L.placed, P, T, L.align);

  return finishDocument(ID, ctx, W, H, pieces, assets, P.bg, durationMs, `Personal Pick - ${customerName}`, photoLedContract(L), props.debugLayout === true);
}
