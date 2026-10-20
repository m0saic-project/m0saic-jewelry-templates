import type { MosaicDocument, MosaicEngineContext, MosaicTemplate } from "@m0saic/types";
import { resolvePropBindings } from "@m0saic/template-utils";

import { sweepLayout } from "../_shared/layout";
import { asDocument, targetCtx } from "./render";

/**
 * The suite every photo-led template shares (`_shared/photo-led.ts`): the photo is cover-cropped and takes
 * its side of the frame on every orientation, a clip is taken as the hero and loops muted, the bundled
 * art sits on a panel without one, everything drawn is bound, the contract holds on the seven canvases
 * with photos and without, and the render is deterministic. Each v2's test file names its hero props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function photoLedSuite(T: MosaicTemplate<any>, id: string, heroKeys: string[], opts: { still?: boolean } = {}): void {
  const label = (s: unknown) => (s as { editor?: { label?: string } }).editor?.label ?? "";
  const render = (props: Record<string, unknown>, w: number, h: number, ctx?: MosaicEngineContext): Promise<MosaicDocument> =>
    Promise.resolve(T.render({ ...T.defaultProps, ...props }, ctx ?? targetCtx(w, h))).then(asDocument);
  const photos = Object.fromEntries(heroKeys.map((k, i) => [k, [`C:/photos/piece-${i + 1}.jpg`]]));
  const heroesOf = (doc: MosaicDocument) =>
    doc.sources.filter((s) => (s as { type?: string }).type === "media" && heroKeys.some((_, i) => /(^hero$|-photo$)/.test(label(s)) && i >= 0)) as unknown as Array<{ mediaType: string; placement: { fit: string }; playback?: { loopMode?: string } }>;

  describe(`${id} - photo-led`, () => {
    it("lets each photo take its side of the frame, cover-cropped, on every orientation", async () => {
      for (const [w, h] of [[1080, 1920], [1920, 1080], [1080, 1080]] as const) {
        const doc = await render(photos, w, h);
        const heroes = heroesOf(doc);
        expect(heroes).toHaveLength(heroKeys.length);
        for (const s of heroes) expect(s.placement.fit).toBe("cover");
        expect(doc.sources.map(label).some((l) => /-art$/.test(l))).toBe(false);
      }
      const art = await render({}, 1080, 1920);
      expect(art.sources.map(label).filter((l) => /-art$/.test(l))).toHaveLength(heroKeys.length);
    });

    it("takes a clip as the hero: looping, muted", async () => {
      const clip = "C:/clips/turntable.mp4";
      const ctx = { ...targetCtx(1080, 1920), media: { [clip]: { kind: "video", width: 1080, height: 1920, hasVideo: true, hasAudio: false, durationMs: 6_000 } } } as unknown as MosaicEngineContext;
      const doc = await render({ [heroKeys[0]!]: [clip] }, 1080, 1920, ctx);
      const hero = heroesOf(doc).find((s) => s.mediaType === "video");
      expect(hero?.playback?.loopMode).toBe("loop");
    });

    it("binds what it draws", async () => {
      for (const props of [{}, photos]) {
        const doc = await render(props, 1080, 1920);
        const { byProp, rejected } = resolvePropBindings(doc, 1080, 1920, { propsSchema: T.propsSchema });
        expect(rejected).toEqual([]);
        for (const k of heroKeys) expect(byProp[k]?.length ?? 0).toBeGreaterThanOrEqual(1);
      }
    });

    it("holds the contract on every canvas, with photos and without", async () => {
      const sweep = (props: Record<string, unknown>) =>
        sweepLayout((p, ctx) => Promise.resolve(T.render({ ...T.defaultProps, ...p }, ctx)).then(asDocument), id, props, (w, h) => targetCtx(w, h));
      await sweep(photos);
      await sweep({});
    }, 180_000);

    it(opts.still ? "is deterministic (a still)" : "is deterministic", async () => {
      expect(await render(photos, 1080, 1920)).toEqual(await render(photos, 1080, 1920));
    });
  });
}
