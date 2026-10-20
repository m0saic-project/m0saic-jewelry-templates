"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_TEXT_FRAC = void 0;
exports.minTextPx = minTextPx;
exports.textSizes = textSizes;
exports.illegibleText = illegibleText;
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
exports.MIN_TEXT_FRAC = 1 / 45;
/** The smallest font size, in px, a canvas of W x H may draw. */
function minTextPx(W, H) {
    return Math.ceil(Math.min(W, H) * exports.MIN_TEXT_FRAC);
}
/** Every drawn run of text in a document - or in each step of a pipeline - smallest first. */
function textSizes(renderable) {
    var _a, _b;
    const out = [];
    const walk = (node, label) => {
        var _a, _b, _c;
        if (!node || typeof node !== "object")
            return;
        if (Array.isArray(node)) {
            for (const x of node)
                walk(x, label);
            return;
        }
        const n = node;
        const here = typeof ((_a = n.editor) === null || _a === void 0 ? void 0 : _a.label) === "string" ? n.editor.label : label;
        if (n.type === "text" && Array.isArray(n.layers)) {
            for (const l of n.layers) {
                const text = (_b = l === null || l === void 0 ? void 0 : l.content) === null || _b === void 0 ? void 0 : _b.text;
                const px = (_c = l === null || l === void 0 ? void 0 : l.style) === null || _c === void 0 ? void 0 : _c.fontSize;
                if (typeof text === "string" && text.trim() && typeof px === "number")
                    out.push({ px, label: here, text });
            }
            return;
        }
        for (const v of Object.values(node))
            walk(v, here);
    };
    const r = renderable;
    if ((r === null || r === void 0 ? void 0 : r.kind) === "mosaic_pipeline" && Array.isArray(r.steps))
        for (const s of r.steps)
            walk((_a = s.file) === null || _a === void 0 ? void 0 : _a.sources, "");
    else
        walk((_b = r === null || r === void 0 ? void 0 : r.sources) !== null && _b !== void 0 ? _b : r, "");
    return out.sort((a, b) => a.px - b.px);
}
/** The runs of text under the floor of a W x H canvas (empty when it is legible). */
function illegibleText(renderable, W, H, scale = 1) {
    const floor = minTextPx(W, H);
    return textSizes(renderable).filter((t) => t.px * scale < floor - 1e-6);
}
