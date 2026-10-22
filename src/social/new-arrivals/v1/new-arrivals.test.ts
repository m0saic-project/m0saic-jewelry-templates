import { mediaControlsSuite } from "../../../__testutils__/media-controls";
import { photoLedSuite } from "../../../__testutils__/photo-led";
import { NEW_ARRIVALS_MEDIA, NewArrivalsV1, arrivalTiles, newArrivalsBase } from "./new-arrivals";

// The drop as such (the base the controls wrap)...
photoLedSuite(newArrivalsBase, "@jewelry/social/new-arrivals/v1", ["item1Image", "item2Image", "item3Image", "item4Image"]);
// ...and the shipped template: every media input with its area and its fit, held to the base.
mediaControlsSuite(NewArrivalsV1, newArrivalsBase, NEW_ARRIVALS_MEDIA);

describe("arrivalTiles", () => {
  const hero = { x: 0, y: 0, w: 1000, h: 800 };
  it.each([1, 2, 3, 4])("cuts %i tiles that stay inside the photo side and never overlap", (n) => {
    const tiles = arrivalTiles(hero, n, 8);
    expect(tiles).toHaveLength(n);
    for (const t of tiles) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.x + t.w).toBeLessThanOrEqual(1000);
      expect(t.y + t.h).toBeLessThanOrEqual(800);
    }
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const a = tiles[i]!;
        const b = tiles[j]!;
        const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
        expect(apart).toBe(true);
      }
  });
});
