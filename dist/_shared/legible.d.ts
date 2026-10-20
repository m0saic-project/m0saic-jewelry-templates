/**
 * THE LEGIBILITY FLOOR. The founder, on round 3 of the reference field (2026-10-16): "if the text is under a
 * certain size relative to the canvas that template is in, which covers if it's being nested, then that is
 * basically a violation". So: no line of text under 1/45 of the canvas's short side - 24 px at 1080, 16 at
 * 720, 48 at 2160 - and a NESTED render counts its text at the size it lands in the outer canvas (the field
 * driver multiplies a leaf's text by the scale its frame draws it at: tools/reference-field.mjs).
 *
 * Calibrated on round 3's ratings: the renders whose smallest text sat at 13-17 px on a 1080 canvas scored 1-2
 * ("some of the text can't be read at all"); the 4s and 5s sat at 24-28 px.
 *
 * A layout meets the floor by giving words room, and when they still do not fit, by leaving the least of them
 * out (fine print first) - never by setting them smaller.
 */
export declare const MIN_TEXT_FRAC: number;
/** The smallest font size, in px, a canvas of W x H may draw. */
export declare function minTextPx(W: number, H: number): number;
export type TextSize = {
    px: number;
    label: string;
    text: string;
};
/** Every drawn run of text in a document - or in each step of a pipeline - smallest first. */
export declare function textSizes(renderable: unknown): TextSize[];
/** The runs of text under the floor of a W x H canvas (empty when it is legible). */
export declare function illegibleText(renderable: unknown, W: number, H: number, scale?: number): TextSize[];
