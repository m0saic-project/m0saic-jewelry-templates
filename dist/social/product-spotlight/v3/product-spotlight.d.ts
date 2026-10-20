import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
import { type ProductSpotlightV2Props } from "../v2/product-spotlight";
/**
 * `@jewelry/social/product-spotlight/v3` - Product Spotlight, with every media input edited in place.
 *
 * The founder, 2026-10-19: every media input takes a photo or a clip, and an area to move and resize it to - the crop
 * is the area - with cover / contain; and no clip art: an empty slot shows a photo from the starter pack. This wraps
 * the frozen v2 whole (props, canvas, layout, render) and adds those (`_shared/media-controls.ts`); given v2's
 * words and a file in every slot, it renders exactly as v2.
 */
export type ProductSpotlightV3Props = ProductSpotlightV2Props & MediaControlProps;
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export declare const PRODUCT_SPOTLIGHT_V3_MEDIA: MediaSlot[];
export declare const ProductSpotlightV3: import("@m0saic/types").MosaicTemplate<ProductSpotlightV3Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ProductSpotlightV3;
