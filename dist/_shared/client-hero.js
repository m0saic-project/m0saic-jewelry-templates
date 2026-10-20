"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_HERO_SHARES = void 0;
exports.layoutClientHero = layoutClientHero;
exports.clientHeroContract = clientHeroContract;
exports.clientHeroPieces = clientHeroPieces;
const template_utils_1 = require("@m0saic/template-utils");
const text_1 = require("./text");
const jewel_1 = require("./jewel");
function layoutClientHero(copy, W, H) {
    var _a, _b, _c, _d, _e, _f, _g;
    const S = Math.min(W, H);
    const stacked = W / H < 0.9;
    const clamp = (0, jewel_1.clampTo)(W, H);
    const chrome = (0, jewel_1.chromeLayout)(W, H, copy.brandName, copy.hasLogo);
    const { margin, top: cy0, bottom: cy1 } = chrome;
    const gap = Math.round(0.02 * S);
    const availH = Math.max(1, cy1 - cy0);
    const fullW = W - 2 * margin;
    const blk = (fit, r) => (fit && r ? (0, jewel_1.at)(fit, r) : null);
    // Beat 1: the greeting, centred on the whole content area.
    const helloFit = (0, text_1.fitText)(copy.hello, (0, text_1.budget)(fullW), availH * 0.5, Math.round(0.1 * S), 12, 2, "bold");
    const subFit = copy.sub ? (0, text_1.fitText)(copy.sub, (0, text_1.budget)(Math.round(fullW * 0.86)), availH * 0.25, Math.round(0.04 * S), 9, 2, "regular") : null;
    const helloRects = (0, jewel_1.stackColumn)(W, H, margin, fullW, cy0, cy1, [helloFit.h, (_a = subFit === null || subFit === void 0 ? void 0 : subFit.h) !== null && _a !== void 0 ? _a : 0], gap);
    // The card and the copy column.
    let card;
    let colX;
    let colW;
    let colY0;
    let colY1;
    if (stacked) {
        const side = Math.round(Math.min(0.66 * W, 0.42 * availH));
        card = clamp({ x: (W - side) / 2, y: cy0, w: side, h: side });
        colX = margin;
        colW = fullW;
        colY0 = card.y + card.h + gap * 3;
        colY1 = cy1;
    }
    else {
        const side = Math.round(Math.min(availH, 0.4 * W));
        card = clamp({ x: margin, y: cy0 + (availH - side) / 2, w: side, h: side });
        colX = card.x + card.w + gap * 3;
        colW = W - margin - colX;
        colY0 = cy0;
        colY1 = cy1;
    }
    const inset = Math.round(0.09 * card.w);
    const art = clamp({ x: card.x + inset, y: card.y + inset, w: card.w - 2 * inset, h: card.h - 2 * inset });
    const colH = Math.max(1, colY1 - colY0);
    const b = (0, text_1.budget)(colW);
    const anchor = stacked ? "top" : "center";
    // Beat 2: the piece.
    const kickerFit = copy.kicker ? (0, text_1.fitText)(copy.kicker.toUpperCase(), b, colH * 0.1, Math.round(0.028 * S), 8, 1, "bold") : null;
    const titleFit = (0, text_1.fitText)(copy.title, b, colH * 0.36, Math.round(0.068 * S), 12, 2, "bold");
    const bodyFit = copy.body ? (0, text_1.fitText)(copy.body, (0, text_1.budget)(Math.round(colW * 0.92)), colH * 0.34, Math.round(0.034 * S), 9, 3, "regular") : null;
    const pickRects = (0, jewel_1.stackColumn)(W, H, colX, colW, colY0, colY1, [(_b = kickerFit === null || kickerFit === void 0 ? void 0 : kickerFit.h) !== null && _b !== void 0 ? _b : 0, titleFit.h, (_c = bodyFit === null || bodyFit === void 0 ? void 0 : bodyFit.h) !== null && _c !== void 0 ? _c : 0], gap, anchor);
    // Beat 3: the offer.
    const offerFit = copy.offer ? (0, text_1.fitText)(copy.offer, b, colH * 0.3, Math.round(0.064 * S), 12, 2, "bold") : null;
    const codeFit = copy.code ? (0, text_1.fitText)(copy.code.toUpperCase(), (0, text_1.budget)(Math.round(colW * 0.8)), colH * 0.14, Math.round(0.044 * S), 10, 1, "bold") : null;
    const pillH = codeFit ? codeFit.h + Math.round(codeFit.px * 0.5) : 0;
    const expiryFit = copy.expiry ? (0, text_1.fitText)(copy.expiry, (0, text_1.budget)(Math.round(colW * 0.92)), colH * 0.14, Math.round(0.028 * S), 8, 2, "regular") : null;
    const ctaFit = copy.cta ? (0, text_1.fitText)(copy.cta, b, colH * 0.12, Math.round(0.034 * S), 9, 1, "bold") : null;
    const urlFit = copy.url ? (0, text_1.fitText)(copy.url, b, colH * 0.1, Math.round(0.028 * S), 8, 1, "regular") : null;
    const offerRects = (0, jewel_1.stackColumn)(W, H, colX, colW, colY0, colY1, [(_d = offerFit === null || offerFit === void 0 ? void 0 : offerFit.h) !== null && _d !== void 0 ? _d : 0, pillH, (_e = expiryFit === null || expiryFit === void 0 ? void 0 : expiryFit.h) !== null && _e !== void 0 ? _e : 0, (_f = ctaFit === null || ctaFit === void 0 ? void 0 : ctaFit.h) !== null && _f !== void 0 ? _f : 0, (_g = urlFit === null || urlFit === void 0 ? void 0 : urlFit.h) !== null && _g !== void 0 ? _g : 0], gap, anchor);
    let pill = null;
    if (codeFit && offerRects[1]) {
        const row = offerRects[1];
        const padX = Math.round(codeFit.px * 0.9);
        const w = Math.min(colW, Math.ceil(codeFit.width / 0.94) + 2 * padX);
        pill = clamp({ x: colX + (colW - w) / 2, y: row.y, w, h: row.h });
    }
    return {
        W,
        H,
        stacked,
        chrome,
        hello: (0, jewel_1.at)(helloFit, helloRects[0]),
        sub: blk(subFit, helloRects[1]),
        card,
        art,
        kicker: blk(kickerFit, pickRects[0]),
        title: (0, jewel_1.at)(titleFit, pickRects[1]),
        body: blk(bodyFit, pickRects[2]),
        offer: blk(offerFit, offerRects[0]),
        pill,
        code: codeFit,
        expiry: blk(expiryFit, offerRects[2]),
        cta: blk(ctaFit, offerRects[3]),
        url: blk(urlFit, offerRects[4]),
    };
}
function clientHeroContract(L) {
    return [
        ...(0, jewel_1.chromeContract)(L.chrome),
        ...(0, jewel_1.fitsContract)([
            ["hello", L.hello],
            ["sub", L.sub],
            ["kicker", L.kicker],
            ["title", L.title],
            ["body", L.body],
            ["offer", L.offer],
            ["code", L.code],
            ["expiry", L.expiry],
            ["cta", L.cta],
            ["cta-url", L.url],
        ]),
        { label: "card", aspect: 1 },
    ];
}
/** The three-beat share table every client hero uses: 22% hello, 36% the piece, 42% the offer. */
exports.CLIENT_HERO_SHARES = [22, 36, 42];
const keys = (ks) => ks.map((propKey) => ({ propKey }));
/**
 * Push every content piece (the chrome is the caller's). Beat one leaves
 * before the card arrives; the card holds; beat two's copy makes way for
 * the offer; the offer holds to the last frame.
 */
