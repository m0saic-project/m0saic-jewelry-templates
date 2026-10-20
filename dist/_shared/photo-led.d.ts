import type { MosaicDocument, MosaicEngineContext, MosaicSource } from "@m0saic/types";
import type { LayoutConstraint } from "@m0saic/template-utils";
import { type TextFit } from "./text";
import { fileAssetId, type Beats, type Chrome, type Palette, type Rect } from "./jewel";
/**
 * PHOTO-LED: the house style once a real photo is in.
 *
 * From the founder's first ratings of the live reference field (2026-10-16): every template that shrank a
 * real photo into the box its bundled art was drawn for scored 1 ("they're the hero, so they don't look
 * good here"), the clip-art ring box around a real photo scored 1 ("tacky... our audience is polished,
 * professional"), and the three that let the photo fill its side scored 3-4. So: the photo bleeds to the
 * canvas edge on its side, cover-cropped; the words, the wordmark and the progress line live on the other
 * side, never over the photo. Portrait canvases put the photo on top; square and landscape put it on the
 * left. With no photo, the bundled art sits on a panel in the same place - no box, no frame around it.
 *
 * No push-in on stills: the engine's camera zoom is a per-frame scale + crop in whole pixels, and a slow zoom
 * steps visibly - the founder rated those renders down for jitter (iteration 1). A still holds still; a clip
 * moves by itself; the words carry the motion.
 *
 * A template declares its words as BLOCKS (a role sets size, weight and colour; an `art` block is an image
 * row, such as review stars) and its hero; this module lays them out, places the pieces and writes the
 * contract. `layoutPhotoCards` is the same idea for two or three pieces (a pairing, a gift guide): photos with
 * captions, no card tiles - side by side, in rows on a tall canvas, or as a SPREAD on a wide one (the photos
 * as tall columns on the left, every caption on the right: on 16:9 a row of short strips crops the pieces).
 */
export type LedRole = "kicker" | "numeral" | "title" | "subtitle" | "body" | "italic" | "aside" | "price" | "cta" | "url" | "note";
export type LedBinding = {
    propKey: string;
    index?: number;
};
/**
 * One run of words: what it says, how it is set, which prop it edits. `beat` 0 shows with the photo; `lead`
 * opens a new group (a wider gap above); `art` makes it an image row instead (the role sets its height).
 */
export type LedBlock = {
    label: string;
    role: LedRole;
    text: string;
    bind: LedBinding[];
    beat?: 0 | 1;
    lead?: boolean;
    /** Never left out for room (the "was" of a price drop is the point of it, whatever its size). */
    keep?: boolean;
    art?: {
        id: ReturnType<typeof fileAssetId>;
        aspect: number;
    };
};
/** A placed block: words have a fit; an image row has none. */
export type Placed = {
    block: LedBlock;
    fit: TextFit | null;
    rect: Rect;
};
export type HeroAsset = {
    kind: "media";
    id: ReturnType<typeof fileAssetId>;
    mediaKind: "image" | "video";
} | {
    kind: "art";
    id: ReturnType<typeof fileAssetId>;
};
/** A real photo or clip from a media ref (image OR video), registered in the manifest. */
export declare function heroAsset(ctx: MosaicEngineContext, ref: string, fixed: string, assets: NonNullable<MosaicDocument["assets"]>): HeroAsset;
export type LedLayout = {
    W: number;
    H: number;
    split: "top" | "left";
    chrome: Chrome;
    bar: boolean;
    hero: Rect;
    /** Where bundled art sits on the hero panel when there is no photo. */
    art: Rect;
    placed: Placed[];
    /** The area kept free in the words' column (see LedOptions.reserve), for a template's own piece. */
    reserved: Rect | null;
    align: "left" | "center";
};
export type LedOptions = {
    /** The photo's share of the canvas along the split (default: half the width; 60% of the height). */
    share?: number;
    /** A still (print) has no progress line. */
    bar?: boolean;
    align?: "left" | "center";
    /**
     * Keep `share` of the words' column free after the first `at` blocks (a KPI grid, say): those blocks hang
     * from the top, the rest sit on the bottom, the reserved rect is between them.
     */
    reserve?: {
        at: number;
        share: number;
    };
};
export declare function layoutPhotoLed(W: number, H: number, brandName: string, hasLogo: boolean, blocks: LedBlock[], opts?: LedOptions): LedLayout;
export declare function photoLedContract(L: LedLayout): LayoutConstraint[];
type PieceFn = (rect: Rect, importance: number, source: MosaicSource) => void;
/** The photo or clip: cover-cropped; a clip loops, muted. A still holds still (see the header: no push-in). */
export declare function heroMediaSource(hero: Extract<HeroAsset, {
    kind: "media";
}>, label: string): MosaicSource;
/** The hero at its rect: the photo, or the art on a panel. Both answer to `heroKey` (the drop target). */
export declare function heroPieces(piece: PieceFn, rect: Rect, art: Rect, hero: HeroAsset, P: Palette, label: string, heroKey: string): void;
/**
 * The words: each block in its role's tone, arriving after the photo has had a short first beat (none on a print).
 * Founder, 2026-10-17, on a price drop: "takes too long to animate - the first few seconds are photo and no text".
 * The photo holds alone at most WORDS_LEAD_SEC, and every block is in within WORDS_IN_SEC after that.
 */
export declare function blockPieces(piece: PieceFn, placed: Placed[], P: Palette, T: Beats | null, align: "left" | "center"): void;
export type LedCard = {
    key: string;
    hero: HeroAsset;
    heroKey: string;
    blocks: LedBlock[];
};
export type CardsLayout = {
    W: number;
    H: number;
    chrome: Chrome;
    bar: boolean;
    head: Placed[];
    foot: Placed[];
    cards: Array<{
        key: string;
        photo: Rect;
        art: Rect;
        placed: Placed[];
    }>;
    arrangement: "columns" | "rows" | "spread";
};
export declare function layoutPhotoCards(W: number, H: number, brandName: string, hasLogo: boolean, head: LedBlock[], cards: Array<{
    key: string;
    blocks: LedBlock[];
}>, foot: LedBlock[], opts?: {
    bar?: boolean;
}): CardsLayout;
export declare function photoCardsContract(L: CardsLayout): LayoutConstraint[];
/** Every card's photo and words, staggered card by card after the head. */
export declare function cardPieces(piece: PieceFn, L: CardsLayout, cards: LedCard[], P: Palette, T: Beats | null): void;
export type PhotoLedDoc = {
    id: string;
    ctx: MosaicEngineContext;
    P: Palette;
    brandName: string;
    logoRef: string;
    /** The hero prop's ref (empty: the bundled art), its prop key and its asset key. */
    heroRef: string;
    heroKey: string;
    heroFixed: string;
    art: {
        svg: string;
        key: string;
        name: string;
    };
    blocks: LedBlock[];
    /** The clip's length; the photo holds the first share alone, then the words arrive. */
    durationMs: number;
    photoShare?: number;
    label: string;
    debug: boolean;
    options?: LedOptions;
};
export declare function photoLedDocument(a: PhotoLedDoc): MosaicDocument;
export {};
