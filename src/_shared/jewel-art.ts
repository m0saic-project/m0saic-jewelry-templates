import { JEWEL_METAL_COLORS, JEWEL_STONE_COLORS, type JewelMetal, type JewelStone } from "./jewel";

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

export const ART_KINDS = ["solitaire", "band", "pendant", "studs", "hoops", "tennis", "diamond", "watch", "ringbox"] as const;
export type ArtKind = (typeof ART_KINDS)[number];

export type ArtTone = {
  metal: { base: string; light: string; dark: string };
  stone: { base: string; light: string; dark: string };
  /** The shadow and hairline colour - the template's ink. */
  ink: string;
  /** The ring-box lining and the velvet - the template's accent. */
  accent: string;
};

export function artTone(metal: JewelMetal, stone: JewelStone, ink: string, accent: string): ArtTone {
  return { metal: JEWEL_METAL_COLORS[metal], stone: JEWEL_STONE_COLORS[stone], ink, accent };
}

export const ART_VIEWBOX = { width: 400, height: 400 } as const;

const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_VIEWBOX.width} ${ART_VIEWBOX.height}" width="${ART_VIEWBOX.width}" height="${ART_VIEWBOX.height}">`;
const close = `</svg>`;

const shadow = (ink: string, cx = 200, cy = 352, rx = 120, ry = 12) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${ink}" opacity="0.12"/>`;

