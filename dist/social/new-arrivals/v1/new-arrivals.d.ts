import { type Rect } from "../../../_shared/jewel";
import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
/**
 * `@jewelry/social/new-arrivals/v1` - the drop: "48 new pieces, Friday at 10",
 * four of them shown.
 *
 * ONE CONCEPT: **the count is the hook, the pieces are the proof.** A store that
 * restocks every week announces it the same way every time; the receiving log
 * already has the count and the photos. So the weekly post is a weekly render.
 *
 * The drop itself is the hero (`_shared/photo-led.ts`): the pieces' photos as
 * one mosaic that fills the photo side edge to edge - two side by side, three
 * as one large and two small, four as a 2x2 - arriving one by one; the count,
 * the day and the pieces' names on the other side. Every media input edits in
 * place (`_shared/media-controls.ts`): an area drawn on the preview moves and
 * resizes it (the crop is the area), and its fit picks cover or contain. An
 * empty slot shows a real piece from the starter pack, never clip art; the
 * bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `newArrivalsBase` is the drop as such (the tests
 * hold the controls to it), `NewArrivalsV1` is that drop with its media
 * controls - the template this repo ships.
 */
export type NewArrivalsProps = {
    /** Where the clip is going (feed | story | square | landscape | email): sets the canvas. */
    platform?: string;
    /** The small wordmark on every frame. Required. */
    brandName?: string;
    /** Zero or one logo (image or short video) in place of the wordmark. */
    brandLogo?: string[];
    /** Above the number: "Just in". Empty removes it. */
    kicker?: string;
    /** How many pieces, 1..9999. */
    count?: number;
    /** The words after the count: "new pieces". Required. */
    countLabel?: string;
    /** When: "Friday at 10". Empty removes it. */
    whenLine?: string;
    /** Each item: its name (empty drops the tile), its bundled art, its photo. */
    item1Name?: string;
    item1Art?: string;
    item1Image?: string[];
    item2Name?: string;
    item2Art?: string;
    item2Image?: string[];
    item3Name?: string;
    item3Art?: string;
    item3Image?: string[];
    item4Name?: string;
    item4Art?: string;
    item4Image?: string[];
    /** The last line. Empty removes it. */
    ctaLabel?: string;
    /** Where to go, under the call to action. Empty removes it. */
    ctaUrl?: string;
    /** The metal every bundled illustration is drawn in. */
    metal?: string;
    /** The stone every bundled illustration is drawn with. */
    stone?: string;
    /** ivory | noir | velvet | blush - the page and text pair. */
    theme?: string;
    /** The brand colour (#rrggbb): the count, the kicker, the progress line. */
    accent?: string;
    /** The page (#rrggbb). Empty takes the theme's. */
    background?: string;
    /** The text (#rrggbb). Empty takes the theme's. */
    ink?: string;
    /** Clip length in whole seconds (5..30). */
    durationSec?: number;
    /** Dev-only: check the layout contract and draw it over the frame. */
    debugLayout?: boolean;
};
/** The shipped props: the drop's own, plus an area and a fit per media input. */
export type NewArrivalsV1Props = NewArrivalsProps & MediaControlProps;
export declare const ARRIVALS_MIN_SEC = 5;
export declare const ARRIVALS_MAX_SEC = 30;
/**
 * The drop as such: the pieces as one mosaic on the photo side, the count and
 * the words on the other. Not a template of its own - `NewArrivalsV1` wraps it
 * with the media controls - but the tests hold the controls to it: given its
 * words and a file in every slot, the two render the same frame.
 */
export declare const newArrivalsBase: import("@m0saic/types").MosaicTemplate<NewArrivalsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export declare const NEW_ARRIVALS_MEDIA: MediaSlot[];
export declare const NewArrivalsV1: import("@m0saic/types").MosaicTemplate<NewArrivalsV1Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NewArrivalsV1;
/**
 * The mosaic: n tiles cut from the photo side, `gap` apart. Two split the long side; three give the first piece the
 * larger part and stack the other two; four are a 2x2.
 */
export declare function arrivalTiles(hero: Rect, n: number, gap: number): Rect[];
