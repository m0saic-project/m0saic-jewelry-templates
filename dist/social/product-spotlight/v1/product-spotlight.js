"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSpotlightV1 = exports.PRODUCT_SPOTLIGHT_MEDIA = exports.productSpotlightBase = exports.SPOTLIGHT_MAX_SEC = exports.SPOTLIGHT_MIN_SEC = void 0;
exports.specLine = specLine;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const jewel_1 = require("../../../_shared/jewel");
const jewel_art_1 = require("../../../_shared/jewel-art");
const vnext_1 = require("../../../_shared/vnext");
const photo_led_1 = require("../../../_shared/photo-led");
const media_controls_1 = require("../../../_shared/media-controls");
const ID = "@jewelry/social/product-spotlight/v1";
exports.SPOTLIGHT_MIN_SEC = 4;
exports.SPOTLIGHT_MAX_SEC = 30;
const DEFAULTS = {
    platform: "story",
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
    productArt: "solitaire",
    metal: "gold",
    stone: "diamond",
    theme: "ivory",
    accent: jewel_1.JEWEL_DEFAULT_ACCENT,
    durationSec: 8,
};
const propsSchema = (0, template_utils_1.definePropsSchema)({
    platform: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_PLATFORM_KEYS] } } },
    brandName: { type: "string", required: false },
    brandLogo: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
    kicker: { type: "string", required: false },
    productName: { type: "string", required: false },
    metalLabel: { type: "string", required: false },
    stoneLabel: { type: "string", required: false },
    price: { type: "number", required: false, meta: { constraints: { min: 0, max: 100000000 } } },
    currency: { type: "string", required: false },
    ctaLabel: { type: "string", required: false },
    ctaUrl: { type: "string", required: false },
    productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_art_1.ART_KINDS] } } },
    metal: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_METALS] } } },
    stone: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_STONES] } } },
    productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
    theme: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_THEMES] } } },
    accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
    background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    durationSec: { type: "number", required: false, meta: { constraints: { min: exports.SPOTLIGHT_MIN_SEC, max: exports.SPOTLIGHT_MAX_SEC } } },
    debugLayout: { type: "boolean", required: false },
});
/** "18K Yellow Gold · 1.20 ct Round Brilliant" - whichever halves are present. */
function specLine(metalLabel, stoneLabel) {
    return [metalLabel, stoneLabel].filter(Boolean).join(" · ");
}
/**
 * The photo-led ad as such: the piece fills its side of the frame, the copy
 * sits beside or under it. Not a template of its own - `ProductSpotlightV1`
 * wraps it with the media controls - but the tests hold the controls to it:
 * given its words and a file in every slot, the two render the same frame.
 */
