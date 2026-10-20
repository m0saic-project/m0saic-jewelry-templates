import { mediaControlsSuite } from "../../../__testutils__/media-controls";
import { photoLedSuite } from "../../../__testutils__/photo-led";
import { PRODUCT_SPOTLIGHT_MEDIA, ProductSpotlightV1, productSpotlightBase } from "./product-spotlight";

// The photo-led ad as such (the base the controls wrap)...
photoLedSuite(productSpotlightBase, "@jewelry/social/product-spotlight/v1", ["productImage"]);
// ...and the shipped template: every media input with its area and its fit, held to the base.
mediaControlsSuite(ProductSpotlightV1, productSpotlightBase, PRODUCT_SPOTLIGHT_MEDIA);