/** A round brilliant seen from above: the table, eight crown facets, a girdle, and a sparkle. */
function brilliant(cx: number, cy: number, r: number, s: ArtTone["stone"]): string {
  const pts = (n: number, rad: number, rot = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / n;
      return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  const outer = pts(8, r, -Math.PI / 8);
  const table = pts(8, r * 0.5, -Math.PI / 8);
  let facets = "";
  for (let i = 0; i < 8; i++) {
    const a0 = -Math.PI / 8 + (i * 2 * Math.PI) / 8;
    const a1 = a0 + (2 * Math.PI) / 8;
    const o0 = `${(cx + r * Math.cos(a0)).toFixed(1)},${(cy + r * Math.sin(a0)).toFixed(1)}`;
    const o1 = `${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)}`;
    const t0 = `${(cx + r * 0.5 * Math.cos(a0)).toFixed(1)},${(cy + r * 0.5 * Math.sin(a0)).toFixed(1)}`;
    const t1 = `${(cx + r * 0.5 * Math.cos(a1)).toFixed(1)},${(cy + r * 0.5 * Math.sin(a1)).toFixed(1)}`;
    const fill = i % 2 === 0 ? s.base : s.light;
    facets += `<polygon points="${o0} ${o1} ${t1} ${t0}" fill="${fill}" stroke="${s.dark}" stroke-width="1" stroke-opacity="0.5"/>`;
  }
  return (
    `<polygon points="${outer}" fill="${s.dark}"/>` +
    facets +
    `<polygon points="${table}" fill="${s.light}" stroke="${s.dark}" stroke-width="1" stroke-opacity="0.5"/>` +
    `<circle cx="${(cx - r * 0.2).toFixed(1)}" cy="${(cy - r * 0.22).toFixed(1)}" r="${(r * 0.09).toFixed(1)}" fill="#ffffff" opacity="0.95"/>`
  );
}

/** A small round stone in a bezel, for tennis bracelets and halos. */
function smallStone(cx: number, cy: number, r: number, s: ArtTone["stone"], m: ArtTone["metal"]): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="${m.dark}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.base}"/><circle cx="${(cx - r * 0.3).toFixed(1)}" cy="${(cy - r * 0.3).toFixed(1)}" r="${(r * 0.35).toFixed(1)}" fill="${s.light}"/>`;
}

function solitaireSvg(t: ArtTone): string {
  const m = t.metal;
  return (
    open +
    shadow(t.ink) +
    // the band, seen in perspective
    `<ellipse cx="200" cy="236" rx="110" ry="104" fill="none" stroke="${m.base}" stroke-width="26"/>` +
    `<ellipse cx="200" cy="236" rx="110" ry="104" fill="none" stroke="${m.light}" stroke-width="8" stroke-dasharray="120 420" stroke-dashoffset="-70"/>` +
    `<ellipse cx="200" cy="236" rx="110" ry="104" fill="none" stroke="${m.dark}" stroke-width="5" stroke-dasharray="160 700" stroke-dashoffset="-300" opacity="0.6"/>` +
    // the head: four prongs
    `<rect x="166" y="112" width="14" height="40" rx="6" fill="${m.dark}"/>` +
    `<rect x="220" y="112" width="14" height="40" rx="6" fill="${m.dark}"/>` +
    `<rect x="186" y="96" width="28" height="52" rx="8" fill="${m.base}"/>` +
    brilliant(200, 118, 58, t.stone) +
    close
  );
}

function bandSvg(t: ArtTone): string {
  const m = t.metal;
  return (
    open +
    shadow(t.ink, 200, 340, 130, 12) +
    `<ellipse cx="200" cy="200" rx="128" ry="120" fill="none" stroke="${m.dark}" stroke-width="44"/>` +
    `<ellipse cx="200" cy="196" rx="128" ry="120" fill="none" stroke="${m.base}" stroke-width="40"/>` +
    `<ellipse cx="200" cy="196" rx="128" ry="120" fill="none" stroke="${m.light}" stroke-width="12" stroke-dasharray="150 600" stroke-dashoffset="-60"/>` +
    `<ellipse cx="200" cy="196" rx="128" ry="120" fill="none" stroke="${m.dark}" stroke-width="6" stroke-dasharray="190 800" stroke-dashoffset="-330" opacity="0.5"/>` +
    close
  );
}

function pendantSvg(t: ArtTone): string {
  const m = t.metal;
  return (
    open +
    // the chain: two strands from the top corners to the bail
    `<path d="M60 0 Q150 150 200 206" fill="none" stroke="${m.base}" stroke-width="5" stroke-dasharray="6 5"/>` +
    `<path d="M340 0 Q250 150 200 206" fill="none" stroke="${m.base}" stroke-width="5" stroke-dasharray="6 5"/>` +
    `<path d="M60 0 Q150 150 200 206" fill="none" stroke="${m.light}" stroke-width="2" stroke-dasharray="6 5"/>` +
    `<path d="M340 0 Q250 150 200 206" fill="none" stroke="${m.light}" stroke-width="2" stroke-dasharray="6 5"/>` +
    // the bail
    `<rect x="188" y="196" width="24" height="30" rx="10" fill="none" stroke="${m.base}" stroke-width="8"/>` +
    // the bezel and the stone
    `<circle cx="200" cy="286" r="68" fill="${m.dark}"/>` +
    `<circle cx="200" cy="286" r="62" fill="${m.base}"/>` +
    brilliant(200, 286, 52, t.stone) +
    close
  );
}

function studsSvg(t: ArtTone): string {
  const m = t.metal;
  // Seen slightly from above: the stone in a four-prong basket, a short post and its back.
  const stud = (cx: number) =>
    `<rect x="${cx - 3}" y="236" width="6" height="44" rx="3" fill="${m.base}"/>` +
    `<rect x="${cx - 14}" y="262" width="28" height="12" rx="6" fill="${m.dark}"/>` +
    `<path d="M${cx - 44} 206 L${cx - 30} 240 L${cx + 30} 240 L${cx + 44} 206 Z" fill="${m.base}"/>` +
    `<path d="M${cx - 44} 206 L${cx - 30} 240 L${cx + 30} 240 L${cx + 44} 206 Z" fill="${m.dark}" opacity="0.35"/>` +
    brilliant(cx, 180, 62, t.stone);
  return open + shadow(t.ink, 120, 300, 60, 8) + shadow(t.ink, 280, 300, 60, 8) + stud(120) + stud(280) + close;
}

function hoopsSvg(t: ArtTone): string {
  const m = t.metal;
  const hoop = (cx: number) =>
    `<ellipse cx="${cx}" cy="200" rx="70" ry="110" fill="none" stroke="${m.dark}" stroke-width="18"/>` +
    `<ellipse cx="${cx}" cy="198" rx="70" ry="110" fill="none" stroke="${m.base}" stroke-width="14"/>` +
    `<ellipse cx="${cx}" cy="198" rx="70" ry="110" fill="none" stroke="${m.light}" stroke-width="5" stroke-dasharray="100 500" stroke-dashoffset="-40"/>` +
    `<rect x="${cx - 7}" y="76" width="14" height="30" rx="6" fill="${m.dark}"/>`;
  return open + shadow(t.ink, 110, 330, 60, 8) + shadow(t.ink, 290, 330, 60, 8) + hoop(110) + hoop(290) + close;
}

function tennisSvg(t: ArtTone): string {
  const m = t.metal;
  let stones = "";
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    const cx = 200 + 128 * Math.cos(a);
    const cy = 200 + 118 * Math.sin(a);
    stones += smallStone(Math.round(cx), Math.round(cy), 11, t.stone, m);
  }
  return (
    open +
    shadow(t.ink, 200, 344, 136, 12) +
    `<ellipse cx="200" cy="200" rx="128" ry="118" fill="none" stroke="${m.base}" stroke-width="30"/>` +
    `<ellipse cx="200" cy="200" rx="128" ry="118" fill="none" stroke="${m.dark}" stroke-width="30" opacity="0.25" stroke-dasharray="200 900" stroke-dashoffset="-380"/>` +
    stones +
    close
  );
}

function diamondSvg(t: ArtTone): string {
  return open + shadow(t.ink, 200, 344, 110, 12) + brilliant(200, 196, 138, t.stone) + close;
}

function watchSvg(t: ArtTone): string {
  const m = t.metal;
  const links = (y0: number, y1: number) => {
    let s = "";
    for (let y = y0; y < y1; y += 22) s += `<rect x="150" y="${y}" width="100" height="18" rx="5" fill="${m.base}" stroke="${m.dark}" stroke-width="2"/>`;
    return s;
  };
  const tick = (i: number) => {
    const a = (i * 2 * Math.PI) / 12 - Math.PI / 2;
    const x1 = 200 + 66 * Math.cos(a);
    const y1 = 200 + 66 * Math.sin(a);
    const x2 = 200 + 76 * Math.cos(a);
    const y2 = 200 + 76 * Math.sin(a);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${m.dark}" stroke-width="${i % 3 === 0 ? 5 : 3}"/>`;
  };
  return (
    open +
    links(10, 100) +
    links(300, 392) +
    // lugs and case
    `<rect x="140" y="96" width="120" height="208" rx="26" fill="${m.dark}"/>` +
    `<circle cx="200" cy="200" r="96" fill="${m.base}"/>` +
    `<circle cx="200" cy="200" r="84" fill="${m.dark}"/>` +
    // dial
    `<circle cx="200" cy="200" r="80" fill="${t.stone.dark}"/>` +
    `<circle cx="200" cy="200" r="80" fill="${t.stone.base}" opacity="0.35"/>` +
    Array.from({ length: 12 }, (_, i) => tick(i)).join("") +
    // hands
    `<line x1="200" y1="200" x2="200" y2="150" stroke="${m.light}" stroke-width="6" stroke-linecap="round"/>` +
    `<line x1="200" y1="200" x2="238" y2="214" stroke="${m.light}" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="200" cy="200" r="6" fill="${m.light}"/>` +
    // crown
    `<rect x="296" y="190" width="16" height="22" rx="4" fill="${m.base}"/>` +
    close
  );
}

