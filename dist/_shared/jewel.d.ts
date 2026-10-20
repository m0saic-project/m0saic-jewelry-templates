import type { MosaicColor, MosaicDocument, MosaicEngineContext, MosaicOverlayExpr, MosaicSource } from "@m0saic/types";
import { asAssetId } from "@m0saic/types";
import { placeInsetPieces } from "@m0saic/template-utils";
import type { EntranceKind, LayoutConstraint } from "@m0saic/template-utils";
import { type TextFit } from "./text";
/**
 * The jewelry kit: what every template in this repo shares so each one can
 * be short. The pack is a VERTICAL - one industry, many recurring media
 * jobs - and the things that make a clip read as "fine jewelry" are the
 * same across all of them: the ivory / noir / velvet / blush pages, a metal
 * tone, a serif-feeling restraint (small caps kickers, generous margins), a
 * brand wordmark or logo on every frame, and a thin progress line.
 *
 * Nothing here is a template. It is the vocabulary: platforms (the canvas
 * as a knob), themes (the page and ink pairs), metals and stones (the
 * tints the bundled art takes), prop pickers (the gate every render runs),
 * colour math, text sources, the chrome, and beat timing.
 */
export declare const JEWEL_PLATFORMS: {
    /** 9:16 - Stories, Reels, TikTok. */
    readonly story: {
        readonly width: 1080;
        readonly height: 1920;
    };
    /** 4:5 - a portrait feed post. */
    readonly feed: {
        readonly width: 1080;
        readonly height: 1350;
    };
    /** 1:1 - feed, Pinterest, an email tile. */
    readonly square: {
        readonly width: 1080;
        readonly height: 1080;
    };
    /** 16:9 - a web banner, a player, an in-store screen. */
    readonly landscape: {
        readonly width: 1920;
        readonly height: 1080;
    };
    /** 2:1 - an email hero at 2x. */
    readonly email: {
        readonly width: 1200;
        readonly height: 600;
    };
};
export type JewelPlatform = keyof typeof JEWEL_PLATFORMS;
export declare const JEWEL_PLATFORM_KEYS: JewelPlatform[];
export declare const JEWEL_THEMES: readonly ["ivory", "noir", "velvet", "blush"];
export type JewelTheme = (typeof JEWEL_THEMES)[number];
/** The page / text pair each theme starts from; `background` / `ink` override either half. */
export declare const JEWEL_THEME_COLORS: Record<JewelTheme, {
    background: string;
    ink: string;
}>;
export declare const JEWEL_METALS: readonly ["gold", "rose", "white", "platinum"];
export type JewelMetal = (typeof JEWEL_METALS)[number];
export declare const JEWEL_METAL_COLORS: Record<JewelMetal, {
    base: string;
    light: string;
    dark: string;
}>;
export declare const JEWEL_STONES: readonly ["diamond", "sapphire", "ruby", "emerald", "amethyst", "aquamarine", "pearl", "morganite", "citrine", "garnet", "peridot", "opal", "topaz", "tanzanite"];
export type JewelStone = (typeof JEWEL_STONES)[number];
export declare const JEWEL_STONE_COLORS: Record<JewelStone, {
    base: string;
    light: string;
    dark: string;
}>;
/** The birthstone of each month, 1..12 (the traditional list). */
export declare const BIRTHSTONES: Record<number, JewelStone>;
export declare const MONTH_NAMES: readonly ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** One line of lore per stone - the body a birthstone template draws when the jeweler types nothing. */
export declare const STONE_LORE: Record<JewelStone, string>;
/** The accent most jewelry templates start from: champagne gold. */
export declare const JEWEL_DEFAULT_ACCENT = "#b8955a";
/** undefined = the default, "" = removed. */
export declare function pickText(id: string, value: unknown, fallback: string, name: string): string;
/** A required line: empty is an error with the reason. */
export declare function pickRequired(id: string, value: unknown, fallback: string, name: string, why: string): string;
export declare function pickColor(id: string, value: unknown, fallback: string, name: string): MosaicColor;
export declare function pickInt(id: string, value: unknown, fallback: number, min: number, max: number, name: string): number;
export declare function pickNumber(id: string, value: unknown, fallback: number, min: number, max: number, name: string): number;
export declare function pickBool(id: string, value: unknown, fallback: boolean, name: string): boolean;
/** A closed-set knob: case-folded, trimmed, refused by name. */
export declare function pickOneOf<T extends string>(id: string, value: unknown, options: readonly T[], fallback: T, name: string): T;
/** A zero-or-one media prop: an array of path strings; more than one is an error. */
export declare function pickMedia(id: string, value: unknown, name: string): string;
/** A many-media prop: an array of path strings, capped. */
export declare function pickMediaList(id: string, value: unknown, name: string, max: number): string[];
/** A JSON prop an editor may hand over as a string. */
export declare function pickJson(id: string, value: unknown, name: string): unknown;
/** A finite number in range, or the fallback - for the hints resolver, which must never throw. */
export declare function numberOr(v: unknown, fallback: number, min: number, max: number): number;
/** The platform's canvas for the hints resolver: junk falls back to the default. */
export declare function platformDims(v: unknown, fallback: JewelPlatform): {
    width: number;
    height: number;
};
/** Image or video? The host's probe is the authority; otherwise the extension decides. */
export declare function mediaKindOf(ctx: MosaicEngineContext, assetId: string, ref: string): "image" | "video";
/** An id-shaped ref IS the asset id (a host's picker hands one over); a path gets the fixed id. */
export declare function fileAssetId(ref: string, fixed: string): import("@m0saic/types").AssetId;
export declare function rgb(c: MosaicColor | string): [number, number, number];
export declare function hex(r: number, g: number, b: number): MosaicColor;
/** Linear byte mix, `t` of `a` over `1 - t` of `b`: a static stand-in for opacity that costs no overlay layer. */
export declare function mix(a: MosaicColor | string, b: MosaicColor | string, t: number): MosaicColor;
export declare function luminance(c: MosaicColor | string): number;
/** Whichever of the two reads better on `fill`. */
export declare function onColor(fill: MosaicColor | string, a: MosaicColor | string, b: MosaicColor | string): MosaicColor;
export declare function round3(n: number): number;
/** The theme's page, ink and the derived tones a template draws with. */
export type Palette = {
    bg: MosaicColor;
    ink: MosaicColor;
    dim: MosaicColor;
    faint: MosaicColor;
    accent: MosaicColor;
    /** A card fill: the accent whispered over the page. */
    card: MosaicColor;
    /** A line / rule: the ink thinned toward the page. */
    rule: MosaicColor;
    /** Text on the accent. */
    onAccent: MosaicColor;
    dark: boolean;
};
export declare function palette(id: string, props: {
    theme?: unknown;
    accent?: unknown;
    background?: unknown;
    ink?: unknown;
}, defaults: {
    theme: JewelTheme;
    accent: string;
}): Palette;
export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export type Block = {
    fit: TextFit;
    rect: Rect;
};
export declare function clampTo(W: number, H: number): (r: Rect) => Rect;
/**
 * Lay a stack of heights in a column between `y0` and `y1`; `anchor` centres
 * the stack or hangs it from the top. Zero heights are skipped and return a
 * null so callers can index by meaning.
 */
