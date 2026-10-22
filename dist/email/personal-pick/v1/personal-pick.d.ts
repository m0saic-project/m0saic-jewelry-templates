import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
/**
 * `@jewelry/email/personal-pick/v1` - the newsletter hero addressed to ONE
 * client: her name, the occasion the store knows about, the piece chosen for
 * her, and the private offer.
 *
 * ONE CONCEPT: **the clienteling record is the ad.** A jeweler's client book
 * already holds the name, the anniversary, the ring size, what she bought and
 * what she wished for. Those fields ARE this template's props: the Monday send
 * fills them per client and every hero renders inside the same look, so "Hi
 * Susie, your anniversary is three weeks away" costs nothing more than the row.
 *
 * The piece - a photo or a clip - takes its side of the frame
 * (`_shared/photo-led.ts`): hello and the occasion first, with the photo; then
 * the piece, why it is hers, the offer, the code and where to go. Every media
 * input edits in place (`_shared/media-controls.ts`): an area drawn on the
 * preview moves and resizes it (the crop is the area), and its fit picks cover
 * or contain. An empty slot shows a real piece from the starter pack, never
 * clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `personalPickBase` is the hero as such (the tests
 * hold the controls to it), `PersonalPickV1` is that hero with its media
 * controls - the template this repo ships.
 */
export type PersonalPickProps = {
    /** Where it is going (email | story | feed | square | landscape): sets the canvas. */
    platform?: string;
    /** The small wordmark on every frame. Required. */
    brandName?: string;
    /** Zero or one logo (image or short video) in place of the wordmark. */
    brandLogo?: string[];
    /** Who it is for. Required. */
    customerName?: string;
    /** The word before the name. Empty leaves the name alone. */
    greeting?: string;
    /** Why she is hearing from you: the occasion. Empty removes it. */
    occasion?: string;
    /** The short line above the piece. Empty removes it. */
    kicker?: string;
    /** The piece chosen for her. Required. */
    productName?: string;
    /** One line on why this piece, for her. Empty removes it. */
    reason?: string;
    /** The private offer. Empty removes it. */
    offer?: string;
    /** Her code, shown as "Code …". Empty removes it. */
    promoCode?: string;
    /** Until when. Empty removes it. */
    expiry?: string;
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
    /** Zero or one photo or clip of the piece (absolute path). */
    productImage?: string[];
    /** ivory | noir | velvet | blush - the page and text pair. */
    theme?: string;
    /** The brand colour (#rrggbb): the kicker, the offer, the progress line. */
    accent?: string;
    /** The page (#rrggbb). Empty takes the theme's. */
    background?: string;
    /** The text (#rrggbb). Empty takes the theme's. */
    ink?: string;
    /** Clip length in whole seconds (6..30). */
    durationSec?: number;
    /** Dev-only: check the layout contract and draw it over the frame. */
    debugLayout?: boolean;
};
/** The shipped props: the hero's own, plus an area and a fit per media input. */
export type PersonalPickV1Props = PersonalPickProps & MediaControlProps;
export declare const PICK_MIN_SEC = 6;
export declare const PICK_MAX_SEC = 30;
/**
 * The hero as such: the piece on its side of the frame, the words beside or
 * under it. Not a template of its own - `PersonalPickV1` wraps it with the
 * media controls - but the tests hold the controls to it: given its words and
 * a file in every slot, the two render the same frame.
 */
export declare const personalPickBase: import("@m0saic/types").MosaicTemplate<PersonalPickProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
/** The media inputs, each with its Fit's default and the starter it shows while empty. */
export declare const PERSONAL_PICK_MEDIA: MediaSlot[];
export declare const PersonalPickV1: import("@m0saic/types").MosaicTemplate<PersonalPickV1Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PersonalPickV1;
