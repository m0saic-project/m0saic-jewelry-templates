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
export function codeSchema<S extends Record<string, MosaicTemplatePropDefinition>>(schema: S): S {
  const out: Record<string, MosaicTemplatePropDefinition> = {};
  for (const [key, def] of Object.entries(schema)) {
    const { description: _d, meta, ...rest } = def as MosaicTemplatePropDefinition & { description?: unknown; meta?: Record<string, unknown> };
    void _d;
    if (meta) {
      const { ui: _ui, control, ...metaRest } = meta as { ui?: unknown; control?: Record<string, unknown> };
      void _ui;
      const nextMeta: Record<string, unknown> = { ...metaRest };
      if (control) {
        const { placeholder: _p, ...controlRest } = control;
        void _p;
        if (Object.keys(controlRest).length) nextMeta.control = controlRest;
      }
      out[key] = { ...rest, ...(Object.keys(nextMeta).length ? { meta: nextMeta } : {}) } as MosaicTemplatePropDefinition;
    } else {
      out[key] = rest as MosaicTemplatePropDefinition;
    }
  }
  return out as S;
}
