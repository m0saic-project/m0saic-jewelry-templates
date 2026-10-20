import type { MosaicTemplatePropDefinition } from "@m0saic/types";
/**
 * A frozen version's props schema as its CODE declared it, for the vN+1 that wraps it.
 *
 * The catalog sidecar is applied onto a template when it is defined - each prop gains its `description`,
 * `meta.ui` (label, order) and `meta.control.placeholder` - so a schema read off a defined v1 carries the
 * v1 sidecar's copy. A v2 that reuses it must not re-declare that copy in code (the conventions gate
 * refuses it): v2's own sidecar supplies it. This strips exactly those three and keeps everything the
 * code said - type, required, constraints, controls.
 */
export declare function codeSchema<S extends Record<string, MosaicTemplatePropDefinition>>(schema: S): S;