export declare function stackColumn(W: number, H: number, x: number, w: number, y0: number, y1: number, heights: number[], between: number, anchor?: "center" | "top" | "bottom"): (Rect | null)[];
export declare const at: (fit: TextFit, rect: Rect) => Block;
/** Shortcuts over fitText with the kit's faces: a kicker is small caps bold, a title large bold, a body regular. */
export declare const fitKicker: (text: string, w: number, maxH: number, S: number, scale?: number) => TextFit;
export declare const fitTitle: (text: string, w: number, maxH: number, S: number, scale?: number, lines?: number) => TextFit;
export declare const fitBody: (text: string, w: number, maxH: number, S: number, scale?: number, lines?: number) => TextFit;
export declare const fitItalic: (text: string, w: number, maxH: number, S: number, scale?: number, lines?: number) => TextFit;
export type Chrome = {
    wordmark: Block;
    logo: Rect | null;
    bar: Rect;
    /** Where content may start / must end. */
    top: number;
    bottom: number;
    margin: number;
};
/**
 * `S` sizes the chrome by another canvas than W x H (a side of a split sized as the whole canvas, so its
 * wordmark is not half size); `minPx` is the wordmark's floor (legible.ts).
 */
export declare function chromeLayout(W: number, H: number, brandName: string, hasLogo: boolean, opts?: {
    bar?: boolean;
    S?: number;
    minPx?: number;
}): Chrome;
export declare function chromeContract(C: Chrome, withBar?: boolean): LayoutConstraint[];
/** Every block's fit as a measured-text constraint; nulls are skipped. */
export declare function fitsContract(entries: Array<[string, TextFit | Block | null | undefined]>): LayoutConstraint[];
/** One svg-rasterized text block (the bundled font, no drawtext), aligned in its rect. */
export declare function textSource(fit: TextFit, color: MosaicColor, label: string, overlay?: MosaicOverlayExpr, hAlign?: "left" | "center" | "right", vAlign?: "top" | "middle" | "bottom"): MosaicSource;
/** A colour tile, optionally rounded or a pill, with motion. */
export declare function tileSource(color: MosaicColor, label: string, opts?: {
    radius?: number;
    pill?: boolean;
    overlay?: MosaicOverlayExpr;
}): MosaicSource;
/** An image or video asset in a rect, contain-fitted by default. */
export declare function mediaSource(assetId: ReturnType<typeof asAssetId>, kind: "image" | "video", label: string, opts?: {
    fit?: "contain" | "cover";
    hAlign?: "left" | "center" | "right";
    overlay?: MosaicOverlayExpr;
    loop?: boolean;
}): MosaicSource;
/** The progress line: one full-width tile that slides in from the left over the clip. */
export declare function progressSource(color: MosaicColor, totalSec: number): MosaicSource;
export type Pieces = Parameters<typeof placeInsetPieces>[0]["pieces"];
/** A piece list with the push shortcut every template uses. */
export declare function pieceList(): {
    pieces: import("@m0saic/template-utils").InsetPiece[];
    piece: (rect: Rect, importance: number, source: MosaicSource) => number;
};
/**
 * Place the pieces and finish the document: the canvas is the document's
 * own background (never a full-frame rect), the length is authored, and the
 * layout intent travels with the document for the test sweep.
 */
