import { type JewelMetal, type JewelStone } from "./jewel";
/**
 * The generic jewelry art this repo SHIPS - flat, brand-less illustrations
 * as inline SVG text, tinted by the metal and the stone a template picks.
 * No file on disk, no image decoder in the loop: the markup goes into the
 * document as a `data:image/svg+xml,` asset and m0saic rasterizes it, so
 * the same string draws the same ring in the app preview, the CLI and the
 * web. A `productImage` prop swaps any of them for a real product shot.
 *
 * Every piece is authored on one square viewBox ({@link ART_VIEWBOX}); the
 * metal is the band / setting / chain, the stone is the stone.
 *
 * Why these: a solitaire, a band, a pendant, studs, hoops, a tennis
 * bracelet, a loose round brilliant, a watch and an open ring box cover
 * what a jeweler's "this piece" row points at - bridal, fashion, estate,
 * loose stones and the reveal.
 */
export declare const ART_KINDS: readonly ["solitaire", "band", "pendant", "studs", "hoops", "tennis", "diamond", "watch", "ringbox"];
export type ArtKind = (typeof ART_KINDS)[number];
export type ArtTone = {
    metal: {
        base: string;
        light: string;
        dark: string;
    };
    stone: {
        base: string;
        light: string;
        dark: string;
    };
    /** The shadow and hairline colour - the template's ink. */
    ink: string;
    /** The ring-box lining and the velvet - the template's accent. */
    accent: string;
};
export declare function artTone(metal: JewelMetal, stone: JewelStone, ink: string, accent: string): ArtTone;
export declare const ART_VIEWBOX: {
    readonly width: 400;
    readonly height: 400;
};
/** The open box alone - the reveal's stage; the ring is a second piece that rises into the slot. */
export declare function ringBoxEmptySvg(t: ArtTone): string;
/** One piece as SVG text, in the template's colours. */
export declare function jewelArtSvg(kind: ArtKind, tone: ArtTone): string;
/** A loose round brilliant alone, any size, for stone-first templates (the 4Cs, birthstones). */
export declare function stoneSvg(stone: ArtTone["stone"], ink: string): string;
/** The six cuts a shape guide shows, each a flat top view with a table and crown facets. */
export declare const SHAPE_KINDS: readonly ["round", "oval", "cushion", "emerald", "pear", "princess"];
export type ShapeKind = (typeof SHAPE_KINDS)[number];
/** One cut as SVG text: an outline in the stone's dark, facets in base / light, a table in light. */
export declare function shapeSvg(kind: ShapeKind, s: ArtTone["stone"], ink: string): string;
/** A sparkle: a four-point star, for accents. */
export declare function sparkleSvg(color: string): string;
/** URL-encoded, not base64: the same code runs in a browser, and the rasterizer reads it. */
export declare function svgDataUri(svg: string): string;
