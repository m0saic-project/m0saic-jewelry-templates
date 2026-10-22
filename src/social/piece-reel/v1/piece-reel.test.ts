import type { MosaicDocument, MosaicEngineContext } from "@m0saic/types";
import { assertLayout, resolvePropBindings } from "@m0saic/template-utils";

import { CONTRACT_CANVASES, layoutIntentOf } from "../../../_shared/layout";
import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { mediaControlsSuite } from "../../../__testutils__/media-controls";
import { PIECE_REEL_MEDIA, PieceReelV1, pieceReelBase, layoutReelStep, type PieceReelProps } from "./piece-reel";

const ID = "@jewelry/social/piece-reel/v1";
const render = (props: PieceReelProps = {}, w = 1080, h = 1920, ctx?: MosaicEngineContext) =>
  Promise.resolve(pieceReelBase.render({ ...pieceReelBase.defaultProps, ...props }, ctx ?? targetCtx(w, h))).then(asPipeline);
type Box = { x: number; y: number; w: number; h: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const CLIPS = { clip1: ["C:/clips/a.mp4"], clip2: ["C:/clips/b.mp4"], clip3: ["C:/photos/c.jpg"] };
const step = (i: number) => ({
  brandName: "Your Brand",
  hook: i === 0 ? "Just off the bench" : "",
  hookSize: "Just off the bench",
  label: ["East-West Oval Solitaire", "Diamond Halo Pendant set in eighteen-karat white gold", "Line Bracelet"][i]!,
  detail: i === 1 ? "1.2 ct, G VS1" : "",
  anyDetail: true,
  strip: "The Fall Jewelry Show · Oct 25 - 27 · Booth 418",
});

describe(ID, () => {
  it("never sets a word over the clip, on any orientation", () => {
    for (const [w, h] of [[1080, 1920], [1920, 1080], [1080, 1080], [1080, 1350]] as const) {
      for (const i of [0, 1, 2]) {
        const L = layoutReelStep(step(i), w, h);
        for (const b of [L.wordmark, L.hook, L.label, L.detail, L.strip]) if (b) expect(overlaps(b.rect, L.media)).toBe(false);
        if (L.stripBand) expect(overlaps(L.stripBand, L.media)).toBe(false);
      }
    }
  });

  it("keeps the clip in the same rect on every step, so the crossfades hold still", () => {
    for (const [w, h] of [[1080, 1920], [1920, 1080], [1080, 1080]] as const) {
      const rects = new Set([0, 1, 2].map((i) => JSON.stringify(layoutReelStep(step(i), w, h).media)));
      expect(rects.size).toBe(1);
    }
  });

  it("draws the clip in its own rect and the wordmark on every step", async () => {
    const reel = await render(CLIPS);
    for (const s of reel.steps.slice(0, -1)) {
      const labels = (s.file as MosaicDocument).sources.map((x) => (x as { editor?: { label?: string } }).editor?.label);
      expect(labels).toEqual(expect.arrayContaining(["wordmark"]));
      expect(labels.some((l) => /^clip-\d$/.test(l ?? ""))).toBe(true);
    }
  });

  it("is ivory by default, binds what it draws, holds its contract and is deterministic", async () => {
    expect(pieceReelBase.defaultProps).toMatchObject({ theme: "ivory" });
    const reel = await render(CLIPS);
    const { rejected } = resolvePropBindings(reel.steps[0]!.file as MosaicDocument, 1080, 1920, { propsSchema: pieceReelBase.propsSchema });
    expect(rejected).toEqual([]);
    for (const [w, h] of CONTRACT_CANVASES) {
      const ctx = targetCtx(w, h);
      const p = await render(CLIPS, w, h, ctx);
      for (const s of p.steps) {
        const doc = s.file as MosaicDocument;
        const intent = layoutIntentOf(doc);
        if (!intent) throw new Error(`${ID}: no layout intent at ${w}x${h}`);
        assertLayout(doc, ctx, ID, { constraints: intent.constraints, relations: intent.relations });
      }
    }
    expect(await render(CLIPS)).toEqual(await render(CLIPS));
  }, 180_000);
});

// The shipped template: every media input with its area (the clips share one fit), held to the base.
mediaControlsSuite(PieceReelV1, pieceReelBase, PIECE_REEL_MEDIA);