export declare function finishDocument(id: string, ctx: MosaicEngineContext, W: number, H: number, pieces: Pieces, assets: NonNullable<MosaicDocument["assets"]>, bg: MosaicColor, durationMs: number, label: string, constraints: LayoutConstraint[], debug: boolean): MosaicDocument;
/**
 * The chrome's pieces: the logo (bound to the media prop, the drop target)
 * or the wordmark (bound to the brand name AND the logo prop so it is the
 * drop target), and the progress line in the accent.
 */
export declare function chromePieces(piece: (rect: Rect, importance: number, source: MosaicSource) => void, C: Chrome, P: Palette, logo: {
    id?: ReturnType<typeof asAssetId>;
    kind: "image" | "video";
}, totalSec: number, keys?: {
    brandName: string;
    brandLogo: string;
}, withBar?: boolean): void;
/** The logo asset from a media ref: id, kind and the manifest entry. */
export declare function logoAsset(ctx: MosaicEngineContext, ref: string, assets: NonNullable<MosaicDocument["assets"]>): {
    id?: ReturnType<typeof asAssetId>;
    kind: "image" | "video";
};
/** An image asset from a media ref, refusing a probed video. */
export declare function imageAsset(id: string, ctx: MosaicEngineContext, ref: string, fixed: string, assets: NonNullable<MosaicDocument["assets"]>, name: string): import("@m0saic/types").AssetId;
/** An inline SVG as a data-uri image asset. */
export declare function svgAsset(svg: string, fixed: string, displayName: string, assets: NonNullable<MosaicDocument["assets"]>): import("@m0saic/types").AssetId;
export type Beats = {
    total: number;
    /** Where each beat after the first begins. */
    cuts: number[];
    fade: number;
    rise: number;
    stagger: number;
};
/** Beats as shares of the clip, with ramps that shorten on a short clip. */
export declare function shareBeats(totalSec: number, shares: number[]): Beats;
/** Motion helpers bound to a beat table. */
export declare function motion(T: Beats): {
    leave: (endSec: number) => MosaicOverlayExpr;
    arrive: (startSec: number, step: number, endSec?: number, kind?: EntranceKind) => MosaicOverlayExpr;
};
/** A price as drawn: a currency symbol, thousands separators, no cents when whole. */
export declare function formatPrice(n: number, currency?: string): string;
