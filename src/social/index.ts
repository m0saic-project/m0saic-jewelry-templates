import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { ProductSpotlightV1 } from "./product-spotlight/v1/product-spotlight";

export { ProductSpotlightV1 };

/** The social pack, in display order. */
export const socialTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  ProductSpotlightV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];
