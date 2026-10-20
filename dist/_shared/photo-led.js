"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroAsset = heroAsset;
exports.layoutPhotoLed = layoutPhotoLed;
exports.photoLedContract = photoLedContract;
exports.heroMediaSource = heroMediaSource;
exports.heroPieces = heroPieces;
exports.blockPieces = blockPieces;
exports.layoutPhotoCards = layoutPhotoCards;
exports.photoCardsContract = photoCardsContract;
exports.cardPieces = cardPieces;
exports.photoLedDocument = photoLedDocument;
const template_utils_1 = require("@m0saic/template-utils");
const text_1 = require("./text");
const legible_1 = require("./legible");
const jewel_1 = require("./jewel");
const ROLES = {
    kicker: { scale: 0.03, lines: 1, face: "bold", min: 8, tone: "accent" },
    numeral: { scale: 0.3, lines: 1, face: "bold", min: 24, tone: "accent" },
    title: { scale: 0.08, lines: 3, face: "bold", min: 12, tone: "ink" },
    subtitle: { scale: 0.046, lines: 2, face: "bold", min: 10, tone: "ink" },
    body: { scale: 0.034, lines: 3, face: "regular", min: 9, tone: "dim" },
    italic: { scale: 0.05, lines: 5, face: "italic", min: 10, tone: "ink" },
    aside: { scale: 0.032, lines: 2, face: "italic", min: 9, tone: "dim" },
    price: { scale: 0.056, lines: 1, face: "bold", min: 10, tone: "accent" },
    cta: { scale: 0.036, lines: 1, face: "bold", min: 9, tone: "ink" },
    url: { scale: 0.028, lines: 1, face: "regular", min: 8, tone: "dim" },
    note: { scale: 0.026, lines: 2, face: "regular", min: 8, tone: "dim" },
};
/** Roles that open a new group get a wider gap above them. */
const LEADS = new Set(["cta", "price", "numeral"]);
/** A real photo or clip from a media ref (image OR video), registered in the manifest. */
function heroAsset(ctx, ref, fixed, assets) {
    const id = (0, jewel_1.fileAssetId)(ref, fixed);
    const mediaKind = (0, jewel_1.mediaKindOf)(ctx, String(id), ref);
    assets[id] = { kind: "file", path: ref, mediaType: mediaKind };
    return { kind: "media", id, mediaKind };
}
const live = (blocks) => blocks.filter((b) => b.art || b.text.trim().length > 0);
/** `floor` is the canvas's legibility floor (legible.ts): no role is set under it, whatever it shrinks to. */
function fitBlock(b, w, maxH, S, k, floor) {
    const r = ROLES[b.role];
    const text = b.role === "kicker" ? b.text.toUpperCase() : b.text;
    const min = Math.max(r.min, floor);
    return (0, text_1.fitText)(text, (0, text_1.budget)(w), maxH, Math.max(min, Math.round(r.scale * S * k)), min, r.lines, r.face);
}
function sizeBlocks(blocks, w, maxH, S, k, floor) {
    return live(blocks).map((b) => {
        if (b.art) {
            const h = Math.max(8, floor, Math.round(ROLES[b.role].scale * S * k * 1.25));
            return { block: b, fit: null, h, w: Math.min(w, Math.round(h * b.art.aspect)) };
        }
        const fit = fitBlock(b, w, maxH, S, k, floor);
        return { block: b, fit, h: fit.h, w };
    });
}
/**
 * What gives way when the words cannot all fit at the floor: the fine print first, the headline never. A block
 * left out is not drawn at all - a line nobody can read is worse than no line (legible.ts).
 */
const DROP_FIRST = ["note", "url", "aside", "body", "kicker", "subtitle", "cta"];
function dropOne(blocks) {
    for (const role of DROP_FIRST) {
        const i = blocks.map((b) => b.role).lastIndexOf(role);
        if (i >= 0 && !blocks[i].art && !blocks[i].keep)
            return [...blocks.slice(0, i), ...blocks.slice(i + 1)];
    }
    return null;
}
/**
 * Fit blocks into a column, shrinking every size together until the stack fits - down to the floor, and below
 * that by leaving the fine print out; then stack them.
 */
