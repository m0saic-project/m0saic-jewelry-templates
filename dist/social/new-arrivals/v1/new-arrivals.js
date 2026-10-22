"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewArrivalsV1 = exports.NEW_ARRIVALS_MEDIA = exports.newArrivalsBase = exports.ARRIVALS_MAX_SEC = exports.ARRIVALS_MIN_SEC = void 0;
exports.arrivalTiles = arrivalTiles;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const jewel_1 = require("../../../_shared/jewel");
const jewel_art_1 = require("../../../_shared/jewel-art");
const vnext_1 = require("../../../_shared/vnext");
const photo_led_1 = require("../../../_shared/photo-led");
const media_controls_1 = require("../../../_shared/media-controls");
const ID = "@jewelry/social/new-arrivals/v1";
exports.ARRIVALS_MIN_SEC = 5;
exports.ARRIVALS_MAX_SEC = 30;
const DEFAULTS = {
    platform: "feed",
    brandName: "Maison Lumen",
    kicker: "Just in",
    count: 48,
    countLabel: "new pieces",
    whenLine: "Friday at 10, in store and online",
    // The names match the starter photos the empty slots show.
    item1Name: "Emerald Cluster Ring",
    item1Art: "solitaire",
    item2Name: "Diamond Cluster Drops",
    item2Art: "studs",
    item3Name: "Diamond Line Bracelet",
    item3Art: "tennis",
    item4Name: "Heart Drop Bar Necklace",
    item4Art: "pendant",
    ctaLabel: "First look for subscribers Thursday night",
    ctaUrl: "maisonlumen.example/new",
    metal: "gold",
    stone: "diamond",
    theme: "ivory",
    accent: jewel_1.JEWEL_DEFAULT_ACCENT,
    durationSec: 8,
};
const media = { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image"] } } };
const art = { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_art_1.ART_KINDS] } } };
const str = { type: "string", required: false };
const propsSchema = (0, template_utils_1.definePropsSchema)({
    platform: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_PLATFORM_KEYS] } } },
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
    metal: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_METALS] } } },
    stone: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_STONES] } } },
    theme: { type: "string", required: false, meta: { constraints: { oneOf: [...jewel_1.JEWEL_THEMES] } } },
    accent: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true, defaultColor: DEFAULTS.accent } } },
    background: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    ink: { type: "string", required: false, meta: { constraints: { isColor: true }, control: { colorPicker: true } } },
    durationSec: { type: "number", required: false, meta: { constraints: { min: exports.ARRIVALS_MIN_SEC, max: exports.ARRIVALS_MAX_SEC } } },
    debugLayout: { type: "boolean", required: false },
});
/**
 * The drop as such: the pieces as one mosaic on the photo side, the count and
 * the words on the other. Not a template of its own - `NewArrivalsV1` wraps it
 * with the media controls - but the tests hold the controls to it: given its
 * words and a file in every slot, the two render the same frame.
 */
exports.newArrivalsBase = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        ...jewel_1.JEWEL_PLATFORMS[DEFAULTS.platform],
        fps: 30,
        durationMs: DEFAULTS.durationSec * 1000,
        format: { kind: "video", container: "mp4" },
        note: "The canvas follows the platform knob (feed 4:5 by default; landscape and email put the count beside the pieces); an explicit -w/-h wins.",
    },
    resolveOutputHints: (props) => ({
        ...(0, jewel_1.platformDims)(props === null || props === void 0 ? void 0 : props.platform, DEFAULTS.platform),
        durationMs: Math.round((0, jewel_1.numberOr)(props === null || props === void 0 ? void 0 : props.durationSec, DEFAULTS.durationSec, exports.ARRIVALS_MIN_SEC, exports.ARRIVALS_MAX_SEC) * 1000),
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
exports.NEW_ARRIVALS_MEDIA = [
    { key: "item1Image", fit: "cover", starter: "ring-emerald" },
    { key: "item2Image", fit: "cover", starter: "earrings-drops" },
    { key: "item3Image", fit: "cover", starter: "bracelet-tennis" },
    { key: "item4Image", fit: "cover", starter: "necklace-bar" },
    { key: "brandLogo", fit: "contain" },
];
const DEFAULT_PROPS = { ...exports.newArrivalsBase.defaultProps, ...(0, media_controls_1.mediaControlsDefaults)(exports.NEW_ARRIVALS_MEDIA) };
exports.NewArrivalsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: exports.newArrivalsBase.capabilities,
    outputHints: exports.newArrivalsBase.outputHints,
    resolveOutputHints: exports.newArrivalsBase.resolveOutputHints,
    propsSchema: (0, media_controls_1.mediaControlsSchema)((0, vnext_1.codeSchema)(exports.newArrivalsBase.propsSchema), exports.NEW_ARRIVALS_MEDIA),
    defaultProps: DEFAULT_PROPS,
    bindings: (0, media_controls_1.mediaControlsBindings)(exports.newArrivalsBase.bindings, exports.NEW_ARRIVALS_MEDIA),
    render: (0, media_controls_1.renderWithMediaControls)(exports.newArrivalsBase, ID, exports.NEW_ARRIVALS_MEDIA, { defaults: DEFAULT_PROPS }),
});
exports.default = exports.NewArrivalsV1;
/**
 * The mosaic: n tiles cut from the photo side, `gap` apart. Two split the long side; three give the first piece the
 * larger part and stack the other two; four are a 2x2.
 */
