import { type Block, type Rect } from "../../../_shared/jewel";
import { type MediaControlProps, type MediaSlot } from "../../../_shared/media-controls";
/**
 * `@jewelry/social/piece-reel/v1` - the brand's own clips cut into a Reel, the words never over the piece.
 *
 * ONE CONCEPT: **the footage is the ad.** A maker already films the pieces on the bench and in the hand; two to
 * five of those clips, each with the piece's name and one line of detail, then a closing card with where to buy or
 * where to find you at a show, is a Reel. Jewelers care that nothing covers the piece, so each clip gets a rect of
 * its own and the words sit on the page beside it: a band on top (the wordmark on every step, the hook on the
 * first), the clip, a band under it (the piece's name and detail), the show strip; on a wide canvas the clip on
 * the left and the words on the right. The bands keep their height on every step, so the clip holds still through
 * the crossfades. The closing card is data, not a mode: fill the shows for a booth, clear them and write the line
 * for a shop.
 *
 * Every media input edits in place (`_shared/media-controls.ts`): an area drawn on the preview moves and resizes it
 * (the crop is the area); the clips share one fit, `clipFit`. An empty slot shows a real clip or photo from the
 * starter pack, never clip art; the bundled flat art only stands in when nothing else can.
 *
 * Two layers in one module: `pieceReelBase` is the reel as such (the tests hold the controls to it),
 * `PieceReelV1` is that reel with its media controls - the template this repo ships.
 */
export type PieceReelProps = {
    platform?: string;
    brandName?: string;
    brandLogo?: string[];
    /** Under the wordmark on the closing card. Empty removes it. */
    tagline?: string;
    /** Over the first clip, the reel's opening line. Empty removes it. */
    hook?: string;
    /** Seconds each clip holds the frame, 2..8. The closing card holds a little longer. */
    secondsPerClip?: number;
    clip1?: string[];
    clip1Label?: string;
    clip1Detail?: string;
    clip1Art?: string;
    clip2?: string[];
    clip2Label?: string;
    clip2Detail?: string;
    clip2Art?: string;
    clip3?: string[];
    clip3Label?: string;
    clip3Detail?: string;
    clip3Art?: string;
    clip4?: string[];
    clip4Label?: string;
    clip4Detail?: string;
    clip4Art?: string;
    clip5?: string[];
    clip5Label?: string;
    clip5Detail?: string;
    clip5Art?: string;
    /** The line on the closing card: where to buy. Empty removes it. */
    ctaLine?: string;
    show1Name?: string;
    show1Dates?: string;
    show1Place?: string;
    show1Booth?: string;
    show2Name?: string;
    show2Dates?: string;
    show2Place?: string;
    show2Booth?: string;
    /** Run the first show as a band under every clip. */
    boothStrip?: boolean;
    /** cover crops a clip to fill the frame; contain shows all of it on the page (a square spin on a story canvas). */
    clipFit?: string;
    metal?: string;
    stone?: string;
    theme?: string;
    accent?: string;
    background?: string;
    ink?: string;
    debugLayout?: boolean;
};
/** The shipped props: the reel's own, plus an area per media input (the clips share `clipFit`; the logo has its own fit). */
export type PieceReelV1Props = PieceReelProps & MediaControlProps;
type ClipCopy = {
    brandName: string;
    /** Drawn on this step (the first): the reel's hook. */
    hook: string;
    /** The reel's hook, for sizing: its band is kept on every step so the clip never moves at a crossfade. */
    hookSize: string;
    label: string;
    detail: string;
    /** Whether any step has a detail line: the band keeps its room on every step. */
    anyDetail: boolean;
    strip: string;
};
type ClipLayout = {
    W: number;
    H: number;
    /** The clip's own rect - nothing is ever drawn over it. */
    media: Rect;
    wordmark: Block;
    hook: Block | null;
    /** Where the bundled art goes when the slot has no clip: a card and the art inset in it. */
    artCard: Rect;
    art: Rect;
    label: Block | null;
    detail: Block | null;
    stripBand: Rect | null;
    strip: Block | null;
    bar: Rect;
};
/**
 * A clip step: the clip gets a rect of its own and the words sit BESIDE it, on the page - never over the piece.
 * Tall and square canvases: a band on top (the wordmark, then the hook on the first step), the clip, a band
 * under it (the piece's name and detail), then the booth strip. Wide canvases: the clip on the left, the words
 * on the right. Every band is the same height on every step, so the clip holds still through the crossfades.
 */
declare function layoutClipStep(copy: ClipCopy, W: number, H: number): ClipLayout;
/**
 * The reel as such: one step per clip, then the closing card. Not a template of its own - `PieceReelV1` wraps it
 * with the media controls - but the tests hold the controls to it: given its words and a file in every slot, the
 * two render the same reel.
 */
export declare const pieceReelBase: import("@m0saic/types").MosaicTemplate<PieceReelProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
/**
 * The media inputs, each with its Fit's default and the starter it shows while empty; `with` names what moves with
 * a slot; a row drawn only once it has words takes its starter only then.
 */
export declare const PIECE_REEL_MEDIA: MediaSlot[];
export declare const PieceReelV1: import("@m0saic/types").MosaicTemplate<PieceReelV1Props, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PieceReelV1;
/** The step layout, for tests (named for the reel: the pack index re-exports every module's names). */
export { layoutClipStep as layoutReelStep };
