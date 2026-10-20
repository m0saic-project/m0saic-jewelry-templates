import type { MosaicDocument, MosaicEngineContext, MosaicTemplate } from "@m0saic/types";
import { getTemplate, registerTemplate, resolveDocFrames, resolvePropBindings } from "@m0saic/template-utils";

import { fitKey, regionKey, type MediaDecor, type MediaSlot } from "../_shared/media-controls";
import { starterItem } from "../_shared/starter";
import { targetCtx } from "./render";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplate = MosaicTemplate<any>;

/** Register a pack for a frame that nests by id - once per test file, whichever block asks first. */
export function registerOnce(templates: AnyTemplate[]): void {
  for (const t of templates) if (!getTemplate(String(t.id))) registerTemplate(t);
}

/**
 * The suite every version with media controls shares (`_shared/media-controls.ts`): each media input takes a photo
 * or a clip and has its area and its fit; given the wrapped version's words, a file in every slot and its fits, it
 * renders exactly as that version; at its defaults no bundled art is drawn - an empty slot shows its starter, the
 * prop still empty and bound; a drawn area moves the slot there; the fit is the placement; a probed clip plays,
 * muted; every slot's rect carries its handles; a bad control is refused by name. Each version's test file names
 * its predecessor, its slots and its decor (`decor`: bundled art swapped or left out, not compared).
 *
 * `registry`: templates a frame nests by id. `filled`: props that make every slot drawn (a row that needs a name
 * before its photo shows), added wherever the suite sets photos.
 */
