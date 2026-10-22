// FIRST: declare this repo's catalog, so every template below is defined with
// its label / description / tags / prop copy applied (see ./catalog).
import "./catalog";
import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { TEMPLATE_PACKS, TEMPLATE_REPO } from "./repo";
import { socialTemplates } from "./social";
import { emailTemplates } from "./email";
import { printTemplates } from "./print";

/** The two exports every Mosaic host requires from a template repo. */
export const repo = TEMPLATE_REPO;

export const templates: MosaicTemplate<MosaicTemplateProps>[] = [
  ...socialTemplates,
  ...emailTemplates,
  ...printTemplates,
];

// Library re-exports for anyone importing this repo as code. `export *`
// ONLY for template modules — never pair `export * from "./x"` with a
// named re-export of the same module (tsc double-require hazard).
export * from "./social";
export * from "./email";
export * from "./print";
export { TEMPLATE_PACKS, TEMPLATE_REPO };
