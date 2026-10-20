"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitItalic = exports.fitBody = exports.fitTitle = exports.fitKicker = exports.at = exports.JEWEL_DEFAULT_ACCENT = exports.STONE_LORE = exports.MONTH_NAMES = exports.BIRTHSTONES = exports.JEWEL_STONE_COLORS = exports.JEWEL_STONES = exports.JEWEL_METAL_COLORS = exports.JEWEL_METALS = exports.JEWEL_THEME_COLORS = exports.JEWEL_THEMES = exports.JEWEL_PLATFORM_KEYS = exports.JEWEL_PLATFORMS = void 0;
exports.pickText = pickText;
exports.pickRequired = pickRequired;
exports.pickColor = pickColor;
exports.pickInt = pickInt;
exports.pickNumber = pickNumber;
exports.pickBool = pickBool;
exports.pickOneOf = pickOneOf;
exports.pickMedia = pickMedia;
exports.pickMediaList = pickMediaList;
exports.pickJson = pickJson;
exports.numberOr = numberOr;
exports.platformDims = platformDims;
exports.mediaKindOf = mediaKindOf;
exports.fileAssetId = fileAssetId;
exports.rgb = rgb;
exports.hex = hex;
exports.mix = mix;
exports.luminance = luminance;
exports.onColor = onColor;
exports.round3 = round3;
exports.palette = palette;
exports.clampTo = clampTo;
exports.stackColumn = stackColumn;
exports.chromeLayout = chromeLayout;
exports.chromeContract = chromeContract;
exports.fitsContract = fitsContract;
exports.textSource = textSource;
exports.tileSource = tileSource;
exports.mediaSource = mediaSource;
exports.progressSource = progressSource;
exports.pieceList = pieceList;
exports.finishDocument = finishDocument;
exports.chromePieces = chromePieces;
exports.logoAsset = logoAsset;
exports.imageAsset = imageAsset;
exports.svgAsset = svgAsset;
exports.shareBeats = shareBeats;
exports.motion = motion;
exports.formatPrice = formatPrice;
const types_1 = require("@m0saic/types");
const template_utils_1 = require("@m0saic/template-utils");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const layout_1 = require("./layout");
const media_controls_1 = require("./media-controls");
const text_1 = require("./text");
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
/* ── platforms: where the clip goes, as the canvas it wants ── */
exports.JEWEL_PLATFORMS = {
    /** 9:16 - Stories, Reels, TikTok. */
    story: { width: 1080, height: 1920 },
    /** 4:5 - a portrait feed post. */
    feed: { width: 1080, height: 1350 },
    /** 1:1 - feed, Pinterest, an email tile. */
    square: { width: 1080, height: 1080 },
    /** 16:9 - a web banner, a player, an in-store screen. */
    landscape: { width: 1920, height: 1080 },
    /** 2:1 - an email hero at 2x. */
    email: { width: 1200, height: 600 },
};
exports.JEWEL_PLATFORM_KEYS = Object.keys(exports.JEWEL_PLATFORMS);
/* ── themes: the page and the ink ── */
exports.JEWEL_THEMES = ["ivory", "noir", "velvet", "blush"];
/** The page / text pair each theme starts from; `background` / `ink` override either half. */
exports.JEWEL_THEME_COLORS = {
    /** Warm paper, near-black text - the "product on white" convention. */
    ivory: { background: "#f6f1ea", ink: "#1d1a17" },
    /** Near-black, warm light text - the "product on black" convention. */
    noir: { background: "#121010", ink: "#f3ede4" },
    /** Deep blue velvet, ivory text - the ring-box lining. */
    velvet: { background: "#141f3a", ink: "#f4efe6" },
    /** Blush paper, deep brown text - bridal and rose gold. */
    blush: { background: "#f7ebe6", ink: "#2b1f1f" },
};
/* ── metals and stones: the tints the bundled art takes ── */
exports.JEWEL_METALS = ["gold", "rose", "white", "platinum"];
exports.JEWEL_METAL_COLORS = {
    gold: { base: "#d4af37", light: "#f1dc8a", dark: "#8f6f1c" },
    rose: { base: "#c98a7a", light: "#efc3b5", dark: "#8b5447" },
    white: { base: "#d6d8dd", light: "#f6f7f9", dark: "#8d9199" },
    platinum: { base: "#c9ccd1", light: "#eef0f3", dark: "#7f848b" },
};
exports.JEWEL_STONES = ["diamond", "sapphire", "ruby", "emerald", "amethyst", "aquamarine", "pearl", "morganite", "citrine", "garnet", "peridot", "opal", "topaz", "tanzanite"];
exports.JEWEL_STONE_COLORS = {
    diamond: { base: "#dfe9f3", light: "#ffffff", dark: "#9fb3c8" },
    sapphire: { base: "#1f4fa3", light: "#6f9be0", dark: "#0f2a5e" },
    ruby: { base: "#b3122e", light: "#e8607a", dark: "#6b0a1c" },
    emerald: { base: "#1a7a4a", light: "#5fc08c", dark: "#0d4a2b" },
    amethyst: { base: "#7a4fb3", light: "#b494e0", dark: "#482a70" },
    aquamarine: { base: "#6fc3d6", light: "#b6e6ef", dark: "#3a8a9c" },
    pearl: { base: "#f1ece4", light: "#ffffff", dark: "#c9bfae" },
    morganite: { base: "#e8a9a0", light: "#f7d3cc", dark: "#b7746b" },
    citrine: { base: "#e3a82a", light: "#f6d57a", dark: "#9c6f12" },
    garnet: { base: "#8a1a2b", light: "#c75a6a", dark: "#4f0d18" },
    peridot: { base: "#9fc23a", light: "#cfe38a", dark: "#5f7a1c" },
    opal: { base: "#e9e6f2", light: "#ffffff", dark: "#b7b1cf" },
    topaz: { base: "#3aa0d8", light: "#9ad2ef", dark: "#1f6a94" },
    tanzanite: { base: "#4a4fb3", light: "#9397e0", dark: "#2a2d70" },
};
/** The birthstone of each month, 1..12 (the traditional list). */
exports.BIRTHSTONES = {
    1: "garnet",
    2: "amethyst",
    3: "aquamarine",
    4: "diamond",
    5: "emerald",
    6: "pearl",
    7: "ruby",
    8: "peridot",
    9: "sapphire",
    10: "opal",
    11: "topaz",
    12: "tanzanite",
};
exports.MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** One line of lore per stone - the body a birthstone template draws when the jeweler types nothing. */
exports.STONE_LORE = {
    garnet: "Garnet, the stone of January: protection on every journey.",
    amethyst: "Amethyst, the stone of February: calm, clarity and a clear head.",
    aquamarine: "Aquamarine, the stone of March: the colour of calm seas.",
    diamond: "Diamond, the stone of April: the hardest thing there is, and the brightest.",
    emerald: "Emerald, the stone of May: new growth, and a green no other stone has.",
    pearl: "Pearl, the stone of June: the only gem made by a living thing.",
    ruby: "Ruby, the stone of July: the king of gems, and the colour of the heart.",
    peridot: "Peridot, the stone of August: born in volcanoes, bright as summer.",
    sapphire: "Sapphire, the stone of September: wisdom, loyalty and a royal blue.",
    opal: "Opal, the stone of October: every colour at once.",
    topaz: "Topaz, the stone of November: warmth for the turn of the year.",
    tanzanite: "Tanzanite, the stone of December: found in one place on earth.",
    morganite: "Morganite: a blush-pink beryl, the colour of first light.",
    citrine: "Citrine: bottled sunshine, the merchant's stone.",
};
/** The accent most jewelry templates start from: champagne gold. */
exports.JEWEL_DEFAULT_ACCENT = "#b8955a";
/* ── pickers: the schema is documentation, render() is the gate ── */
const HEX = /^#[0-9a-fA-F]{6}$/;
/** undefined = the default, "" = removed. */
function pickText(id, value, fallback, name) {
    if (value === undefined || value === null)
        return fallback;
    if (typeof value !== "string")
        throw new Error(`${id}: ${name} must be a string.`);
    return (0, text_1.cleanCopy)(value);
}
/** A required line: empty is an error with the reason. */
function pickRequired(id, value, fallback, name, why) {
    const s = pickText(id, value, fallback, name);
    if (s.length === 0)
        throw new Error(`${id}: ${name} is required - ${why}.`);
    return s;
}
function pickColor(id, value, fallback, name) {
    const s = typeof value === "string" ? value.trim() : "";
    if (s.length === 0)
        return fallback;
    if (!HEX.test(s))
        throw new Error(`${id}: ${name} ${JSON.stringify(value)} must be #rrggbb.`);
    return s;
}
function pickInt(id, value, fallback, min, max, name) {
    if (value === undefined || value === null || value === "")
        return fallback;
    const n = typeof value === "string" ? Number(value) : value;
    if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max) {
        throw new Error(`${id}: ${name} must be a whole number from ${min} to ${max}. Got ${JSON.stringify(value)}.`);
    }
    return n;
}
function pickNumber(id, value, fallback, min, max, name) {
    if (value === undefined || value === null || value === "")
        return fallback;
    const n = typeof value === "string" ? Number(value) : value;
    if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max) {
        throw new Error(`${id}: ${name} must be a number from ${min} to ${max}. Got ${JSON.stringify(value)}.`);
    }
    return n;
}
function pickBool(id, value, fallback, name) {
    if (value === undefined || value === null || value === "")
        return fallback;
    if (typeof value === "boolean")
        return value;
    if (value === "true")
        return true;
    if (value === "false")
        return false;
    throw new Error(`${id}: ${name} must be true or false. Got ${JSON.stringify(value)}.`);
}
/** A closed-set knob: case-folded, trimmed, refused by name. */
function pickOneOf(id, value, options, fallback, name) {
    if (value === undefined || value === null || value === "")
        return fallback;
    const s = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!options.includes(s)) {
        throw new Error(`${id}: ${name} must be one of ${options.join(", ")}. Got ${JSON.stringify(value)}.`);
    }
    return s;
}
/** A zero-or-one media prop: an array of path strings; more than one is an error. */
function pickMedia(id, value, name) {
    var _a;
    if (value === undefined || value === null)
        return "";
    if (!Array.isArray(value))
        throw new Error(`${id}: ${name} must be an array of zero or one path.`);
    const refs = value.map((v) => String(v).trim()).filter(Boolean);
    if (refs.length > 1)
        throw new Error(`${id}: ${name} accepts zero or one file (got ${refs.length}).`);
    return (_a = refs[0]) !== null && _a !== void 0 ? _a : "";
}
/** A many-media prop: an array of path strings, capped. */
function pickMediaList(id, value, name, max) {
    if (value === undefined || value === null)
        return [];
    if (!Array.isArray(value))
        throw new Error(`${id}: ${name} must be an array of paths.`);
    const refs = value.map((v) => String(v).trim()).filter(Boolean);
    if (refs.length > max)
        throw new Error(`${id}: ${name} accepts at most ${max} files (got ${refs.length}).`);
    return refs;
}
/** A JSON prop an editor may hand over as a string. */
function pickJson(id, value, name) {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        }
        catch {
            throw new Error(`${id}: ${name} is not valid JSON.`);
        }
    }
    return value;
}
/** A finite number in range, or the fallback - for the hints resolver, which must never throw. */
function numberOr(v, fallback, min, max) {
    const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
    return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}