export function mediaControlsSuite(T: AnyTemplate, prev: AnyTemplate, slots: MediaSlot[], opts: { registry?: AnyTemplate[]; filled?: Record<string, unknown>; decor?: MediaDecor[] } = {}): void {
  /** Whether a document asset path is the starter pack's file for `key`. */
  const keysPath = (p: string, key: string) => {
    const file = starterItem(key)?.file;
    return !!file && p.split(/[\\/]/).slice(-3).join("/") === `assets/starter/${file}`;
  };
  const id = String(T.id);
  const W = 1080;
  const H = 1920;
  const render = (t: AnyTemplate, props: Record<string, unknown>, ctx?: MosaicEngineContext): Promise<MosaicDocument[]> =>
    Promise.resolve(t.render({ ...t.defaultProps, ...props }, ctx ?? targetCtx(W, H))).then((r) => {
      const x = r as unknown as { kind: string; steps?: Array<{ file: MosaicDocument }> };
      return x.kind === "mosaic_pipeline" ? x.steps!.map((s) => s.file) : [r as MosaicDocument];
    });
  const photo = (k: string) => `C:/photos/${k}.jpg`;
  const photos = { ...Object.fromEntries(slots.map((s) => [s.key, [photo(s.key)]])), ...opts.filled };
  const unbound = (prev.bindings as { unbound?: Record<string, string> } | undefined)?.unbound ?? {};
  type Src = { type?: string; assetId?: string; mediaType?: string; placement?: { fit?: string; inset?: { top: number; right: number; bottom: number; left: number } }; playback?: { loopMode?: string }; audio?: { enabled?: boolean }; editor?: { binding?: { propKey: string }; bindings?: Array<{ propKey: string; kind?: string }> } };
  const keysOf = (s: Src) => (s.editor?.bindings ?? (s.editor?.binding ? [s.editor.binding] : [])).map((b) => b.propKey);
  /** The slot's own media source and where it is painted. */
  const mediaOf = (docs: MosaicDocument[], key: string) => {
    for (const doc of docs) {
      const i = doc.sources.findIndex((s) => {
        const src = s as unknown as Src;
        const asset = src.assetId ? (doc.assets as Record<string, { kind?: string }>)[src.assetId] : undefined;
        return src.type === "media" && asset?.kind === "file" && keysOf(src).includes(key);
      });
      if (i < 0) continue;
      const src = doc.sources[i] as unknown as Src;
      const f = resolveDocFrames(doc, W, H).framesByLogical[i]!;
      const inset = src.placement?.inset ?? { top: 0, right: 0, bottom: 0, left: 0 };
      const rect = { x: f.x + inset.left * f.width, y: f.y + inset.top * f.height, w: f.width * (1 - inset.left - inset.right), h: f.height * (1 - inset.top - inset.bottom) };
      return { src, rect };
    }
    throw new Error(`${id}: no media source bound to ${key}`);
  };
  const labelOf = (s: unknown) => (s as { editor?: { label?: string } }).editor?.label ?? "";
  const decorLabels = new Set((opts.decor ?? []).map((d) => d.label));
  /** Every source as drawn - where it is painted, and itself less its handles and its lattice inset - but the decor. */
  const drawn = (docs: MosaicDocument[]) =>
    docs.map((doc) => {
      const frames = resolveDocFrames(doc, W, H).framesByLogical;
      return doc.sources.flatMap((s, i) => {
        if (decorLabels.has(labelOf(s))) return [];
        const src = s as unknown as Src & { placement?: Record<string, unknown>; editor?: Record<string, unknown> };
        const f = frames[i]!;
        const n = src.placement?.inset ?? { top: 0, right: 0, bottom: 0, left: 0 };
        const rect = [f.x + n.left * f.width, f.y + n.top * f.height, f.width * (1 - n.left - n.right), f.height * (1 - n.top - n.bottom)].map(Math.round);
        return [{ rect, source: { ...src, placement: { ...src.placement, inset: undefined }, editor: { ...src.editor, binding: undefined, bindings: undefined } } }];
      });
    });
  const bundledArt = (doc: MosaicDocument): string[] => [
    ...Object.values((doc.assets ?? {}) as Record<string, { displayName?: string }>).map((a) => a.displayName ?? "").filter((n) => /bundled art/.test(n)),
    ...Object.values((doc.children ?? {}) as Record<string, MosaicDocument>).flatMap((c) => (c && c.sources ? bundledArt(c) : [])),
  ];
  /** The fit each slot's file had in the wrapped version, as this version's Fit props. */
  const prevFits = async () => {
    const docs = await render(prev, photos);
    const fits: Record<string, string> = {};
    for (const s of slots) {
      if (s.fitProp) continue;
      try {
        const fit = mediaOf(docs, s.key).src.placement?.fit;
        if (fit) fits[fitKey(s.key)] = fit;
      } catch {
        // A slot the wrapped version does not draw with these props keeps its default.
      }
    }
    return fits;
  };

  describe(`${id} - media controls`, () => {
    beforeAll(() => {
      registerOnce(opts.registry ?? []);
    });

    it("gives every media input a photo or a clip, an area and a fit", () => {
      for (const s of slots) {
        const schema = T.propsSchema as Record<string, { type: string; meta?: { control?: { accept?: string[]; picker?: string; regions?: { max?: number } }; constraints?: { oneOf?: string[] } } }>;
        expect(schema[s.key]!.meta!.control!.accept).toEqual(["image", "video"]);
        expect(schema[regionKey(s.key)]).toMatchObject({ type: "json", meta: { control: { picker: "regions", regions: { max: 1 } } } });
        expect((T.defaultProps as Record<string, unknown>)[regionKey(s.key)]).toBeUndefined();
        if (s.fitProp) {
          expect(schema[fitKey(s.key)]).toBeUndefined();
        } else {
          expect(schema[fitKey(s.key)]!.meta!.constraints!.oneOf).toEqual(["cover", "contain"]);
          expect((T.defaultProps as Record<string, unknown>)[fitKey(s.key)]).toBe(s.fit);
        }
      }
    });

    it(`renders exactly as ${String(prev.id)} given its words, a file in every slot and its fits`, async () => {
      const mine = await render(T, { ...prev.defaultProps, ...photos, ...(await prevFits()) });
      const theirs = await render(prev, photos);
      expect(drawn(mine)).toEqual(drawn(theirs));
      if (decorLabels.size === 0) expect(mine.map((d) => d.assets)).toEqual(theirs.map((d) => d.assets));
    });

    it("draws no bundled art at its defaults: an empty slot shows its starter, the prop still empty and bound", async () => {
      const docs = await render(T, {});
      for (const doc of docs) expect(bundledArt(doc)).toEqual([]);
      const defaults = T.defaultProps as Record<string, unknown>;
      for (const s of slots) {
        if (!s.starter || unbound[s.key] || (s.starterWhen && !defaults[s.starterWhen])) continue;
        expect(defaults[s.key] ?? []).toEqual([]);
        const asset = (docs.flatMap((d) => Object.values(d.assets as Record<string, { path?: string }>)).find((a) => a.path && keysPath(a.path, s.starter!)));
        expect(asset).toBeDefined();
        expect(mediaOf(docs, s.key).src.mediaType).toBe(/^clip-/.test(s.starter) ? "video" : "image");
      }
    });

    it("binds each slot's drop target, area and fit on the rect that shows it, with photos and without", async () => {
      for (const props of [{}, photos]) {
        for (const doc of await render(T, props)) {
          const { rejected } = resolvePropBindings(doc, W, H, { propsSchema: T.propsSchema });
          expect(rejected).toEqual([]);
        }
        const all = (await render(T, props)).map((doc) => resolvePropBindings(doc, W, H, { propsSchema: T.propsSchema }).byProp);
        const count = (k: string) => all.reduce((n, b) => n + (b[k]?.length ?? 0), 0);
        for (const s of slots) {
          if (Object.keys(props).length === 0 && unbound[s.key]) continue;
          expect(count(s.key)).toBeGreaterThanOrEqual(1);
          expect(count(regionKey(s.key))).toBe(count(s.key));
          expect(count(s.fitProp ?? fitKey(s.key))).toBeGreaterThanOrEqual(count(s.key));
        }
      }
    });

    it.each(slots.map((s) => [s.key, s] as const))("moves %s to the area drawn, at its fit, and plays a clip there", async (key, s) => {
      const R = { x: 96, y: 1180, w: 480, h: 360 };
      const at = mediaOf(await render(T, { ...photos, [regionKey(key)]: { regions: [{ x: R.x, y: R.y, w: R.w, h: R.h }] } }), key);
      expect(Math.abs(at.rect.x - R.x)).toBeLessThan(1.5);
      expect(Math.abs(at.rect.y - R.y)).toBeLessThan(1.5);
      expect(Math.abs(at.rect.w - R.w)).toBeLessThan(1.5);
      expect(Math.abs(at.rect.h - R.h)).toBeLessThan(1.5);
      // Drawn on another canvas, it lands in proportion.
      const half = mediaOf(await render(T, { ...photos, [regionKey(key)]: { canvas: { w: W / 2, h: H / 2 }, regions: [{ x: R.x / 2, y: R.y / 2, w: R.w / 2, h: R.h / 2 }] } }), key);
      expect(Math.abs(half.rect.x - R.x)).toBeLessThan(1.5);

      if (!s.fitProp) {
        for (const fit of ["cover", "contain"] as const) {
          const src = mediaOf(await render(T, { ...photos, [fitKey(key)]: fit }), key).src;
          expect(src.placement!.fit).toBe(fit);
        }
      }

      const clip = `C:/clips/${key}.mp4`;
      const first = mediaOf(await render(T, { ...photos, [key]: [clip] }), key).src;
      const probe = { kind: "video", width: 1080, height: 1920, hasVideo: true, hasAudio: true, durationMs: 6_000 };
      const ctx = { ...targetCtx(W, H), media: { [clip]: probe, [first.assetId!]: probe } } as unknown as MosaicEngineContext;
      const played = mediaOf(await render(T, { ...photos, [key]: [clip] }, ctx), key).src;
      expect(played.mediaType).toBe("video");
      expect(played.playback?.loopMode).toBeDefined();
      expect(played.audio?.enabled).toBe(false);
    }, 60_000);

    it("refuses a bad area or fit by name, and is deterministic", async () => {
      const s = slots[0]!;
      await expect(render(T, { [regionKey(s.key)]: { regions: "here" } })).rejects.toThrow(new RegExp(`${id}.*${regionKey(s.key)}`));
      await expect(render(T, { [regionKey(s.key)]: { regions: [{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 }] } })).rejects.toThrow(/one rect/);
      if (!s.fitProp) await expect(render(T, { [fitKey(s.key)]: "stretch" })).rejects.toThrow(new RegExp(fitKey(s.key)));
      expect(await render(T, photos)).toEqual(await render(T, photos));
    });
  });
}
