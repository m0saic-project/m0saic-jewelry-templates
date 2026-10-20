import type { MosaicEngineContext, MosaicSource, MosaicTemplate, MosaicTemplatePropDefinition } from "@m0saic/types";
import { resolveRegionsToPx } from "@m0saic/template-utils";
import type { LayoutConstraint } from "@m0saic/template-utils";
import type { FileAsset } from "@m0saic/template-utils/dist/m0saic/assetPath";
/**
 * MEDIA CONTROLS: every media input edits in place. The founder, 2026-10-19: "all media inputs should generally
 * accept image or video / and they ALL need a move prop binding such that user can resize and crop it / like a
 * setting for cover / contain / and then able to resize rect." So each media slot X of a version built on this
 * module takes
 *   - X: a photo OR a clip (a clip loops, muted);
 *   - `${X}Region`: one rect drawn on the preview (a regions picker, max 1). Set, the slot is drawn THERE instead
 *     of its place in the layout - resizing the rect is how the user crops. Empty keeps the layout's own rect;
 *   - `${X}Fit`: cover (fill the rect, crop the spill) or contain (all of it, the page around it): cover for a
 *     photo (the founder's default), contain where a crop would cut what matters (a logo, a finished render).
 * The rect that shows the slot carries all three handles: the drop target, the move glyph, the fit pick.
 *
 * And no clip art (founder, the same day): an EMPTY slot shows a photo or clip from the starter pack
 * (starter.ts) - the prop stays empty, the rect is still its drop target and the controls move it like the real
 * thing; decorative bundled art that is no media input is swapped for a pack photo, or left out where none fits.
 *
 * A version built here WRAPS the frozen one before it whole - its props, defaults, canvas, layout and render. The
 * render passes the controls down on the ctx (a private key); the kit's `finishDocument` and `imageAsset`
 * (jewel.ts) act on them only for the wrapped template's own id, so every other render - every shipped version,
 * and a template a mockup nests - is untouched. What a control acts on is found by its binding: the rects bound
 * to X ARE the slot (the media, or its stand-in: the wordmark for a logo), plus the pieces a version names as
 * part of it (`with`: the card behind the art, the ring around an avatar) - those move with it, in proportion.
 * Given the wrapped version's words and a file in every slot, it renders exactly as that version.
 */
export type MediaFit = "cover" | "contain";
export declare const MEDIA_FITS: readonly ["cover", "contain"];
export type MediaSlot = {
    /** The media prop. */
    key: string;
    /** The Fit prop's default. */
    fit: MediaFit;
    /** The starter-pack item (starter.ts) the slot shows while it is empty. */
    starter?: string;
    /** A prop that must be filled for the starter to show (a slot that is only drawn once its row has words). */
    starterWhen?: string;
    /** A prop that, filled, asks for something else in the empty slot (the template a frame nests): no starter then. */
    starterUnless?: string;
    /** Labels of pieces that are part of the slot without being bound to it; they move with it. */
    with?: string[];
    /**
     * Labels of pieces that ARE the slot's extent when they are drawn (the disc an avatar's initial sits on): the area
     * maps them onto the rect drawn, and what is bound inside them keeps its place in them.
     */
    frame?: string[];
    /**
     * A prop the wrapped version already has for this slot's fit (a template whose clips share one `fit` prop): the slot
     * gets no Fit prop of its own, that prop is bound on it as the pick, and the placement is left to the version.
     */
    fitProp?: string;
};
export declare const regionKey: (key: string) => string;
export declare const fitKey: (key: string) => string;
/** The props a controlled version adds; the wrapped version's props type carries the rest. */
export type MediaControlProps = {
    [key: `${string}Region`]: unknown;
} & {
    [key: `${string}Fit`]: unknown;
};
/** The wrapped schema with each slot taking a photo or a clip, and its Region and Fit right after it. */
export declare function mediaControlsSchema(schema: Record<string, MosaicTemplatePropDefinition>, slots: MediaSlot[]): Record<string, MosaicTemplatePropDefinition>;
/**
 * Decorative bundled art that is no media input, by its piece's label: shown as a starter-pack photo or clip in
 * the same rect (cover-cropped), or - with no `starter`, where nothing in the pack fits - left out.
 */
export type MediaDecor = {
    label: string;
    starter?: string;
};
/** Each Fit's default. A Region has none (empty = the layout's rect). */
export declare function mediaControlsDefaults(slots: MediaSlot[]): Record<string, MediaFit>;
/** The wrapped version's roll call, with a slot that is not drawn at its defaults declaring its Region the same way. */
export declare function mediaControlsBindings<B extends {
    unbound?: Record<string, string>;
} | undefined>(bindings: B, slots: MediaSlot[]): B;
type Regions = {
    canvas?: {
        w: number;
        h: number;
    };
    regions: Parameters<typeof resolveRegionsToPx>[0]["regions"];
    m0?: string;
};
type ControlledSlot = {
    key: string;
    fit: MediaFit | null;
    fitProp: string | null;
    region: Regions | null;
    with: string[];
    frame: string[];
};
type ControlledDecor = {
    label: string;
    key: string | null;
    asset: FileAsset | null;
};
export type MediaControls = {
    id: string;
    forId: string;
    slots: ControlledSlot[];
    decor: ControlledDecor[];
};
/** The controls a render carries for template `id` (the wrapped one), or null - every render but a controlled one. */
export declare function mediaControlsFor(ctx: MosaicEngineContext | undefined, id: string): MediaControls | null;
/**
 * The render of a version that wraps `prev` with media controls: read the controls (a bad one is refused by name),
 * lay this version's `defaults` under the props (its own words, where they differ from `prev`'s), fill each empty
 * slot with its starter, then render `prev` carrying the controls. Its errors name this version.
 */
export declare function renderWithMediaControls<P extends Record<string, any>>(prev: MosaicTemplate<any>, id: string, slots: MediaSlot[], opts?: {
    defaults?: Record<string, unknown>;
    decor?: MediaDecor[];
}): (given: P, ctx: MosaicEngineContext) => Promise<import("@m0saic/types").MosaicRenderableFile>;
type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
type Piece = {
    rect: Rect & {
        importance?: number;
    };
    source: MosaicSource;
};
type Assets = Record<string, {
    kind?: string;
    mediaType?: string;
} | undefined>;
/**
 * Apply a render's controls to its pieces, before they are placed: each slot's media takes its fit (a clip plays),
 * every rect of the slot carries its handles, and a drawn Region moves the slot - the rects bound to it map onto
 * the region, the pieces named with it keep their place around it. A moved piece is no longer held to the layout's
 * promises for it, so its constraints go.
 */
export declare function applyMediaControls(c: MediaControls, W: number, H: number, pieces: Piece[], assets: Assets, constraints: LayoutConstraint[]): {
    id: string;
    pieces: Piece[];
    constraints: LayoutConstraint[];
};
export {};