function stackBlocks(all, col, S, anchor, clamp, floor) {
    const g = Math.round(0.018 * S);
    const gapAbove = (sized, i) => (i === 0 ? 0 : sized[i].block.lead || LEADS.has(sized[i].block.role) ? 2 * g : g);
    const total = (sized) => sized.reduce((a, s, i) => a + s.h + gapAbove(sized, i), 0);
    let blocks = live(all);
    let k = 1;
    let sized = sizeBlocks(blocks, col.w, col.h * 0.6, S, k, floor);
    for (;;) {
        while (total(sized) > col.h && k > 0.45) {
            k = (0, jewel_1.round3)(k - 0.05);
            sized = sizeBlocks(blocks, col.w, col.h * 0.6, S, k, floor);
        }
        const fewer = total(sized) > col.h ? dropOne(blocks) : null;
        if (!fewer)
            break;
        blocks = fewer;
        k = 1;
        sized = sizeBlocks(blocks, col.w, col.h * 0.6, S, k, floor);
    }
    const used = total(sized);
    let y = col.y + (anchor === "top" ? 0 : anchor === "bottom" ? Math.max(0, col.h - used) : Math.max(0, (col.h - used) / 2));
    return sized.map((s, i) => {
        y += gapAbove(sized, i);
        const rect = clamp({ x: col.x, y, w: s.block.art ? s.w : col.w, h: s.h });
        y += s.h;
        return { block: s.block, fit: s.fit, rect };
    });
}
const fitted = (placed) => placed.filter((p) => p.fit).map((p) => [p.block.label, p.fit]);
const bottomOf = (placed, fallback) => (placed.length ? placed[placed.length - 1].rect.y + placed[placed.length - 1].rect.h : fallback);
/** The chrome for the words' side of a left split: computed for that side, moved over; the bar spans the canvas. */
function sideChrome(W, H, x0, brandName, hasLogo, bar) {
    const sub = (0, jewel_1.chromeLayout)(W - x0, H, brandName, hasLogo, { bar, S: Math.min(W, H), minPx: (0, legible_1.minTextPx)(W, H) });
    return {
        ...sub,
        wordmark: { ...sub.wordmark, rect: { ...sub.wordmark.rect, x: sub.wordmark.rect.x + x0 } },
        logo: sub.logo ? { ...sub.logo, x: sub.logo.x + x0 } : null,
        bar: { x: 0, y: sub.bar.y, w: W, h: sub.bar.h },
    };
}
function layoutPhotoLed(W, H, brandName, hasLogo, blocks, opts = {}) {
    var _a, _b;
    const floor = (0, legible_1.minTextPx)(W, H);
    const S = Math.min(W, H);
    const clamp = (0, jewel_1.clampTo)(W, H);
    const bar = opts.bar !== false;
    const split = W / H < 0.9 ? "top" : "left";
    // Words that do not fit at the floor first take room from the photo - down to the share the contract holds it
    // to (45% of its side) - and only then does the fine print go.
    const base = (_a = opts.share) !== null && _a !== void 0 ? _a : (split === "left" ? 0.5 : 0.6);
    const shares = [base];
    while (shares[shares.length - 1] - 0.05 >= MIN_HERO_SHARE - 1e-9)
        shares.push((0, jewel_1.round3)(shares[shares.length - 1] - 0.05));
    const wanted = live(blocks).length;
    let L = placeAt(base);
    for (const share of shares.slice(1)) {
        if (L.placed.length >= wanted)
            break;
        L = placeAt(share);
    }
    return { W, H, split, bar, align: (_b = opts.align) !== null && _b !== void 0 ? _b : "left", ...L };
    function placeAt(share) {
        let chrome;
        let hero;
        let col;
        if (split === "left") {
            const hw = Math.round(W * share);
            chrome = sideChrome(W, H, hw, brandName, hasLogo, bar);
            hero = clamp({ x: 0, y: 0, w: hw, h: bar ? chrome.bar.y : H });
            col = { x: hw + chrome.margin, y: chrome.top, w: W - hw - 2 * chrome.margin, h: chrome.bottom - chrome.top };
        }
        else {
            chrome = (0, jewel_1.chromeLayout)(W, H, brandName, hasLogo, { bar, minPx: floor });
            const y0 = chrome.top - Math.round(0.015 * S);
            const hh = Math.round(H * share);
            hero = clamp({ x: 0, y: y0, w: W, h: hh });
            const ty = hero.y + hero.h + Math.round(0.045 * S);
            col = { x: chrome.margin, y: ty, w: W - 2 * chrome.margin, h: Math.max(1, chrome.bottom - ty) };
        }
        const side = Math.round(Math.min(hero.w, hero.h) * 0.62);
        const art = clamp({ x: hero.x + (hero.w - side) / 2, y: hero.y + (hero.h - side) / 2, w: side, h: side });
        const { placed, reserved } = placeWords(col);
        return { chrome, hero, art, placed, reserved };
    }
    function placeWords(col) {
        let placed;
        let reserved = null;
        if (opts.reserve) {
            const g = Math.round(0.03 * S);
            const before = blocks.slice(0, opts.reserve.at);
            const after = blocks.slice(opts.reserve.at);
            // The reserved area is what the template is about (a grid of grades): it gets its share first, and the groups
            // share the rest by their need - setting their fine print aside, at the floor, where it does not fit.
            const need = (bs) => bottomOf(stackBlocks(bs, { x: col.x, y: 0, w: col.w, h: 100000 }, S, "top", (r) => r, floor), 0);
            const hb = need(before);
            const ha = need(after);
            const keep = Math.round(col.h * opts.reserve.share);
            const rest = Math.max(2, col.h - keep - 2 * g);
            const roomB = hb + ha > 0 ? Math.max(1, Math.round((rest * hb) / (hb + ha))) : 1;
            const roomA = Math.max(1, rest - roomB);
            const top = stackBlocks(before, { ...col, h: roomB }, S, "top", clamp, floor);
            const bottom = stackBlocks(after, { ...col, y: col.y + col.h - roomA, h: roomA }, S, "bottom", clamp, floor);
            const y0 = bottomOf(top, col.y - g) + g;
            const y1 = (bottom.length ? bottom[0].rect.y : col.y + col.h + g) - g;
            reserved = clamp({ x: col.x, y: y0, w: col.w, h: Math.max(1, y1 - y0) });
            placed = [...top, ...bottom];
        }
        else {
            placed = stackBlocks(blocks, col, S, "center", clamp, floor);
        }
        return { placed, reserved };
    }
}
/** The least of its side a photo keeps (photoLedContract's hero rule). */
const MIN_HERO_SHARE = 0.45;
function photoLedContract(L) {
    return [
        ...(0, jewel_1.chromeContract)(L.chrome, L.bar),
        ...(0, jewel_1.fitsContract)(fitted(L.placed)),
        // The rule the ratings wrote: the photo takes its whole side.
        { label: "hero", minWidthFrac: L.split === "top" ? 0.98 : 0.45, minHeightFrac: L.split === "top" ? 0.45 : 0.9 },
    ];
}
/* ── pieces ── */
/** A role's colour; accent words fall back to the ink when the accent is too close to the page to read. */
function toneColor(role, P) {
    const tone = ROLES[role].tone;
    if (tone === "accent")
        return Math.abs((0, jewel_1.luminance)(P.accent) - (0, jewel_1.luminance)(P.bg)) < 0.22 ? P.ink : P.accent;
    return tone === "dim" ? P.dim : P.ink;
}
/** The photo or clip: cover-cropped; a clip loops, muted. A still holds still (see the header: no push-in). */
function heroMediaSource(hero, label) {
    return (0, template_utils_1.tag)({
        type: "media",
        mediaType: hero.mediaKind,
        assetId: hero.id,
        placement: { fit: "cover" },
        ...(hero.mediaKind === "video" ? { playback: { loopMode: "loop" }, audio: { enabled: false } } : {}),
        editor: { owner: "template" },
    }, label);
}
function imageSource(id, label, hAlign) {
    return (0, template_utils_1.tag)({
        type: "media",
        mediaType: "image",
        assetId: id,
        placement: { fit: "contain", vAlign: "middle", ...(hAlign ? { hAlign } : {}) },
        editor: { owner: "template" },
    }, label);
}
/** The hero at its rect: the photo, or the art on a panel. Both answer to `heroKey` (the drop target). */
function heroPieces(piece, rect, art, hero, P, label, heroKey) {
    if (hero.kind === "media") {
        piece(rect, 2, (0, template_utils_1.bindProps)(heroMediaSource(hero, label), [{ propKey: heroKey, index: 0 }]));
    }
    else {
        piece(rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.tileSource)(P.card, label), [{ propKey: heroKey, index: 0 }]));
        piece(art, 3, (0, template_utils_1.bindProps)(imageSource(hero.id, `${label}-art`), [{ propKey: heroKey, index: 0 }]));
    }
}
/** How long the photo holds alone, and how long the words take to all arrive after it, at most (seconds). */
const WORDS_LEAD_SEC = 0.5;
const WORDS_IN_SEC = 1.2;
/**
 * The words: each block in its role's tone, arriving after the photo has had a short first beat (none on a print).
 * Founder, 2026-10-17, on a price drop: "takes too long to animate - the first few seconds are photo and no text".
 * The photo holds alone at most WORDS_LEAD_SEC, and every block is in within WORDS_IN_SEC after that.
 */
