import type { StarterRegistryEntry } from "../registry-types";

/**
 * Pack registry: `social` — array order is the display order.
 */
export const socialRegistry: StarterRegistryEntry[] = [
  {
    slug: "product-spotlight",
    templateId: "@jewelry/social/product-spotlight/v1",
    exportName: "ProductSpotlightV1",
  },
  {
    slug: "piece-reel",
    templateId: "@jewelry/social/piece-reel/v1",
    exportName: "PieceReelV1",
  },
  {
    slug: "new-arrivals",
    templateId: "@jewelry/social/new-arrivals/v1",
    exportName: "NewArrivalsV1",
  },
];
