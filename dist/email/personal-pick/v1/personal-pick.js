"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalPickV1 = exports.PERSONAL_PICK_MEDIA = exports.personalPickBase = exports.PICK_MAX_SEC = exports.PICK_MIN_SEC = void 0;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const jewel_1 = require("../../../_shared/jewel");
const jewel_art_1 = require("../../../_shared/jewel-art");
const vnext_1 = require("../../../_shared/vnext");
const photo_led_1 = require("../../../_shared/photo-led");
const media_controls_1 = require("../../../_shared/media-controls");
const ID = "@jewelry/email/personal-pick/v1";
exports.PICK_MIN_SEC = 6;
exports.PICK_MAX_SEC = 30;
const DEFAULTS = {
    platform: "email",
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
    productArt: "pendant",
    metal: "white",
    stone: "emerald",
    theme: "ivory",
    accent: jewel_1.JEWEL_DEFAULT_ACCENT,
    durationSec: 10,
};
const str = { type: "string", required: false };
const propsSchema = (0, template_utils_1.definePropsSchema)({
    platform: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_PLATFORM_KEYS] } } },
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
    productArt: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_art_1.ART_KINDS] } } },
    metal: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_METALS] } } },
    stone: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_STONES] } } },
    productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
    theme: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_THEMES] } } },
    accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
    background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    durationSec: { type: "number", required: false, meta: { constraints: { min: exports.PICK_MIN_SEC, max: exports.PICK_MAX_SEC } } },
    debugLayout: { type: "boolean", required: false },
});
/**
 * The hero as such: the piece on its side of the frame, the words beside or
 * under it. Not a template of its own - `PersonalPickV1` wraps it with the
 * media controls - but the tests hold the controls to it: given its words and
 * a file in every slot, the two render the same frame.
 */
