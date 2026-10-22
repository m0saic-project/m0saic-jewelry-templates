import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { ProductSpotlightV1 } from "./product-spotlight/v1/product-spotlight";
import { PieceReelV1 } from "./piece-reel/v1/piece-reel";
import { NewArrivalsV1 } from "./new-arrivals/v1/new-arrivals";

export { ProductSpotlightV1 };

/** The social pack, in display order. */
export const socialTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  ProductSpotlightV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PieceReelV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NewArrivalsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];
export * from "./piece-reel/v1/piece-reel";
export * from "./new-arrivals/v1/new-arrivals";
