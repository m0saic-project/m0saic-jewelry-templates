"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowCardV1 = exports.WINDOW_CARD_MEDIA = exports.windowCardBase = exports.CARD_DIMS = exports.CARD_SIZES = void 0;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const jewel_1 = require("../../../_shared/jewel");
const jewel_art_1 = require("../../../_shared/jewel-art");
const vnext_1 = require("../../../_shared/vnext");
const photo_led_1 = require("../../../_shared/photo-led");
const media_controls_1 = require("../../../_shared/media-controls");
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
exports.CARD_SIZES = ["a7", "a6", "4x6"];
/**
 * Portrait, about 300 dpi: A7 74x105 mm, A6 105x148 mm, 4x6 in. The engine wants
 * 5-smooth canvas sides (only 2, 3 and 5 as factors), so the A sizes are rounded
 * to the nearest smooth pair at the same ratio (A7 874x1240 → 900x1280, A6
 * 1240x1748 → 1280x1800); 4x6 at 300 dpi is already smooth.
 */
exports.CARD_DIMS = {
    a7: { width: 900, height: 1280 },
    a6: { width: 1280, height: 1800 },
    "4x6": { width: 1200, height: 1800 },
};
const ID = "@jewelry/print/window-card/v1";
const DEFAULTS = {
    cardSize: "a7",
    brandName: "Maison Lumen",
    kicker: "In the window this week",
    productName: "The Aurelia Solitaire",
    // The words match the starter photo an empty slot shows (a white-gold solitaire).
    specLine: "18K white gold, four-prong diamond solitaire",
    price: 5600,
    currency: "$",
    stampLine: "Ask to try it on",
    productArt: "solitaire",
    metal: "gold",
    stone: "diamond",
    theme: "ivory",
    accent: jewel_1.JEWEL_DEFAULT_ACCENT,
};
const str = { type: "string", required: false };
const propsSchema = (0, template_utils_1.definePropsSchema)({
    cardSize: { type: "string", required: false, meta: { constraints: { oneOf: [...exports.CARD_SIZES] } } },
    brandName: str,
    brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
    kicker: str,
    productName: str,
    specLine: str,
    price: { type: "number", required: false, meta: { constraints: { min: 1, max: 100000000 } } },
    currency: str,
    stampLine: str,
    productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_art_1.ART_KINDS] } } },
    metal: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_METALS] } } },
    stone: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_STONES] } } },
    productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image"] } } },
    theme: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_THEMES] } } },
    accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
    background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    debugLayout: { type: "boolean", required: false },
});
const cardDims = (size) => exports.CARD_DIMS[exports.CARD_SIZES.includes(String(size)) ? size : DEFAULTS.cardSize];
/**
 * The card as such: the photo on top, the words centred under it. Not a
 * template of its own - `WindowCardV1` wraps it with the media controls - but
 * the tests hold the controls to it: given its words and a file in every slot,
 * the two render the same frame.
 */