/** The platform's canvas for the hints resolver: junk falls back to the default. */
function platformDims(v, fallback) {
    const key = typeof v === "string" ? v.trim().toLowerCase() : "";
    return exports.JEWEL_PLATFORMS[(key in exports.JEWEL_PLATFORMS ? key : fallback)];
}
const VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|avi)$/i;
/** Image or video? The host's probe is the authority; otherwise the extension decides. */
function mediaKindOf(ctx, assetId, ref) {
    var _a;
    const known = (_a = ctx.media) === null || _a === void 0 ? void 0 : _a[assetId];
    if ((known === null || known === void 0 ? void 0 : known.kind) === "video" || (known === null || known === void 0 ? void 0 : known.kind) === "image")
        return known.kind;
    return VIDEO_EXT.test(ref) ? "video" : "image";
}
const ASSET_ID_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
/** An id-shaped ref IS the asset id (a host's picker hands one over); a path gets the fixed id. */
function fileAssetId(ref, fixed) {
    return (0, types_1.asAssetId)(ASSET_ID_RE.test(ref) ? ref : fixed);
}
/* ── colour ── */
function rgb(c) {
    const n = parseInt(String(c).slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hex(r, g, b) {
    const c = (x) => Math.max(0, Math.min(255, Math.round(x)));
    return `#${((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1)}`;
}
/** Linear byte mix, `t` of `a` over `1 - t` of `b`: a static stand-in for opacity that costs no overlay layer. */
function mix(a, b, t) {
    const [ar, ag, ab] = rgb(a);
    const [br, bg, bb] = rgb(b);
    return hex(ar * t + br * (1 - t), ag * t + bg * (1 - t), ab * t + bb * (1 - t));
}
function luminance(c) {
    const [r, g, b] = rgb(c);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
/** Whichever of the two reads better on `fill`. */
function onColor(fill, a, b) {
    const l = luminance(fill);
    return (Math.abs(luminance(a) - l) >= Math.abs(luminance(b) - l) ? a : b);
}
function round3(n) {
    return Math.round(n * 1000) / 1000;
}
function palette(id, props, defaults) {
    const theme = exports.JEWEL_THEME_COLORS[pickOneOf(id, props.theme, exports.JEWEL_THEMES, defaults.theme, "theme")];
    const accent = pickColor(id, props.accent, defaults.accent, "accent");
    const bg = pickColor(id, props.background, theme.background, "background");
    const ink = pickColor(id, props.ink, theme.ink, "ink");
    return {
        bg,
        ink,
        dim: mix(ink, bg, 0.62),
        faint: mix(ink, bg, 0.3),
        accent,
        card: mix(accent, bg, 0.1),
        rule: mix(ink, bg, 0.16),
        onAccent: onColor(accent, bg, ink),
        dark: luminance(bg) < 0.45,
    };
}
function clampTo(W, H) {
    return (r) => {
        const x = Math.max(0, Math.min(W - 1, Math.round(r.x)));
        const y = Math.max(0, Math.min(H - 1, Math.round(r.y)));
        return { x, y, w: Math.max(1, Math.min(W - x, Math.round(r.w))), h: Math.max(1, Math.min(H - y, Math.round(r.h))) };
    };
}
/**
 * Lay a stack of heights in a column between `y0` and `y1`; `anchor` centres
 * the stack or hangs it from the top. Zero heights are skipped and return a
 * null so callers can index by meaning.
 */
function stackColumn(W, H, x, w, y0, y1, heights, between, anchor = "center") {
    const clamp = clampTo(W, H);
    const live = heights.filter((h) => h > 0);
    const total = live.reduce((a, b) => a + b, 0) + between * Math.max(0, live.length - 1);
    let y = y0 + (anchor === "top" ? 0 : anchor === "bottom" ? Math.max(0, y1 - y0 - total) : Math.max(0, (y1 - y0 - total) / 2));
    return heights.map((h) => {
        if (h <= 0)
            return null;
        const r = clamp({ x, y, w, h });
        y += h + between;
        return r;
    });
}
const at = (fit, rect) => ({ fit, rect });
exports.at = at;
/** Shortcuts over fitText with the kit's faces: a kicker is small caps bold, a title large bold, a body regular. */
const fitKicker = (text, w, maxH, S, scale = 0.028) => (0, text_1.fitText)(text.toUpperCase(), (0, text_1.budget)(w), maxH, Math.round(scale * S), 8, 1, "bold");
exports.fitKicker = fitKicker;
const fitTitle = (text, w, maxH, S, scale = 0.08, lines = 2) => (0, text_1.fitText)(text, (0, text_1.budget)(w), maxH, Math.round(scale * S), 12, lines, "bold");
exports.fitTitle = fitTitle;
const fitBody = (text, w, maxH, S, scale = 0.036, lines = 3) => (0, text_1.fitText)(text, (0, text_1.budget)(w), maxH, Math.round(scale * S), 9, lines, "regular");
exports.fitBody = fitBody;
const fitItalic = (text, w, maxH, S, scale = 0.036, lines = 2) => (0, text_1.fitText)(text, (0, text_1.budget)(w), maxH, Math.round(scale * S), 9, lines, "italic");
exports.fitItalic = fitItalic;
/**
 * `S` sizes the chrome by another canvas than W x H (a side of a split sized as the whole canvas, so its
 * wordmark is not half size); `minPx` is the wordmark's floor (legible.ts).
 */
function chromeLayout(W, H, brandName, hasLogo, opts = {}) {
    var _a, _b;
    const S = (_a = opts.S) !== null && _a !== void 0 ? _a : Math.min(W, H);
    const clamp = clampTo(W, H);
    const margin = Math.round(0.06 * S);
    const minPx = (_b = opts.minPx) !== null && _b !== void 0 ? _b : 8;
    const wmH = Math.max(10, Math.round(0.04 * S), Math.ceil(minPx * 1.3));
    const wmFit = (0, text_1.fitText)(brandName.toUpperCase(), (0, text_1.budget)(W - 2 * margin), wmH, Math.max(minPx, Math.round(0.026 * S)), minPx, 1, "bold");
    const wordmark = { fit: wmFit, rect: clamp({ x: margin, y: Math.round(0.045 * S), w: W - 2 * margin, h: wmFit.h }) };
    const logo = hasLogo ? clamp({ x: margin, y: Math.round(0.035 * S), w: Math.round(Math.min(W - 2 * margin, 0.4 * W)), h: Math.round(0.085 * S) }) : null;
    const chromeBottom = logo ? logo.y + logo.h : wordmark.rect.y + wordmark.rect.h;
    const barH = opts.bar === false ? 0 : Math.max(3, Math.round(0.006 * S));
    const bar = { x: 0, y: H - Math.max(1, barH), w: W, h: Math.max(1, barH) };
    return {
        wordmark,
        logo,
        bar,
        top: chromeBottom + Math.round(0.04 * S),
        bottom: H - barH - Math.round(0.05 * S),
        margin,
    };
}
function chromeContract(C, withBar = true) {
    const out = [];
    if (!C.logo)
        out.push((0, layout_1.textFitsMeasured)("wordmark", C.wordmark.fit.lines.join("\n"), C.wordmark.fit.px, C.wordmark.fit.width));
    out.push({ label: C.logo ? "logo" : "wordmark", within: { yFrac: [0, 0.25] } });
    if (withBar)
        out.push({ label: "progress", minWidthFrac: 0.98, within: { yFrac: [0.9, 1] } });
    return out;
}
/** Every block's fit as a measured-text constraint; nulls are skipped. */
function fitsContract(entries) {
    const out = [];
    for (const [label, v] of entries) {
        if (!v)
            continue;
        const fit = "fit" in v ? v.fit : v;
        out.push((0, layout_1.textFitsMeasured)(label, fit.lines.join("\n"), fit.px, fit.width));
    }
    return out;
}
/* ── sources ── */
/** One svg-rasterized text block (the bundled font, no drawtext), aligned in its rect. */
function textSource(fit, color, label, overlay, hAlign = "center", vAlign = "middle") {
    return (0, template_utils_1.tag)({
        type: "text",
        rasterizer: "svg",
        renderMode: { kind: "image" },
        layers: [
            {
                content: { kind: "literal", text: fit.lines.join("\n") },
                style: {
                    fontSize: fit.px,
                    fontColor: color,
                    ...(fit.face === "bold" ? { fontWeight: "bold" } : {}),
                    ...(fit.face === "italic" ? { fontStyle: "italic" } : {}),
                },
                placement: { hAlign, vAlign },
            },
        ],
        ...(overlay ? { overlay } : {}),
        editor: { owner: "template" },
    }, label);
}
/** A colour tile, optionally rounded or a pill, with motion. */
function tileSource(color, label, opts = {}) {
    const effects = opts.pill
        ? { rounding: { cornerStyle: "pill" } }
        : opts.radius !== undefined
            ? { rounding: { cornerStyle: "rounded", borderRadius: opts.radius } }
            : undefined;
    return (0, template_utils_1.tag)((0, template_utils_1.makeColorTile)(color, { ...(effects ? { effects } : {}), ...(opts.overlay ? { overlay: opts.overlay } : {}) }), label);
}
/** An image or video asset in a rect, contain-fitted by default. */
function mediaSource(assetId, kind, label, opts = {}) {
    var _a;
    return (0, template_utils_1.tag)({
        type: "media",
        mediaType: kind,
        assetId,
        placement: { fit: (_a = opts.fit) !== null && _a !== void 0 ? _a : "contain", ...(opts.hAlign ? { hAlign: opts.hAlign } : {}), vAlign: "middle" },
        ...(kind === "video" ? { loopMode: opts.loop === false ? "once" : "loop", audio: { enabled: false } } : {}),
        ...(opts.overlay ? { overlay: opts.overlay } : {}),
        editor: { owner: "template" },
    }, label);
}
/** The progress line: one full-width tile that slides in from the left over the clip. */
function progressSource(color, totalSec) {
    return (0, template_utils_1.tag)((0, template_utils_1.makeColorTile)(color, { overlay: { xExpr: `-W*(1-min(1,t/${totalSec}))` } }), "progress");
}
/** A piece list with the push shortcut every template uses. */
function pieceList() {
    const pieces = [];
    const piece = (rect, importance, source) => pieces.push({ rect: { ...rect, importance }, source });
    return { pieces, piece };
}
/**
 * Place the pieces and finish the document: the canvas is the document's
 * own background (never a full-frame rect), the length is authored, and the
 * layout intent travels with the document for the test sweep.
 */
function finishDocument(id, ctx, W, H, pieces, assets, bg, durationMs, label, constraints, debug) {
    // A version with media controls (media-controls.ts) renders the one it wraps carrying them; nothing else does.
    const controls = (0, media_controls_1.mediaControlsFor)(ctx, id);
    if (controls)
        ({ id, pieces, constraints } = (0, media_controls_1.applyMediaControls)(controls, W, H, pieces, assets, constraints));
    const placed = (0, template_utils_1.placeInsetPieces)({ rootW: W, rootH: H, pieces });
    const doc = {
        kind: "mosaic_document",
        version: 1,
        m0: (0, dsl_stdlib_1.toM0String)(placed.m0, id),
        assets,
        size: { width: W, height: H },
        fps: ctx.target.fps,
        durationMs,
        backgroundColor: bg,
        sources: placed.sources,
        editor: { label },
    };
    return (0, layout_1.withLayoutIntent)(doc, ctx, { templateId: id, constraints, debug });
}
/**
 * The chrome's pieces: the logo (bound to the media prop, the drop target)
 * or the wordmark (bound to the brand name AND the logo prop so it is the
 * drop target), and the progress line in the accent.
 */
function chromePieces(piece, C, P, logo, totalSec, keys = { brandName: "brandName", brandLogo: "brandLogo" }, withBar = true) {
    if (C.logo && logo.id) {
        piece(C.logo, 1, (0, template_utils_1.bindProp)(mediaSource(logo.id, logo.kind, "logo", { hAlign: "left" }), keys.brandLogo, 0));
    }
    else {
        piece(C.wordmark.rect, 1, (0, template_utils_1.bindProps)(textSource(C.wordmark.fit, P.ink, "wordmark", undefined, "left"), [{ propKey: keys.brandName }, { propKey: keys.brandLogo, index: 0 }]));
    }
    if (withBar)
        piece(C.bar, 1, (0, template_utils_1.bindProp)(progressSource(P.accent, totalSec), "accent"));
}
/** The logo asset from a media ref: id, kind and the manifest entry. */
function logoAsset(ctx, ref, assets) {
    if (!ref)
        return { kind: "image" };
    const id = fileAssetId(ref, "brand-logo");
    const kind = mediaKindOf(ctx, String(id), ref);
    assets[id] = { kind: "file", path: ref, mediaType: kind };
    return { id, kind };
}
/** An image asset from a media ref, refusing a probed video. */
function imageAsset(id, ctx, ref, fixed, assets, name) {
    var _a, _b;
    const assetId = fileAssetId(ref, fixed);
    // A slot with media controls takes a clip as well (media-controls.ts plays it); every other render refuses one.
    if ((_a = (0, media_controls_1.mediaControlsFor)(ctx, id)) === null || _a === void 0 ? void 0 : _a.slots.some((s) => s.key === name)) {
        assets[assetId] = { kind: "file", path: ref, mediaType: mediaKindOf(ctx, String(assetId), ref) };
        return assetId;
    }
    assets[assetId] = { kind: "file", path: ref, mediaType: "image" };
    const known = (_b = ctx.media) === null || _b === void 0 ? void 0 : _b[assetId];
    if (known && known.kind !== "image")
        throw new Error(`${id}: ${name} must be an image (got ${known.kind}).`);
    return assetId;
}
/** An inline SVG as a data-uri image asset. */
function svgAsset(svg, fixed, displayName, assets) {
    const assetId = (0, types_1.asAssetId)(fixed);
    assets[assetId] = { kind: "data-uri", uri: `data:image/svg+xml,${encodeURIComponent(svg)}`, mediaType: "image", displayName };
    return assetId;
}
/** Beats as shares of the clip, with ramps that shorten on a short clip. */
function shareBeats(totalSec, shares) {
    const D = round3(totalSec);
    const sum = shares.reduce((a, b) => a + b, 0);
    const cuts = [];
    let acc = 0;
    for (let i = 0; i < shares.length - 1; i++) {
        acc += shares[i] / sum;
        cuts.push(round3(acc * D));
    }
    return {
        total: D,
        cuts,
        fade: round3(Math.min(0.3, 0.04 * D)),
        rise: round3(Math.min(0.45, 0.06 * D)),
        stagger: round3(Math.min(0.4, 0.045 * D)),
    };
}
/** Motion helpers bound to a beat table. */
function motion(T) {
    const leave = (endSec) => (0, template_utils_1.exit)({ kind: "fade", durationMs: T.fade * 1000, atSec: round3(Math.max(0, endSec - T.fade)) });
    const arrive = (startSec, step, endSec, kind = "rise") => {
        const enter = (0, template_utils_1.entrance)({ kind, durationMs: T.rise * 1000, atSec: round3(startSec + step * T.stagger), ease: "easeOut" });
        return endSec === undefined ? enter : (0, template_utils_1.composeMotion)(enter, leave(endSec));
    };
    return { leave, arrive };
}
/** A price as drawn: a currency symbol, thousands separators, no cents when whole. */
function formatPrice(n, currency = "$") {
    const whole = Number.isInteger(n);
    const s = whole ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency}${s}`;
}