/** The open box alone - the reveal's stage; the ring is a second piece that rises into the slot. */
export function ringBoxEmptySvg(t: ArtTone): string {
  const velvet = t.accent;
  return (
    open +
    shadow(t.ink, 200, 358, 140, 12) +
    `<path d="M70 150 L70 40 Q70 22 88 22 L312 22 Q330 22 330 40 L330 150 Z" fill="${velvet}"/>` +
    `<rect x="84" y="36" width="232" height="104" rx="8" fill="#ffffff" opacity="0.08"/>` +
    `<rect x="70" y="150" width="260" height="196" rx="14" fill="${velvet}"/>` +
    `<rect x="70" y="150" width="260" height="196" rx="14" fill="#000000" opacity="0.22"/>` +
    `<rect x="86" y="166" width="228" height="164" rx="10" fill="${velvet}"/>` +
    `<rect x="110" y="236" width="180" height="14" rx="7" fill="#000000" opacity="0.35"/>` +
    close
  );
}

function ringboxSvg(t: ArtTone): string {
  const m = t.metal;
  const velvet = t.accent;
  return (
    open +
    shadow(t.ink, 200, 358, 140, 12) +
    // the lid, open
    `<path d="M70 150 L70 40 Q70 22 88 22 L312 22 Q330 22 330 40 L330 150 Z" fill="${velvet}"/>` +
    `<rect x="84" y="36" width="232" height="104" rx="8" fill="#ffffff" opacity="0.08"/>` +
    // the base
    `<rect x="70" y="150" width="260" height="196" rx="14" fill="${velvet}"/>` +
    `<rect x="70" y="150" width="260" height="196" rx="14" fill="#000000" opacity="0.22"/>` +
    `<rect x="86" y="166" width="228" height="164" rx="10" fill="${velvet}"/>` +
    // the cushion slot
    `<rect x="110" y="236" width="180" height="14" rx="7" fill="#000000" opacity="0.35"/>` +
    // the ring standing in the slot
    `<ellipse cx="200" cy="236" rx="58" ry="56" fill="none" stroke="${m.base}" stroke-width="16"/>` +
    `<ellipse cx="200" cy="236" rx="58" ry="56" fill="none" stroke="${m.light}" stroke-width="5" stroke-dasharray="70 300" stroke-dashoffset="-40"/>` +
    `<rect x="190" y="162" width="20" height="30" rx="6" fill="${m.base}"/>` +
    brilliant(200, 172, 32, t.stone) +
    close
  );
}