exports.productSpotlightBase = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        ...jewel_1.JEWEL_PLATFORMS[DEFAULTS.platform],
        fps: 30,
        durationMs: DEFAULTS.durationSec * 1000,
        format: { kind: "video", container: "mp4" },
        note: "The canvas follows the platform knob (story by default; feed, square, landscape and email re-flow with the piece beside the copy); an explicit -w/-h wins. The clip is durationSec long.",
    },
    resolveOutputHints: (props) => ({
        ...(0, jewel_1.platformDims)(props === null || props === void 0 ? void 0 : props.platform, DEFAULTS.platform),
        durationMs: Math.round((0, jewel_1.numberOr)(props === null || props === void 0 ? void 0 : props.durationSec, DEFAULTS.durationSec, exports.SPOTLIGHT_MIN_SEC, exports.SPOTLIGHT_MAX_SEC) * 1000),
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
exports.PRODUCT_SPOTLIGHT_MEDIA = [
    { key: "productImage", fit: "cover", starter: "ring-solitaire" },
    { key: "brandLogo", fit: "contain" },
];
const DEFAULT_PROPS = { ...exports.productSpotlightBase.defaultProps, ...(0, media_controls_1.mediaControlsDefaults)(exports.PRODUCT_SPOTLIGHT_MEDIA) };
exports.ProductSpotlightV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: exports.productSpotlightBase.capabilities,
    outputHints: exports.productSpotlightBase.outputHints,
    resolveOutputHints: exports.productSpotlightBase.resolveOutputHints,
    propsSchema: (0, media_controls_1.mediaControlsSchema)((0, vnext_1.codeSchema)(exports.productSpotlightBase.propsSchema), exports.PRODUCT_SPOTLIGHT_MEDIA),
    defaultProps: DEFAULT_PROPS,
    bindings: (0, media_controls_1.mediaControlsBindings)(exports.productSpotlightBase.bindings, exports.PRODUCT_SPOTLIGHT_MEDIA),
    render: (0, media_controls_1.renderWithMediaControls)(exports.productSpotlightBase, ID, exports.PRODUCT_SPOTLIGHT_MEDIA, { defaults: DEFAULT_PROPS }),
});
exports.default = exports.ProductSpotlightV1;
async function renderPhotoLed(props, ctx) {
    const brandName = (0, jewel_1.pickRequired)(ID, props.brandName, DEFAULTS.brandName, "brandName", "it is from someone");
    const logoRef = (0, jewel_1.pickMedia)(ID, props.brandLogo, "brandLogo");
    const imageRef = (0, jewel_1.pickMedia)(ID, props.productImage, "productImage");
    const art = (0, jewel_1.pickOneOf)(ID, props.productArt, jewel_art_1.ART_KINDS, DEFAULTS.productArt, "productArt");
    const metal = (0, jewel_1.pickOneOf)(ID, props.metal, jewel_1.JEWEL_METALS, DEFAULTS.metal, "metal");
    const stone = (0, jewel_1.pickOneOf)(ID, props.stone, jewel_1.JEWEL_STONES, DEFAULTS.stone, "stone");
    (0, jewel_1.pickOneOf)(ID, props.platform, jewel_1.JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
    const P = (0, jewel_1.palette)(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
    const productName = (0, jewel_1.pickRequired)(ID, props.productName, DEFAULTS.productName, "productName", "the ad is about a piece");
    const price = (0, jewel_1.pickNumber)(ID, props.price, DEFAULTS.price, 0, 100000000, "price");
    const currency = (0, jewel_1.pickText)(ID, props.currency, DEFAULTS.currency, "currency");
    const blocks = [
        { label: "kicker", role: "kicker", text: (0, jewel_1.pickText)(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
        { label: "name", role: "title", text: productName, bind: [{ propKey: "productName" }] },
        { label: "spec", role: "body", text: specLine((0, jewel_1.pickText)(ID, props.metalLabel, DEFAULTS.metalLabel, "metalLabel"), (0, jewel_1.pickText)(ID, props.stoneLabel, DEFAULTS.stoneLabel, "stoneLabel")), bind: [{ propKey: "metalLabel" }, { propKey: "stoneLabel" }] },
        { label: "price", role: "price", text: price > 0 ? (0, jewel_1.formatPrice)(price, currency) : "", bind: [{ propKey: "price" }, { propKey: "currency" }] },
        { label: "cta", role: "cta", text: (0, jewel_1.pickText)(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }] },
        { label: "cta-url", role: "url", text: (0, jewel_1.pickText)(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
    ];
    const label = `Product Spotlight - ${productName}`;
    const pinned = (0, template_utils_1.resolvePinnedDurationMs)(ctx);
    const durationMs = pinned !== undefined ? Math.round(pinned) : (0, jewel_1.pickInt)(ID, props.durationSec, DEFAULTS.durationSec, exports.SPOTLIGHT_MIN_SEC, exports.SPOTLIGHT_MAX_SEC, "durationSec") * 1000;
    return (0, photo_led_1.photoLedDocument)({
        id: ID,
        ctx,
        P,
        brandName,
        logoRef,
        heroRef: imageRef,
        heroKey: "productImage",
        heroFixed: "product-image",
        art: { svg: (0, jewel_art_1.jewelArtSvg)(art, (0, jewel_art_1.artTone)(metal, stone, P.ink, P.accent)), key: "product-art", name: `${art} (bundled art)` },
        blocks,
        durationMs,
        label,
        debug: props.debugLayout === true,
    });
}
