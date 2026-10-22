import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { PersonalPickV1 } from "./personal-pick/v1/personal-pick";

/** Pack `email`, in registry order (mirrors ./registry.ts). */
export const emailTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  PersonalPickV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/index.ts.
export * from "./personal-pick/v1/personal-pick";
