"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSpotlightV2 = void 0;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const jewel_1 = require("../../../_shared/jewel");
const jewel_art_1 = require("../../../_shared/jewel-art");
const vnext_1 = require("../../../_shared/vnext");
const photo_led_1 = require("../../../_shared/photo-led");
const product_spotlight_1 = require("../v1/product-spotlight");
const ID = "@jewelry/social/product-spotlight/v2";
const D = product_spotlight_1.ProductSpotlightV1.defaultProps;
exports.ProductSpotlightV2 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: product_spotlight_1.ProductSpotlightV1.capabilities,
    outputHints: product_spotlight_1.ProductSpotlightV1.outputHints,
    resolveOutputHints: product_spotlight_1.ProductSpotlightV1.resolveOutputHints,
    propsSchema: {
        ...(0, vnext_1.codeSchema)(product_spotlight_1.ProductSpotlightV1.propsSchema),
        productImage: { type: "media[]", required: false, meta: { control: { multiple: false, picker: "file", accept: ["image", "video"] } } },
    },
    defaultProps: product_spotlight_1.ProductSpotlightV1.defaultProps,
    bindings: product_spotlight_1.ProductSpotlightV1.bindings,
    render,
});
exports.default = exports.ProductSpotlightV2;
async function render(props, ctx) {
    const brandName = (0, jewel_1.pickRequired)(ID, props.brandName, D.brandName, "brandName", "it is from someone");
    const logoRef = (0, jewel_1.pickMedia)(ID, props.brandLogo, "brandLogo");
    const imageRef = (0, jewel_1.pickMedia)(ID, props.productImage, "productImage");
    const art = (0, jewel_1.pickOneOf)(ID, props.productArt, jewel_art_1.ART_KINDS, D.productArt, "productArt");
    const metal = (0, jewel_1.pickOneOf)(ID, props.metal, jewel_1.JEWEL_METALS, D.metal, "metal");
    const stone = (0, jewel_1.pickOneOf)(ID, props.stone, jewel_1.JEWEL_STONES, D.stone, "stone");
    (0, jewel_1.pickOneOf)(ID, props.platform, jewel_1.JEWEL_PLATFORM_KEYS, D.platform, "platform");
    const P = (0, jewel_1.palette)(ID, props, { theme: D.theme, accent: D.accent });
    const productName = (0, jewel_1.pickRequired)(ID, props.productName, D.productName, "productName", "the ad is about a piece");
    const price = (0, jewel_1.pickNumber)(ID, props.price, D.price, 0, 100000000, "price");
    const currency = (0, jewel_1.pickText)(ID, props.currency, D.currency, "currency");
    const blocks = [
        { label: "kicker", role: "kicker", text: (0, jewel_1.pickText)(ID, props.kicker, D.kicker, "kicker"), bind: [{ propKey: "kicker" }] },
        { label: "name", role: "title", text: productName, bind: [{ propKey: "productName" }] },
        { label: "spec", role: "body", text: (0, product_spotlight_1.specLine)((0, jewel_1.pickText)(ID, props.metalLabel, D.metalLabel, "metalLabel"), (0, jewel_1.pickText)(ID, props.stoneLabel, D.stoneLabel, "stoneLabel")), bind: [{ propKey: "metalLabel" }, { propKey: "stoneLabel" }] },
        { label: "price", role: "price", text: price > 0 ? (0, jewel_1.formatPrice)(price, currency) : "", bind: [{ propKey: "price" }, { propKey: "currency" }] },
        { label: "cta", role: "cta", text: (0, jewel_1.pickText)(ID, props.ctaLabel, D.ctaLabel, "ctaLabel"), bind: [{ propKey: "ctaLabel" }] },
        { label: "cta-url", role: "url", text: (0, jewel_1.pickText)(ID, props.ctaUrl, D.ctaUrl, "ctaUrl"), bind: [{ propKey: "ctaUrl" }] },
    ];
    const label = `Product Spotlight - ${productName}`;
    const pinned = (0, template_utils_1.resolvePinnedDurationMs)(ctx);
    const durationMs = pinned !== undefined ? Math.round(pinned) : (0, jewel_1.pickInt)(ID, props.durationSec, D.durationSec, product_spotlight_1.SPOTLIGHT_MIN_SEC, product_spotlight_1.SPOTLIGHT_MAX_SEC, "durationSec") * 1000;
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