/** One piece as SVG text, in the template's colours. */
export function jewelArtSvg(kind: ArtKind, tone: ArtTone): string {
  switch (kind) {
    case "solitaire":
      return solitaireSvg(tone);
    case "band":
      return bandSvg(tone);
    case "pendant":
      return pendantSvg(tone);
    case "studs":
      return studsSvg(tone);
    case "hoops":
      return hoopsSvg(tone);
    case "tennis":
      return tennisSvg(tone);
    case "diamond":
      return diamondSvg(tone);
    case "watch":
      return watchSvg(tone);
    case "ringbox":
      return ringboxSvg(tone);
  }
}

/** A loose round brilliant alone, any size, for stone-first templates (the 4Cs, birthstones). */
export function stoneSvg(stone: ArtTone["stone"], ink: string): string {
  return open + shadow(ink, 200, 344, 110, 12) + brilliant(200, 196, 138, stone) + close;
}

/** The six cuts a shape guide shows, each a flat top view with a table and crown facets. */
export const SHAPE_KINDS = ["round", "oval", "cushion", "emerald", "pear", "princess"] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

/** One cut as SVG text: an outline in the stone's dark, facets in base / light, a table in light. */
export function shapeSvg(kind: ShapeKind, s: ArtTone["stone"], ink: string): string {
  const stroke = `stroke="${s.dark}" stroke-width="2" stroke-opacity="0.6"`;
  const cx = 200;
  const cy = 196;
  let body = "";
  switch (kind) {
    case "round":
      return open + shadow(ink, 200, 344, 110, 12) + brilliant(cx, cy, 138, s) + close;
    case "oval":
      body =
        `<ellipse cx="${cx}" cy="${cy}" rx="100" ry="140" fill="${s.base}" ${stroke}/>` +
        `<ellipse cx="${cx}" cy="${cy}" rx="58" ry="84" fill="${s.light}" ${stroke}/>` +
        `<line x1="${cx - 100}" y1="${cy}" x2="${cx - 58}" y2="${cy}" ${stroke}/><line x1="${cx + 58}" y1="${cy}" x2="${cx + 100}" y2="${cy}" ${stroke}/>` +
        `<line x1="${cx}" y1="${cy - 140}" x2="${cx}" y2="${cy - 84}" ${stroke}/><line x1="${cx}" y1="${cy + 84}" x2="${cx}" y2="${cy + 140}" ${stroke}/>` +
        `<line x1="${cx - 70}" y1="${cy - 99}" x2="${cx - 41}" y2="${cy - 59}" ${stroke}/><line x1="${cx + 70}" y1="${cy - 99}" x2="${cx + 41}" y2="${cy - 59}" ${stroke}/>` +
        `<line x1="${cx - 70}" y1="${cy + 99}" x2="${cx - 41}" y2="${cy + 59}" ${stroke}/><line x1="${cx + 70}" y1="${cy + 99}" x2="${cx + 41}" y2="${cy + 59}" ${stroke}/>`;
      break;
    case "cushion":
      body =
        `<rect x="${cx - 120}" y="${cy - 120}" width="240" height="240" rx="56" fill="${s.base}" ${stroke}/>` +
        `<rect x="${cx - 66}" y="${cy - 66}" width="132" height="132" rx="30" fill="${s.light}" ${stroke}/>` +
        `<line x1="${cx - 120}" y1="${cy}" x2="${cx - 66}" y2="${cy}" ${stroke}/><line x1="${cx + 66}" y1="${cy}" x2="${cx + 120}" y2="${cy}" ${stroke}/>` +
        `<line x1="${cx}" y1="${cy - 120}" x2="${cx}" y2="${cy - 66}" ${stroke}/><line x1="${cx}" y1="${cy + 66}" x2="${cx}" y2="${cy + 120}" ${stroke}/>` +
        `<line x1="${cx - 104}" y1="${cy - 104}" x2="${cx - 58}" y2="${cy - 58}" ${stroke}/><line x1="${cx + 104}" y1="${cy - 104}" x2="${cx + 58}" y2="${cy - 58}" ${stroke}/>` +
        `<line x1="${cx - 104}" y1="${cy + 104}" x2="${cx - 58}" y2="${cy + 58}" ${stroke}/><line x1="${cx + 104}" y1="${cy + 104}" x2="${cx + 58}" y2="${cy + 58}" ${stroke}/>`;
      break;
    case "emerald": {
      const oct = (w: number, h: number, c: number) => `${cx - w + c},${cy - h} ${cx + w - c},${cy - h} ${cx + w},${cy - h + c} ${cx + w},${cy + h - c} ${cx + w - c},${cy + h} ${cx - w + c},${cy + h} ${cx - w},${cy + h - c} ${cx - w},${cy - h + c}`;
      body =
        `<polygon points="${oct(96, 136, 26)}" fill="${s.base}" ${stroke}/>` +
        `<polygon points="${oct(74, 110, 20)}" fill="none" ${stroke}/>` +
        `<polygon points="${oct(52, 84, 14)}" fill="${s.light}" ${stroke}/>` +
        `<line x1="${cx - 70}" y1="${cy - 136}" x2="${cx - 38}" y2="${cy - 84}" ${stroke}/><line x1="${cx + 70}" y1="${cy - 136}" x2="${cx + 38}" y2="${cy - 84}" ${stroke}/>` +
        `<line x1="${cx - 70}" y1="${cy + 136}" x2="${cx - 38}" y2="${cy + 84}" ${stroke}/><line x1="${cx + 70}" y1="${cy + 136}" x2="${cx + 38}" y2="${cy + 84}" ${stroke}/>`;
      break;
    }
    case "pear":
      body =
        `<path d="M${cx} ${cy - 150} C ${cx + 60} ${cy - 70}, ${cx + 104} ${cy - 10}, ${cx + 104} ${cy + 46} A 104 104 0 0 1 ${cx - 104} ${cy + 46} C ${cx - 104} ${cy - 10}, ${cx - 60} ${cy - 70}, ${cx} ${cy - 150} Z" fill="${s.base}" ${stroke}/>` +
        `<path d="M${cx} ${cy - 86} C ${cx + 34} ${cy - 36}, ${cx + 58} ${cy}, ${cx + 58} ${cy + 40} A 58 58 0 0 1 ${cx - 58} ${cy + 40} C ${cx - 58} ${cy}, ${cx - 34} ${cy - 36}, ${cx} ${cy - 86} Z" fill="${s.light}" ${stroke}/>` +
        `<line x1="${cx}" y1="${cy - 150}" x2="${cx}" y2="${cy - 86}" ${stroke}/><line x1="${cx}" y1="${cy + 98}" x2="${cx}" y2="${cy + 150}" ${stroke}/>` +
        `<line x1="${cx - 104}" y1="${cy + 46}" x2="${cx - 58}" y2="${cy + 40}" ${stroke}/><line x1="${cx + 104}" y1="${cy + 46}" x2="${cx + 58}" y2="${cy + 40}" ${stroke}/>` +
        `<line x1="${cx - 74}" y1="${cy + 118}" x2="${cx - 41}" y2="${cy + 80}" ${stroke}/><line x1="${cx + 74}" y1="${cy + 118}" x2="${cx + 41}" y2="${cy + 80}" ${stroke}/>`;
      break;
    case "princess":
      body =
        `<rect x="${cx - 124}" y="${cy - 124}" width="248" height="248" rx="6" fill="${s.base}" ${stroke}/>` +
        `<rect x="${cx - 62}" y="${cy - 62}" width="124" height="124" fill="${s.light}" ${stroke}/>` +
        `<line x1="${cx - 124}" y1="${cy - 124}" x2="${cx - 62}" y2="${cy - 62}" ${stroke}/><line x1="${cx + 124}" y1="${cy - 124}" x2="${cx + 62}" y2="${cy - 62}" ${stroke}/>` +
        `<line x1="${cx - 124}" y1="${cy + 124}" x2="${cx - 62}" y2="${cy + 62}" ${stroke}/><line x1="${cx + 124}" y1="${cy + 124}" x2="${cx + 62}" y2="${cy + 62}" ${stroke}/>` +
        `<line x1="${cx - 124}" y1="${cy}" x2="${cx - 62}" y2="${cy}" ${stroke}/><line x1="${cx + 62}" y1="${cy}" x2="${cx + 124}" y2="${cy}" ${stroke}/>` +
        `<line x1="${cx}" y1="${cy - 124}" x2="${cx}" y2="${cy - 62}" ${stroke}/><line x1="${cx}" y1="${cy + 62}" x2="${cx}" y2="${cy + 124}" ${stroke}/>`;
      break;
  }
  return open + shadow(ink, 200, 344, 110, 12) + body + `<circle cx="${cx - 28}" cy="${cy - 34}" r="11" fill="#ffffff" opacity="0.95"/>` + close;
}

/** A sparkle: a four-point star, for accents. */
export function sparkleSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><path d="M200 8 C208 128 272 192 392 200 C272 208 208 272 200 392 C192 272 128 208 8 200 C128 192 192 128 200 8 Z" fill="${color}"/></svg>`;
}

/** URL-encoded, not base64: the same code runs in a browser, and the rasterizer reads it. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
