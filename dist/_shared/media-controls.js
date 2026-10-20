"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitKey = exports.regionKey = exports.MEDIA_FITS = void 0;
exports.mediaControlsSchema = mediaControlsSchema;
exports.mediaControlsDefaults = mediaControlsDefaults;
exports.mediaControlsBindings = mediaControlsBindings;
exports.mediaControlsFor = mediaControlsFor;
exports.renderWithMediaControls = renderWithMediaControls;
exports.applyMediaControls = applyMediaControls;
const template_utils_1 = require("@m0saic/template-utils");
const legible_1 = require("./legible");
const starter_1 = require("./starter");
const text_1 = require("./text");
exports.MEDIA_FITS = ["cover", "contain"];
const regionKey = (key) => `${key}Region`;
exports.regionKey = regionKey;
const fitKey = (key) => `${key}Fit`;
exports.fitKey = fitKey;
/* ── the schema ── */
const REGION_DEF = {
    type: "json",
    required: false,
    meta: { control: { picker: "regions", regions: { max: 1, shapes: ["rect"] } } },
};
const FIT_DEF = {
    type: "string",
    required: false,
    meta: { constraints: { oneOf: [...exports.MEDIA_FITS] } },
};
/** The wrapped schema with each slot taking a photo or a clip, and its Region and Fit right after it. */
function mediaControlsSchema(schema, slots) {
    var _a, _b;
    for (const s of slots)
        if (!schema[s.key])
            throw new Error(`media-controls: no media prop "${s.key}" to control.`);
    const out = {};
    for (const [key, def] of Object.entries(schema)) {
        const slot = slots.find((s) => s.key === key);
        if (!slot) {
            out[key] = def;
            continue;
        }
        const meta = ((_a = def.meta) !== null && _a !== void 0 ? _a : {});
        out[key] = { ...def, meta: { ...meta, control: { ...((_b = meta.control) !== null && _b !== void 0 ? _b : {}), accept: ["image", "video"] } } };
        out[(0, exports.regionKey)(key)] = REGION_DEF;
        if (!slot.fitProp)
            out[(0, exports.fitKey)(key)] = FIT_DEF;
    }
    return out;
}
/** Each Fit's default. A Region has none (empty = the layout's rect). */
function mediaControlsDefaults(slots) {
    return Object.fromEntries(slots.filter((s) => !s.fitProp).map((s) => [(0, exports.fitKey)(s.key), s.fit]));
}
/** The wrapped version's roll call, with a slot that is not drawn at its defaults declaring its Region the same way. */
function mediaControlsBindings(bindings, slots) {
    const unbound = bindings === null || bindings === void 0 ? void 0 : bindings.unbound;
    if (!unbound)
        return bindings;
    const more = Object.fromEntries(slots.filter((s) => unbound[s.key]).map((s) => [(0, exports.regionKey)(s.key), unbound[s.key]]));
    return { ...bindings, unbound: { ...unbound, ...more } };
}
const CONTROLS = Symbol.for("@jewelry/media-controls");
/** The controls a render carries for template `id` (the wrapped one), or null - every render but a controlled one. */
function mediaControlsFor(ctx, id) {
    const c = ctx === null || ctx === void 0 ? void 0 : ctx[CONTROLS];
    return c && c.forId === id ? c : null;
}
/** A Region prop as drawn: null when empty; a malformed one is refused by name, with the reason. */
function pickRegion(id, value, name) {
    if (value === undefined || value === null || value === "")
        return null;
    const parsed = (0, template_utils_1.parseRegionsValue)(value);
    if (!parsed.ok)
        throw new Error(`${id}: ${name} is not a region - ${parsed.error}.`);
    if (parsed.m0)
        return { regions: [], m0: parsed.m0 };
    if (parsed.regions.length === 0)
        return null;
    if (parsed.regions.length > 1)
        throw new Error(`${id}: ${name} takes one rect (got ${parsed.regions.length}).`);
    return { ...(parsed.canvas ? { canvas: parsed.canvas } : {}), regions: parsed.regions };
}
function pickFit(id, value, fallback, name) {
    if (value === undefined || value === null || value === "")
        return fallback;
    const s = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!exports.MEDIA_FITS.includes(s))
        throw new Error(`${id}: ${name} must be one of ${exports.MEDIA_FITS.join(", ")}. Got ${JSON.stringify(value)}.`);
    return s;
}
const emptyMedia = (v) => v === undefined || v === null || (Array.isArray(v) && v.every((x) => String(x !== null && x !== void 0 ? x : "").trim() === ""));
const filled = (v) => v !== undefined && v !== null && (typeof v === "object" ? Object.keys(v).length > 0 : String(v).trim() !== "" && String(v).trim() !== "{}");
/**
 * The render of a version that wraps `prev` with media controls: read the controls (a bad one is refused by name),
 * lay this version's `defaults` under the props (its own words, where they differ from `prev`'s), fill each empty
 * slot with its starter, then render `prev` carrying the controls. Its errors name this version.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWithMediaControls(prev, id, slots, opts = {}) {
    const forId = String(prev.id);
    return async function render(given, ctx) {
        var _a, _b, _c;
        const props = { ...((_a = opts.defaults) !== null && _a !== void 0 ? _a : {}) };
        for (const [k, v] of Object.entries(given))
            if (v !== undefined)
                props[k] = v;
        for (const s of slots) {
            if (!s.starter || !emptyMedia(props[s.key]))
                continue;
            if (s.starterWhen && !filled(props[s.starterWhen]))
                continue;
            if (s.starterUnless && filled(props[s.starterUnless]))
                continue;
            const asset = (0, starter_1.starterAsset)(s.starter);
            if (asset)
                props[s.key] = [asset.path];
        }
        const controls = {
            decor: ((_b = opts.decor) !== null && _b !== void 0 ? _b : []).map((d) => { var _a; return ({ label: d.label, key: (_a = d.starter) !== null && _a !== void 0 ? _a : null, asset: d.starter ? (0, starter_1.starterAsset)(d.starter) : null }); }),
            id,
            forId,
            slots: slots.map((s) => {
                var _a, _b, _c;
                return ({
                    key: s.key,
                    fit: s.fitProp ? null : pickFit(id, props[(0, exports.fitKey)(s.key)], s.fit, (0, exports.fitKey)(s.key)),
                    fitProp: (_a = s.fitProp) !== null && _a !== void 0 ? _a : null,
                    region: pickRegion(id, props[(0, exports.regionKey)(s.key)], (0, exports.regionKey)(s.key)),
                    with: (_b = s.with) !== null && _b !== void 0 ? _b : [],
                    frame: (_c = s.frame) !== null && _c !== void 0 ? _c : [],
                });
            }),
        };
        try {
            return await prev.render(props, { ...ctx, [CONTROLS]: controls });
        }
        catch (e) {
            throw new Error(String((_c = e === null || e === void 0 ? void 0 : e.message) !== null && _c !== void 0 ? _c : e).split(forId).join(id));
        }
    };
}
const bindingsOf = (s) => {
    const e = s.editor;
    if (Array.isArray(e === null || e === void 0 ? void 0 : e.bindings))
        return e.bindings;
    return (e === null || e === void 0 ? void 0 : e.binding) ? [e.binding] : [];
};
const labelOf = (s) => { var _a, _b; return (_b = (_a = s.editor) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : ""; };
const boundTo = (s, key) => bindingsOf(s).some((b) => b.propKey === key && !b.path && (b.index === undefined || b.index === 0));
/** The slot's media: its own file (never the bundled art, never a nested template) at the fit asked for; a clip loops, muted. */
function fitted(src, slot, assets) {
    var _a;
    const s = src;
    const asset = s.type === "media" && s.assetId ? assets[s.assetId] : undefined;
    if ((asset === null || asset === void 0 ? void 0 : asset.kind) !== "file")
        return src;
    const out = { ...s };
    if (slot.fit && ((_a = out.placement) === null || _a === void 0 ? void 0 : _a.fit) !== slot.fit) {
        out.placement = slot.fit === "cover" ? { fit: "cover", focusX: 0.5, focusY: 0.5 } : { fit: "contain", vAlign: "middle" };
    }
    if (asset.mediaType === "video") {
        out.mediaType = "video";
        // jewel.ts `mediaSource` wrote its loop at the top level, where nothing reads it: a clip's loop lives in `playback`.
        if (!out.playback)
            out.playback = { loopMode: out.loopMode === "once" ? "freeze" : "loop" };
        delete out.loopMode;
        if (!out.audio)
            out.audio = { enabled: false };
    }
    return out;
}
/** The slot's handles beside the ones it has: the drop target stays first, then the move glyph and the fit pick. */
function withHandles(src, slot) {
    var _a, _b;
    const editor = { ...((_a = src.editor) !== null && _a !== void 0 ? _a : {}) };
    const entries = bindingsOf(src);
    delete editor.binding;
    const clone = { ...src, editor };
    const fit = (_b = slot.fitProp) !== null && _b !== void 0 ? _b : (slot.fit ? (0, exports.fitKey)(slot.key) : null);
    return (0, template_utils_1.bindProps)(clone, [...entries, { propKey: (0, exports.regionKey)(slot.key), kind: "rect" }, ...(fit ? [{ propKey: fit, kind: "choice" }] : [])]);
}
/** Words that moved are fitted again to their new rect, at the size the rect's height asks for and never under the floor. */
function refitted(src, from, to, W, H) {
    var _a, _b, _c, _d, _e;
    const s = src;
    const layer = s.type === "text" && ((_a = s.layers) === null || _a === void 0 ? void 0 : _a.length) === 1 ? s.layers[0] : undefined;
    const text = ((_b = layer === null || layer === void 0 ? void 0 : layer.content) === null || _b === void 0 ? void 0 : _b.kind) === "literal" ? layer.content.text : undefined;
    const px = (_c = layer === null || layer === void 0 ? void 0 : layer.style) === null || _c === void 0 ? void 0 : _c.fontSize;
    if (!layer || !text || typeof px !== "number")
        return src;
    const face = ((_d = layer.style) === null || _d === void 0 ? void 0 : _d.fontWeight) === "bold" ? "bold" : ((_e = layer.style) === null || _e === void 0 ? void 0 : _e.fontStyle) === "italic" ? "italic" : "regular";
    const floor = (0, legible_1.minTextPx)(W, H);
    const want = Math.max(floor, Math.round((px * to.h) / Math.max(1, from.h)));
    const lines = text.split("\n");
    // At the floor and still too wide, fitText ellipsizes - a degrade, never words nobody can read (legible.ts).
    const fit = (0, text_1.fitText)(lines.join(" "), (0, text_1.budget)(to.w), to.h, want, floor, lines.length, face);
    return { ...s, layers: [{ ...layer, content: { ...layer.content, text: fit.lines.join("\n") }, style: { ...layer.style, fontSize: fit.px } }] };
}
/** The rect a Region names on this canvas, or null (empty, or entirely off it - the layout's rect then). */
function regionRect(r, W, H) {
    var _a;
    if (!r)
        return null;
    if (r.m0)
        return (_a = (0, template_utils_1.regionRectsFromM0)(r.m0, { width: W, height: H })[0]) !== null && _a !== void 0 ? _a : null;
    const v = (0, template_utils_1.resolveRegionsToPx)(r, { width: W, height: H })[0];
    return v && v.ok ? { x: v.x, y: v.y, w: v.w, h: v.h } : null;
}
/**
 * Apply a render's controls to its pieces, before they are placed: each slot's media takes its fit (a clip plays),
 * every rect of the slot carries its handles, and a drawn Region moves the slot - the rects bound to it map onto
 * the region, the pieces named with it keep their place around it. A moved piece is no longer held to the layout's
 * promises for it, so its constraints go.
 */
