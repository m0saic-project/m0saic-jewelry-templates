import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
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
export declare const SPOTLIGHT_MIN_SEC = 4;
export declare const SPOTLIGHT_MAX_SEC = 30;
/** "18K Yellow Gold · 1.20 ct Round Brilliant" - whichever halves are present. */
export declare function specLine(metalLabel: string, stoneLabel: string): string;
/**
 * The photo-led ad as such: the piece fills its side of the frame, the copy
 * sits beside or under it. Not a template of its own - `ProductSpotlightV1`
 * wraps it with the media controls - but the tests hold the controls to it:
 * given its words and a file in every slot, the two render the same frame.
 */
export declare const productSpotlightBase: import("@m0saic/types").MosaicTemplate<ProductSpotlightProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export declare const PRODUCT_SPOTLIGHT_MEDIA: MediaSlot[];
export declare const ProductSpotlightV1: import("@m0saic/types").MosaicTemplate<ProductSpotlightV1Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ProductSpotlightV1;
