import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { WindowCardV1 } from "./window-card/v1/window-card";

/** Pack `print`, in registry order (mirrors ./registry.ts). */
export const printTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  WindowCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/index.ts.
export * from "./window-card/v1/window-card";