function applyMediaControls(c, W, H, pieces, assets, constraints) {
    var _a;
    let out = pieces.map((p) => ({ rect: { ...p.rect }, source: p.source }));
    const moved = new Set();
    // Decorative bundled art: a pack photo in its rect, or nothing.
    for (const d of c.decor) {
        const at = out.filter((p) => labelOf(p.source) === d.label);
        if (at.length === 0)
            continue;
        moved.add(d.label);
        if (!d.asset) {
            out = out.filter((p) => !at.includes(p));
            continue;
        }
        const assetId = `starter-${d.key}`;
        assets[assetId] = { ...d.asset };
        for (const p of at)
            p.source = decorSource(p.source, assetId, d.asset.mediaType);
    }
    const clampRect = (r) => {
        const x = Math.max(0, Math.min(W - 1, Math.round(r.x)));
        const y = Math.max(0, Math.min(H - 1, Math.round(r.y)));
        return { x, y, w: Math.max(1, Math.min(W - x, Math.round(r.w))), h: Math.max(1, Math.min(H - y, Math.round(r.h))) };
    };
    for (const slot of c.slots) {
        const bound = out.filter((p) => boundTo(p.source, slot.key));
        if (bound.length === 0)
            continue;
        const frames = out.filter((p) => !bound.includes(p) && slot.frame.includes(labelOf(p.source)));
        const companions = out.filter((p) => !bound.includes(p) && !frames.includes(p) && slot.with.includes(labelOf(p.source)));
        for (const p of bound)
            p.source = withHandles(fitted(p.source, slot, assets), slot);
        const R = regionRect(slot.region, W, H);
        if (!R)
            continue;
        // The extent the area replaces: the slot's frame when one is drawn, else the rects bound to it.
        const extent = frames.length ? frames : bound;
        const x0 = Math.min(...extent.map((p) => p.rect.x));
        const y0 = Math.min(...extent.map((p) => p.rect.y));
        const bw = Math.max(1, Math.max(...extent.map((p) => p.rect.x + p.rect.w)) - x0);
        const bh = Math.max(1, Math.max(...extent.map((p) => p.rect.y + p.rect.h)) - y0);
        const sx = R.w / bw;
        const sy = R.h / bh;
        for (const p of [...bound, ...frames, ...companions]) {
            const from = { x: p.rect.x, y: p.rect.y, w: p.rect.w, h: p.rect.h };
            const to = clampRect({ x: R.x + (from.x - x0) * sx, y: R.y + (from.y - y0) * sy, w: from.w * sx, h: from.h * sy });
            p.rect = { ...to, ...(p.rect.importance !== undefined ? { importance: p.rect.importance } : {}) };
            p.source = refitted(p.source, from, to, W, H);
            const label = labelOf(p.source);
            if (label)
                moved.add(label);
        }
    }
    // Bundled art that nothing draws any more is no part of the document.
    const used = new Set(out.map((p) => p.source.assetId).filter(Boolean));
    for (const [k, a] of Object.entries(assets)) {
        if ((a === null || a === void 0 ? void 0 : a.kind) === "data-uri" && /\(bundled art\)$/.test(String((_a = a.displayName) !== null && _a !== void 0 ? _a : "")) && !used.has(k))
            delete assets[k];
    }
    const kept = moved.size ? constraints.filter((k) => { var _a; return !moved.has(String((_a = k.label) !== null && _a !== void 0 ? _a : "")); }) : constraints;
    return { id: c.id, pieces: out, constraints: kept };
}
/** A decorative piece as a pack photo or clip: cover-cropped to its rect, keeping its motion and its label. */
function decorSource(src, assetId, kind) {
    const s = src;
    return {
        type: "media",
        mediaType: kind,
        assetId,
        placement: { fit: "cover", focusX: 0.5, focusY: 0.5 },
        ...(kind === "video" ? { playback: { loopMode: "loop" }, audio: { enabled: false } } : {}),
        ...(s.overlay ? { overlay: s.overlay } : {}),
        ...(s.editor ? { editor: s.editor } : {}),
    };
}