function blockPieces(piece, placed, P, T, align) {
    var _a;
    const late = placed.filter((p) => p.block.beat !== 0).length;
    const B = T ? { ...T, stagger: Math.min(T.stagger, late > 1 ? WORDS_IN_SEC / (late - 1) : T.stagger) } : null;
    const m = B ? (0, jewel_1.motion)(B) : null;
    const cut = T ? Math.min((_a = T.cuts[0]) !== null && _a !== void 0 ? _a : 0, WORDS_LEAD_SEC) : 0;
    let step = 0;
    for (const p of placed) {
        const overlay = m ? (p.block.beat === 0 ? m.arrive(0, 0) : m.arrive(cut, step++)) : undefined;
        if (p.block.art || !p.fit) {
            const src = imageSource(p.block.art.id, p.block.label, align);
            piece(p.rect, 2, (0, template_utils_1.bindProps)(overlay ? { ...src, overlay } : src, p.block.bind));
        }
        else {
            piece(p.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(p.fit, toneColor(p.block.role, P), p.block.label, overlay, align), p.block.bind));
        }
    }
}
const artIn = (photo, clamp, f = 0.66) => {
    const a = Math.round(Math.min(photo.w, photo.h) * f);
    return clamp({ x: photo.x + (photo.w - a) / 2, y: photo.y + (photo.h - a) / 2, w: a, h: a });
};
function layoutPhotoCards(W, H, brandName, hasLogo, head, cards, foot, opts = {}) {
    const floor = (0, legible_1.minTextPx)(W, H);
    const S = Math.min(W, H);
    const clamp = (0, jewel_1.clampTo)(W, H);
    const bar = opts.bar !== false;
    const n = Math.max(1, cards.length);
    const g = Math.round(0.028 * S);
    // A wide canvas has two candidates - the SPREAD (the photos as tall columns bleeding off the left, every word on
    // the right) and COLUMNS (a row of photos, each over its words) - and takes the one that keeps more of a photo:
    // on 16:9 three tall strips keep a quarter of a 4:3 shot (round 4, the gift guide: "the crop isn't flattering"),
    // a row of near-4:3 tiles keeps nearly all of it.
    if (W / H >= 1.3) {
        const spread = spreadLayout();
        const columns = stackedLayout("columns");
        return keptOf(columns) >= keptOf(spread) ? columns : spread;
    }
    return stackedLayout(W / H < 0.9 && n >= 3 ? "rows" : "columns");
    function spreadLayout() {
        const pw = Math.round(W * (n >= 3 ? 0.6 : 0.56));
        const chrome = sideChrome(W, H, pw, brandName, hasLogo, bar);
        const gap = Math.max(2, Math.round(0.008 * W));
        const colW = Math.floor((pw - (n - 1) * gap) / n);
        const photoH = bar ? chrome.bar.y : H;
        const out = [];
        const col = { x: pw + chrome.margin, y: chrome.top, w: W - pw - 2 * chrome.margin, h: chrome.bottom - chrome.top };
        // One stack on the right: head, each card's words as a group, foot - so they shrink together.
        const groups = [
            ...head,
            ...cards.flatMap((c) => live(c.blocks).map((b, j) => (j === 0 ? { ...b, lead: true } : b))),
            ...foot.map((b, j) => (j === 0 ? { ...b, lead: true } : b)),
        ];
        const placedAll = stackBlocks(groups, col, S, "center", clamp, floor);
        const byLabel = new Map(placedAll.map((p) => [p.block.label, p]));
        cards.forEach((c, i) => {
            const photo = clamp({ x: i * (colW + gap), y: 0, w: i === n - 1 ? pw - i * (colW + gap) : colW, h: photoH });
            out.push({ key: c.key, photo, art: artIn(photo, clamp, 0.8), placed: live(c.blocks).map((b) => byLabel.get(b.label)).filter(Boolean) });
        });
        const headPlaced = live(head).map((b) => byLabel.get(b.label)).filter(Boolean);
        const footPlaced = live(foot).map((b) => byLabel.get(b.label)).filter(Boolean);
        return { W, H, chrome, bar, head: headPlaced, foot: footPlaced, cards: out, arrangement: "spread" };
    }
    function stackedLayout(arrangement) {
        const chrome = (0, jewel_1.chromeLayout)(W, H, brandName, hasLogo, { bar, minPx: floor });
        const m = chrome.margin;
        const full = { x: m, y: chrome.top, w: W - 2 * m, h: chrome.bottom - chrome.top };
        // The head hangs from the top, the foot sits on the bottom; each takes what it needs, capped.
        const headPlaced = stackBlocks(head, { ...full, h: Math.round(full.h * 0.3) }, S, "top", clamp, floor);
        const headBottom = headPlaced.length ? bottomOf(headPlaced, full.y) + g : full.y;
        const footProbe = stackBlocks(foot, { ...full, h: Math.round(full.h * 0.22) }, S, "top", clamp, floor);
        const footH = footProbe.length ? bottomOf(footProbe, full.y) - full.y : 0;
        const footPlaced = stackBlocks(foot, { ...full, y: full.y + full.h - footH, h: footH }, S, "top", clamp, floor);
        const region = { x: full.x, y: headBottom, w: full.w, h: Math.max(1, full.y + full.h - footH - (footH ? g : 0) - headBottom) };
        const out = [];
        if (arrangement === "columns") {
            const colW = Math.floor((region.w - (n - 1) * g) / n);
            // Captions first (the tallest sets the row), then the photos take the rest.
            let k = 1;
            let caps = cards.map((c) => stackBlocks(c.blocks, { x: 0, y: 0, w: colW, h: region.h }, S * k, "top", (r) => r, floor));
            const capH = (cs) => Math.max(0, ...cs.map((p) => bottomOf(p, 0)));
            while (region.h - capH(caps) - g < colW * 0.55 && k > 0.6) {
                k = (0, jewel_1.round3)(k - 0.05);
                caps = cards.map((c) => stackBlocks(c.blocks, { x: 0, y: 0, w: colW, h: region.h }, S * k, "top", (r) => r, floor));
            }
            // At most 5:4 tall on a square canvas; a tall one lets the photos run on to 9:5 rather than leave a band empty.
            const photoH = Math.max(1, Math.min(Math.round(colW * (W / H < 0.9 ? 1.8 : 1.25)), region.h - capH(caps) - g));
            const top = region.y + Math.max(0, Math.round((region.h - photoH - g - capH(caps)) / 2));
            cards.forEach((c, i) => {
                const x = region.x + i * (colW + g);
                const photo = clamp({ x, y: top, w: colW, h: photoH });
                const placed = caps[i].map((p) => ({ ...p, rect: clamp({ ...p.rect, x: x + p.rect.x, y: top + photoH + g + p.rect.y }) }));
                out.push({ key: c.key, photo, art: artIn(photo, clamp), placed });
            });
        }
        else {
            const rowH = Math.floor((region.h - (n - 1) * g) / n);
            const side = Math.min(rowH, Math.round(region.w * 0.46));
            cards.forEach((c, i) => {
                const y = region.y + i * (rowH + g);
                const photo = clamp({ x: region.x, y, w: side, h: rowH });
                const tx = region.x + side + g;
                const placed = stackBlocks(c.blocks, { x: tx, y, w: region.x + region.w - tx, h: rowH }, S, "center", clamp, floor);
                out.push({ key: c.key, photo, art: artIn(photo, clamp), placed });
            });
        }
        return { W, H, chrome, bar, head: headPlaced, foot: footPlaced, cards: out, arrangement };
    }
}
/** How much of a typical 4:3 shot a cover-cropped photo rect keeps, averaged over the cards. */
function keptOf(L) {
    const kept = L.cards.map((c) => {
        const a = c.photo.w / Math.max(1, c.photo.h);
        return Math.min(a / (4 / 3), 4 / 3 / a);
    });
    return kept.reduce((x, y) => x + y, 0) / Math.max(1, kept.length);
}
function photoCardsContract(L) {
    const all = [...L.head, ...L.foot, ...L.cards.flatMap((c) => c.placed)];
    const small = Math.min(L.W, L.H) < 600;
    return [
        ...(0, jewel_1.chromeContract)(L.chrome, L.bar),
        ...(0, jewel_1.fitsContract)(fitted(all)),
        // Text has floor sizes that do not shrink with a thumbnail canvas: below 600 px the photos keep a smaller share.
        ...L.cards.map((c) => L.arrangement === "spread"
            ? { label: `${c.key}-photo`, minWidthFrac: L.cards.length >= 3 ? 0.17 : 0.24, minHeightFrac: 0.9 }
            : { label: `${c.key}-photo`, minWidthFrac: 0.2, minHeightFrac: small ? 0.08 : 0.18 }),
    ];
}
/** Every card's photo and words, staggered card by card after the head. */
function cardPieces(piece, L, cards, P, T) {
    var _a;
    const m = T ? (0, jewel_1.motion)(T) : null;
    const cut = T ? ((_a = T.cuts[0]) !== null && _a !== void 0 ? _a : 0) : 0;
    L.cards.forEach((c, i) => {
        const card = cards.find((x) => x.key === c.key);
        const enter = m ? m.arrive(0, i, undefined, "fade") : undefined;
        if (card.hero.kind === "media") {
            const src = heroMediaSource(card.hero, `${c.key}-photo`);
            piece(c.photo, 2, (0, template_utils_1.bindProps)(enter ? { ...src, overlay: enter } : src, [{ propKey: card.heroKey, index: 0 }]));
        }
        else {
            const tile = (0, jewel_1.tileSource)(P.card, `${c.key}-photo`, enter ? { overlay: enter } : {});
            piece(c.photo, 2, (0, template_utils_1.bindProps)(tile, [{ propKey: card.heroKey, index: 0 }]));
            const art = imageSource(card.hero.id, `${c.key}-art`);
            piece(c.art, 3, (0, template_utils_1.bindProps)(enter ? { ...art, overlay: enter } : art, [{ propKey: card.heroKey, index: 0 }]));
        }
        c.placed.forEach((p, j) => {
            if (!p.fit)
                return;
            piece(p.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(p.fit, toneColor(p.block.role, P), p.block.label, m ? m.arrive(cut, i + j * 0.5) : undefined, "left"), p.block.bind));
        });
    });
}
function photoLedDocument(a) {
    var _a;
    const assets = {};
    const logo = (0, jewel_1.logoAsset)(a.ctx, a.logoRef, assets);
    const hero = a.heroRef ? heroAsset(a.ctx, a.heroRef, a.heroFixed, assets) : { kind: "art", id: (0, jewel_1.svgAsset)(a.art.svg, a.art.key, a.art.name, assets) };
    const share = Math.round(((_a = a.photoShare) !== null && _a !== void 0 ? _a : 0.25) * 100);
    const T = (0, jewel_1.shareBeats)(a.durationMs / 1000, [share, 100 - share]);
    const W = Math.max(1, Math.round(a.ctx.target.width));
    const H = Math.max(1, Math.round(a.ctx.target.height));
    const L = layoutPhotoLed(W, H, a.brandName, a.logoRef.length > 0, a.blocks, a.options);
    const { pieces, piece } = (0, jewel_1.pieceList)();
    (0, jewel_1.chromePieces)(piece, L.chrome, a.P, logo, T.total);
    heroPieces(piece, L.hero, L.art, hero, a.P, "hero", a.heroKey);
    blockPieces(piece, L.placed, a.P, T, L.align);
    return (0, jewel_1.finishDocument)(a.id, a.ctx, W, H, pieces, assets, a.P.bg, a.durationMs, a.label, photoLedContract(L), a.debug);
}