function arrivalTiles(hero, n, gap) {
    const { x, y, w, h } = hero;
    const wide = w >= h;
    const half = (a) => Math.floor((a - gap) / 2);
    if (n <= 1)
        return [hero];
    if (n === 2)
        return wide ? [{ x, y, w: half(w), h }, { x: x + half(w) + gap, y, w: w - half(w) - gap, h }] : [{ x, y, w, h: half(h) }, { x, y: y + half(h) + gap, w, h: h - half(h) - gap }];
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
async function render(props, ctx) {
    const brandName = (0, jewel_1.pickRequired)(ID, props.brandName, DEFAULTS.brandName, "brandName", "the post is from someone");
    const countLabel = (0, jewel_1.pickRequired)(ID, props.countLabel, DEFAULTS.countLabel, "countLabel", "the count says what it counts");
    const count = Math.round((0, jewel_1.pickNumber)(ID, props.count, DEFAULTS.count, 1, 9999, "count"));
    const logoRef = (0, jewel_1.pickMedia)(ID, props.brandLogo, "brandLogo");
    const metal = (0, jewel_1.pickOneOf)(ID, props.metal, jewel_1.JEWEL_METALS, DEFAULTS.metal, "metal");
    const stone = (0, jewel_1.pickOneOf)(ID, props.stone, jewel_1.JEWEL_STONES, DEFAULTS.stone, "stone");
    (0, jewel_1.pickOneOf)(ID, props.platform, jewel_1.JEWEL_PLATFORM_KEYS, DEFAULTS.platform, "platform");
    const P = (0, jewel_1.palette)(ID, props, { theme: DEFAULTS.theme, accent: DEFAULTS.accent });
    const tone = (0, jewel_art_1.artTone)(metal, stone, P.ink, P.accent);
    const assets = {};
    const logo = (0, jewel_1.logoAsset)(ctx, logoRef, assets);
    const d = DEFAULTS;
    const p = props;
    // The pieces, in order; an empty name drops the tile.
    const items = [];
    for (const k of [1, 2, 3, 4]) {
        const name = (0, jewel_1.pickText)(ID, p[`item${k}Name`], d[`item${k}Name`], `item${k}Name`);
        if (!name)
            continue;
        const artKind = (0, jewel_1.pickOneOf)(ID, p[`item${k}Art`], jewel_art_1.ART_KINDS, d[`item${k}Art`], `item${k}Art`);
        const ref = (0, jewel_1.pickMedia)(ID, p[`item${k}Image`], `item${k}Image`);
        const hero = ref ? (0, photo_led_1.heroAsset)(ctx, ref, `item-${k}-image`, assets) : { kind: "art", id: (0, jewel_1.svgAsset)((0, jewel_art_1.jewelArtSvg)(artKind, tone), `item-${k}-art`, `${artKind} (bundled art)`, assets) };
        items.push({ k, name, hero, heroKey: `item${k}Image` });
    }
    if (items.length === 0)
        throw new Error(`${ID}: at least one item needs a name - a drop shows something.`);
    const blocks = [
        { label: "kicker", role: "kicker", text: (0, jewel_1.pickText)(ID, props.kicker, DEFAULTS.kicker, "kicker"), bind: [{ propKey: "kicker" }], beat: 0 },
        { label: "count", role: "numeral", text: String(count), bind: [{ propKey: "count" }], beat: 0, keep: true },
        { label: "count-label", role: "subtitle", text: countLabel, bind: [{ propKey: "countLabel" }], beat: 0 },
        { label: "when", role: "body", text: (0, jewel_1.pickText)(ID, props.whenLine, DEFAULTS.whenLine, "whenLine"), bind: [{ propKey: "whenLine" }] },
        { label: "names", role: "aside", text: items.map((i) => i.name).join(" · "), bind: items.map((i) => ({ propKey: `item${i.k}Name` })) },
        { label: "cta", role: "cta", text: (0, jewel_1.pickText)(ID, props.ctaLabel, DEFAULTS.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }, { propKey: "ctaUrl" }] },
        { label: "cta-url", role: "url", text: (0, jewel_1.pickText)(ID, props.ctaUrl, DEFAULTS.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
    ];
    const pinned = (0, template_utils_1.resolvePinnedDurationMs)(ctx);
    const durationMs = pinned !== undefined ? Math.round(pinned) : (0, jewel_1.pickInt)(ID, props.durationSec, DEFAULTS.durationSec, exports.ARRIVALS_MIN_SEC, exports.ARRIVALS_MAX_SEC, "durationSec") * 1000;
    const T = (0, jewel_1.shareBeats)(durationMs / 1000, [25, 75]);
    const m = (0, jewel_1.motion)(T);
    const W = Math.max(1, Math.round(ctx.target.width));
    const H = Math.max(1, Math.round(ctx.target.height));
    const L = (0, photo_led_1.layoutPhotoLed)(W, H, brandName, logoRef.length > 0, blocks);
    const clamp = (0, jewel_1.clampTo)(W, H);
    const { pieces, piece } = (0, jewel_1.pieceList)();
    (0, jewel_1.chromePieces)(piece, L.chrome, P, logo, T.total);
    // A tile is its piece: its photo and its name edit there (the names line is the first thing dropped for room).
    // The photo side is the page between the tiles (the hero the contract holds to its share), then each piece.
    piece(L.hero, 1, (0, jewel_1.tileSource)(P.bg, "hero"));
    const gap = Math.max(2, Math.round(0.008 * Math.min(W, H)));
    arrivalTiles(L.hero, items.length, gap).forEach((r, i) => {
        const it = items[i];
        const rect = clamp(r);
        const enter = m.arrive(0, i, undefined, "fade");
        if (it.hero.kind === "media") {
            const src = (0, photo_led_1.heroMediaSource)(it.hero, `item-${it.k}-photo`);
            piece(rect, 2, (0, template_utils_1.bindProps)({ ...src, overlay: enter }, [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
        }
        else {
            piece(rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.tileSource)(P.card, `item-${it.k}-photo`, { overlay: enter }), [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
            const side = Math.round(Math.min(rect.w, rect.h) * 0.66);
            const art = clamp({ x: rect.x + (rect.w - side) / 2, y: rect.y + (rect.h - side) / 2, w: side, h: side });
            const src = tileArt(it.hero.id, `item-${it.k}-art`);
            piece(art, 3, (0, template_utils_1.bindProps)({ ...src, overlay: enter }, [{ propKey: it.heroKey, index: 0 }, { propKey: `item${it.k}Name` }]));
        }
    });
    (0, photo_led_1.blockPieces)(piece, L.placed, P, T, L.align);
    return (0, jewel_1.finishDocument)(ID, ctx, W, H, pieces, assets, P.bg, durationMs, `New Arrivals - ${count} ${countLabel}`, (0, photo_led_1.photoLedContract)(L), props.debugLayout === true);
}
/** Bundled art on its panel, contained (the art fallback when an item has no photo). */
function tileArt(id, label) {
    return (0, template_utils_1.tag)({ type: "media", mediaType: "image", assetId: id, placement: { fit: "contain", vAlign: "middle" }, editor: { owner: "template" } }, label);
}
