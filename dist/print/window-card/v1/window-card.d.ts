import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
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
export declare const CARD_SIZES: readonly ["a7", "a6", "4x6"];
export type CardSize = (typeof CARD_SIZES)[number];
/**
 * Portrait, about 300 dpi: A7 74x105 mm, A6 105x148 mm, 4x6 in. The engine wants
 * 5-smooth canvas sides (only 2, 3 and 5 as factors), so the A sizes are rounded
 * to the nearest smooth pair at the same ratio (A7 874x1240 → 900x1280, A6
 * 1240x1748 → 1280x1800); 4x6 at 300 dpi is already smooth.
 */
export declare const CARD_DIMS: Record<CardSize, {
    width: number;
    height: number;
}>;
export type WindowCardProps = {
    /** a7 | a6 | 4x6 - the print size; sets the canvas. */
    cardSize?: string;
    /** The small wordmark at the top of the card. Required. */
    brandName?: string;
    /** Zero or one logo in place of the wordmark. */
    brandLogo?: string[];
    /** The collection, small, in the accent. Empty removes it. */
    kicker?: string;
    /** The piece. Required. */
    productName?: string;
    /** Metal, stone, size - one or two lines. Empty removes it. */
    specLine?: string;
    /** The price. Required, above 0. */
    price?: number;
    /** The currency symbol before the price. */
    currency?: string;
    /** Under the price: "Ask to try it on". Empty removes it. */
    stampLine?: string;
    /** Which bundled illustration stands in for the piece when there is no photo. */
    productArt?: string;
    /** The metal the bundled art is drawn in (gold | rose | white | platinum). */
    metal?: string;
    /** The stone the bundled art is drawn with. */
    stone?: string;
    /** Zero or one photo of the piece (absolute path). */
    productImage?: string[];
    /** ivory | noir | velvet | blush - the paper and text pair. */
    theme?: string;
    /** The brand colour (#rrggbb): the edge line, the kicker, the price. */
    accent?: string;
    /** The paper (#rrggbb). Empty takes the theme's. */
    background?: string;
    /** The text (#rrggbb). Empty takes the theme's. */
    ink?: string;
    /** Dev-only: check the layout contract and draw it over the frame. */
    debugLayout?: boolean;
};
/** The shipped props: the card's own, plus an area and a fit per media input. */
export type WindowCardV1Props = WindowCardProps & MediaControlProps;
/**
 * The card as such: the photo on top, the words centred under it. Not a
 * template of its own - `WindowCardV1` wraps it with the media controls - but
 * the tests hold the controls to it: given its words and a file in every slot,
 * the two render the same frame.
 */
export declare const windowCardBase: import("@m0saic/types").MosaicTemplate<WindowCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export declare const WINDOW_CARD_MEDIA: MediaSlot[];
export declare const WindowCardV1: import("@m0saic/types").MosaicTemplate<WindowCardV1Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default WindowCardV1;