exports.windowCardBase = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        ...exports.CARD_DIMS[DEFAULTS.cardSize],
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "A still at a print card size, portrait, 300 dpi: A7 by default, A6 or 4x6 from the card-size knob; an explicit -w/-h wins.",
    },
    resolveOutputHints: (props) => ({ ...cardDims(props === null || props === void 0 ? void 0 : props.cardSize) }),
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
exports.WINDOW_CARD_MEDIA = [
    { key: "productImage", fit: "cover", starter: "ring-solitaire" },
    { key: "brandLogo", fit: "contain" },
];
const DEFAULT_PROPS = { ...exports.windowCardBase.defaultProps, ...(0, media_controls_1.mediaControlsDefaults)(exports.WINDOW_CARD_MEDIA) };
exports.WindowCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: exports.windowCardBase.capabilities,
    outputHints: exports.windowCardBase.outputHints,
    resolveOutputHints: exports.windowCardBase.resolveOutputHints,
    propsSchema: (0, media_controls_1.mediaControlsSchema)((0, vnext_1.codeSchema)(exports.windowCardBase.propsSchema), exports.WINDOW_CARD_MEDIA),
    defaultProps: DEFAULT_PROPS,
    bindings: (0, media_controls_1.mediaControlsBindings)(exports.windowCardBase.bindings, exports.WINDOW_CARD_MEDIA),
    render: (0, media_controls_1.renderWithMediaControls)(exports.windowCardBase, ID, exports.WINDOW_CARD_MEDIA, { defaults: DEFAULT_PROPS }),
});
exports.default = exports.WindowCardV1;
async function render(props, ctx) {
    var _a;
    const brandName = (0, jewel_1.pickRequired)(ID, props.brandName, DEFAULTS.brandName, "brandName", "the card is a store's");
    const productName = (0, jewel_1.pickRequired)(ID, props.productName, DEFAULTS.productName, "productName", "the card names a piece");
    const price = (0, jewel_1.pickNumber)(ID, props.price, DEFAULTS.price, 1, 100000000, "price");
    const currency = (0, jewel_1.pickText)(ID, props.currency, DEFAULTS.currency, "currency");
    const logoRef = (0, jewel_1.pickMedia)(ID, props.brandLogo, "brandLogo");
    const imageRef = (0, jewel_1.pickMedia)(ID, props.productImage, "productImage");
    (0, jewel_1.pickOneOf)(ID, props.cardSize, exports.CARD_SIZES, DEFAULTS.cardSize, "cardSize");
    const art = (0, jewel_1.pickOneOf)(ID, props.productArt, jewel_art_1.ART_KINDS, DEFAULTS.productArt, "productArt");
    const metal = (0, jewel_1.pickOneOf)(ID, props.metal, jewel_1.JEWEL_METALS, DEFAULTS.metal, "metal");
    const stone = (0, jewel_1.pickOneOf)(ID, props.stone, jewel_1.JEWEL_STONES, DEFAULTS.stone, "stone");
    const P = (0, jewel_1.palette)(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
    const assets = {};
    const logo = (0, jewel_1.logoAsset)(ctx, logoRef, assets);
    const hero = imageRef
        ? (0, photo_led_1.heroAsset)(ctx, imageRef, "product-image", assets)
        : { kind: "art", id: (0, jewel_1.svgAsset)((0, jewel_art_1.jewelArtSvg)(art, (0, jewel_art_1.artTone)(metal, stone, P.ink, P.accent)), "product-art", `${art} (bundled art)`, assets) };
    const blocks = [
        { label: "kicker", role: "kicker", text: (0, jewel_1.pickText)(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
        { label: "name", role: "title", text: productName, bind: [{ propKey: "productName" }] },
        { label: "spec", role: "body", text: (0, jewel_1.pickText)(ID, props.specLine, DEFAULTS.specLine, "specLine"), bind: [{ propKey: "specLine" }] },
        { label: "price", role: "price", text: (0, jewel_1.formatPrice)(price, currency), bind: [{ propKey: "price" }, { propKey: "currency" }] },
        { label: "stamp", role: "aside", text: (0, jewel_1.pickText)(ID, props.stampLine, DEFAULTS.stampLine, "stampLine"), bind: [{ propKey: "stampLine" }] },
    ];
    const W = Math.max(1, Math.round(ctx.target.width));
    const H = Math.max(1, Math.round(ctx.target.height));
    const L = (0, photo_led_1.layoutPhotoLed)(W, H, brandName, logoRef.length > 0, blocks, { bar: false, align: "center" });
    const { pieces, piece } = (0, jewel_1.pieceList)();
    (0, jewel_1.chromePieces)(piece, L.chrome, P, logo, 0, undefined, false);
    (0, photo_led_1.heroPieces)(piece, L.hero, L.art, hero, P, "hero", "productImage");
    (0, photo_led_1.blockPieces)(piece, L.placed, P, null, L.align);
    // The card's edge in the accent, over the photo's bleed too - the gilt line a case card has.
    const t = Math.max(2, Math.round(0.01 * Math.min(W, H)));
    for (const r of [{ x: 0, y: 0, w: W, h: t }, { x: 0, y: H - t, w: W, h: t }, { x: 0, y: t, w: t, h: H - 2 * t }, { x: W - t, y: t, w: t, h: H - 2 * t }]) {
        piece(r, 3, (0, template_utils_1.bindProp)((0, jewel_1.tileSource)(P.accent, "frame"), "accent"));
    }
    return (0, jewel_1.finishDocument)(ID, ctx, W, H, pieces, assets, P.bg, Math.max(1, Math.round((_a = ctx.target.durationMs) !== null && _a !== void 0 ? _a : 2000)), `Window Card - ${productName}`, (0, photo_led_1.photoLedContract)(L), props.debugLayout === true);
}