exports.personalPickBase = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        ...jewel_1.JEWEL_PLATFORMS[DEFAULTS.platform],
        fps: 30,
        durationMs: DEFAULTS.durationSec * 1000,
        format: { kind: "video", container: "mp4" },
        note: "The canvas follows the platform knob (email 1200x600 by default - the hero of a newsletter; story, feed, square and landscape re-flow); an explicit -w/-h wins.",
    },
    resolveOutputHints: (props) => ({
        ...(0, jewel_1.platformDims)(props === null || props === void 0 ? void 0 : props.platform, DEFAULTS.platform),
        durationMs: Math.round((0, jewel_1.numberOr)(props === null || props === void 0 ? void 0 : props.durationSec, DEFAULTS.durationSec, exports.PICK_MIN_SEC, exports.PICK_MAX_SEC) * 1000),
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
exports.PERSONAL_PICK_MEDIA = [
    { key: "productImage", fit: "cover", starter: "pendant-emerald" },
    { key: "brandLogo", fit: "contain" },
];
const DEFAULT_PROPS = { ...exports.personalPickBase.defaultProps, ...(0, media_controls_1.mediaControlsDefaults)(exports.PERSONAL_PICK_MEDIA) };
exports.PersonalPickV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: exports.personalPickBase.capabilities,
    outputHints: exports.personalPickBase.outputHints,
    resolveOutputHints: exports.personalPickBase.resolveOutputHints,
    propsSchema: (0, media_controls_1.mediaControlsSchema)((0, vnext_1.codeSchema)(exports.personalPickBase.propsSchema), exports.PERSONAL_PICK_MEDIA),
    defaultProps: DEFAULT_PROPS,
    bindings: (0, media_controls_1.mediaControlsBindings)(exports.personalPickBase.bindings, exports.PERSONAL_PICK_MEDIA),
    render: (0, media_controls_1.renderWithMediaControls)(exports.personalPickBase, ID, exports.PERSONAL_PICK_MEDIA, { defaults: DEFAULT_PROPS }),
});
exports.default = exports.PersonalPickV1;
async function render(props, ctx) {
    const brandName = (0, jewel_1.pickRequired)(ID, props.brandName, DEFAULTS.brandName, "brandName", "the hero is from someone");
    const customerName = (0, jewel_1.pickRequired)(ID, props.customerName, DEFAULTS.customerName, "customerName", "the hero is addressed to someone");
    const productName = (0, jewel_1.pickRequired)(ID, props.productName, DEFAULTS.productName, "productName", "the hero is about a piece");
    const logoRef = (0, jewel_1.pickMedia)(ID, props.brandLogo, "brandLogo");
    const imageRef = (0, jewel_1.pickMedia)(ID, props.productImage, "productImage");
    const greeting = (0, jewel_1.pickText)(ID, props.greeting, DEFAULTS.greeting, "greeting");
    const code = (0, jewel_1.pickText)(ID, props.promoCode, DEFAULTS.promoCode, "promoCode");
    const art = (0, jewel_1.pickOneOf)(ID, props.productArt, jewel_art_1.ART_KINDS, DEFAULTS.productArt, "productArt");
    const metal = (0, jewel_1.pickOneOf)(ID, props.metal, jewel_1.JEWEL_METALS, DEFAULTS.metal, "metal");
    const stone = (0, jewel_1.pickOneOf)(ID, props.stone, jewel_1.JEWEL_STONES, DEFAULTS.stone, "stone");
    (0, jewel_1.pickOneOf)(ID, props.platform, jewel_1.JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
    const P = (0, jewel_1.palette)(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
    const assets = {};
    const logo = (0, jewel_1.logoAsset)(ctx, logoRef, assets);
    const hero = imageRef
        ? (0, photo_led_1.heroAsset)(ctx, imageRef, "product-image", assets)
        : { kind: "art", id: (0, jewel_1.svgAsset)((0, jewel_art_1.jewelArtSvg)(art, (0, jewel_art_1.artTone)(metal, stone, P.ink, P.accent)), "product-art", `${art} (bundled art)`, assets) };
    const blocks = [
        { label: "hello", role: "subtitle", text: greeting ? `${greeting} ${customerName},` : `${customerName},`, bind: [{ propKey: "greeting" }, { propKey: "customerName" }], beat: 0 },
        { label: "sub", role: "body", text: (0, jewel_1.pickText)(ID, props.occasion, DEFAULTS.occasion, "occasion"), bind: [{ propKey: "occasion" }], beat: 0 },
        { label: "kicker", role: "kicker", text: (0, jewel_1.pickText)(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
        { label: "title", role: "title", text: productName, bind: [{ propKey: "productName" }] },
        { label: "body", role: "body", text: (0, jewel_1.pickText)(ID, props.reason, DEFAULTS.reason, "reason"), bind: [{ propKey: "reason" }] },
        { label: "offer", role: "price", text: (0, jewel_1.pickText)(ID, props.offer, DEFAULTS.offer, "offer"), bind: [{ propKey: "offer" }] },
        { label: "code", role: "kicker", text: code ? `Code ${code}` : "", bind: [{ propKey: "promoCode" }] },
        { label: "expiry", role: "note", text: (0, jewel_1.pickText)(ID, props.expiry, DEFAULTS.expiry, "expiry"), bind: [{ propKey: "expiry" }] },
        { label: "cta", role: "cta", text: (0, jewel_1.pickText)(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }] },
        { label: "cta-url", role: "url", text: (0, jewel_1.pickText)(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
    ];
    const pinned = (0, template_utils_1.resolvePinnedDurationMs)(ctx);
    const durationMs = pinned !== undefined ? Math.round(pinned) : (0, jewel_1.pickInt)(ID, props.durationSec, DEFAULTS.durationSec, exports.PICK_MIN_SEC, exports.PICK_MAX_SEC, "durationSec") * 1000;
    const T = (0, jewel_1.shareBeats)(durationMs / 1000, [30, 70]);
    const W = Math.max(1, Math.round(ctx.target.width));
    const H = Math.max(1, Math.round(ctx.target.height));
    const L = (0, photo_led_1.layoutPhotoLed)(W, H, brandName, logoRef.length > 0, blocks);
    const { pieces, piece } = (0, jewel_1.pieceList)();
    (0, jewel_1.chromePieces)(piece, L.chrome, P, logo, T.total);
    (0, photo_led_1.heroPieces)(piece, L.hero, L.art, hero, P, "hero", "productImage");
    (0, photo_led_1.blockPieces)(piece, L.placed, P, T, L.align);
    return (0, jewel_1.finishDocument)(ID, ctx, W, H, pieces, assets, P.bg, durationMs, `Personal Pick - ${customerName}`, (0, photo_led_1.photoLedContract)(L), props.debugLayout === true);
}