function clientHeroPieces(piece, L, P, T, imageId, bind) {
    const [cut1, cut2] = T.cuts;
    const { arrive, leave } = (0, jewel_1.motion)(T);
    const out1 = leave(cut1);
    piece(L.hello.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.hello.fit, P.ink, "hello", out1), keys(bind.hello)));
    if (L.sub)
        piece(L.sub.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.sub.fit, P.dim, "sub", out1), keys(bind.sub)));
    piece(L.card, 2, (0, template_utils_1.bindProp)((0, jewel_1.tileSource)(P.card, "card", { radius: 0.1, overlay: arrive(cut1, 0, undefined, "fade") }), bind.accent));
    piece(L.art, 3, (0, template_utils_1.bindProp)((0, jewel_1.mediaSource)(imageId, "image", "art", { overlay: arrive(cut1, 1) }), bind.image, 0));
    if (L.kicker)
        piece(L.kicker.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.kicker.fit, P.accent, "kicker", arrive(cut1, 1, cut2)), keys(bind.kicker)));
    piece(L.title.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.title.fit, P.ink, "title", arrive(cut1, 2, cut2)), keys(bind.title)));
    if (L.body)
        piece(L.body.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.body.fit, P.dim, "body", arrive(cut1, 3, cut2)), keys(bind.body)));
    if (L.offer)
        piece(L.offer.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.offer.fit, P.accent, "offer", arrive(cut2, 0)), keys(bind.offer)));
    if (L.pill && L.code) {
        const pillIn = arrive(cut2, 1, undefined, "fade");
        piece(L.pill, 2, (0, jewel_1.tileSource)(P.accent, "code-pill", { pill: true, overlay: pillIn }));
        piece(L.pill, 3, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.code, P.onAccent, "code", pillIn), keys(bind.code)));
    }
    if (L.expiry)
        piece(L.expiry.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.expiry.fit, P.dim, "expiry", arrive(cut2, 2)), keys(bind.expiry)));
    if (L.cta)
        piece(L.cta.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.cta.fit, P.ink, "cta", arrive(cut2, 3)), keys(bind.cta)));
    if (L.url)
        piece(L.url.rect, 2, (0, template_utils_1.bindProps)((0, jewel_1.textSource)(L.url.fit, P.dim, "cta-url", arrive(cut2, 3)), keys(bind.url)));
}
