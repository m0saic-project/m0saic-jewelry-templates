"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSpotlightV3 = exports.PRODUCT_SPOTLIGHT_V3_MEDIA = void 0;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const vnext_1 = require("../../../_shared/vnext");
const media_controls_1 = require("../../../_shared/media-controls");
const product_spotlight_1 = require("../v2/product-spotlight");
const ID = "@jewelry/social/product-spotlight/v3";
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
exports.PRODUCT_SPOTLIGHT_V3_MEDIA = [
    { key: "productImage", fit: "cover", starter: "ring-solitaire" },
    { key: "brandLogo", fit: "contain" },
];
/** This version's own words where v2's describe a piece its starter photo is not (copy matches the picture). */
const COPY = {
    metalLabel: "18K White Gold",
    stoneLabel: "Diamond solitaire, four prongs",
    price: 5600,
};
const DEFAULTS = { ...product_spotlight_1.ProductSpotlightV2.defaultProps, ...(0, media_controls_1.mediaControlsDefaults)(exports.PRODUCT_SPOTLIGHT_V3_MEDIA), ...COPY };
exports.ProductSpotlightV3 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: product_spotlight_1.ProductSpotlightV2.capabilities,
    outputHints: product_spotlight_1.ProductSpotlightV2.outputHints,
    resolveOutputHints: product_spotlight_1.ProductSpotlightV2.resolveOutputHints,
    propsSchema: (0, media_controls_1.mediaControlsSchema)((0, vnext_1.codeSchema)(product_spotlight_1.ProductSpotlightV2.propsSchema), exports.PRODUCT_SPOTLIGHT_V3_MEDIA),
    defaultProps: DEFAULTS,
    bindings: (0, media_controls_1.mediaControlsBindings)(product_spotlight_1.ProductSpotlightV2.bindings, exports.PRODUCT_SPOTLIGHT_V3_MEDIA),
    render: (0, media_controls_1.renderWithMediaControls)(product_spotlight_1.ProductSpotlightV2, ID, exports.PRODUCT_SPOTLIGHT_V3_MEDIA, { defaults: DEFAULTS }),
});
exports.default = exports.ProductSpotlightV3;
