"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_PACKS = exports.TEMPLATE_REPO = void 0;
const types_1 = require("@m0saic/types");
/**
 * Who this repo is. The entry module (src/index.ts) re-exports this as
 * `repo` — one of the two exports every Mosaic host requires from an
 * external template repo (the other is `templates`).
 *
 * This is the distribution repo of Mosaic for Jewelry: the solution pins
 * its URL, installs its latest signed release on its own, and shows nothing
 * else. The handle stays `@jewelry` — every template id is
 * `@jewelry/<pack>/<slug>/vN`, the same ids the solution's tour stages.
 */
exports.TEMPLATE_REPO = {
    repoId: (0, types_1.asRepoId)("@jewelry"),
    // No brand word in the name: an unsigned local copy would otherwise read
    // as "presents itself as m0saic". The signed release is exempt either way.
    displayName: "Jewelry Templates",
    schemaVersion: 1,
    description: "Templates for Mosaic for Jewelry, the m0saic Desktop solution for jewelers: pick a design, drop in your photos, make the video. Each release is a signed bundle that Desktop installs on its own.",
    curator: "m0saic",
    homepage: "https://github.com/m0saic-project/m0saic-jewelry-templates",
    // `samplesDir` ships the pack's sample pictures and clips as samples.tgz
    // (Mosaic Desktop's Files dock lists the folder first, as "Samples"). The
    // field is not in @m0saic/types yet (0.4.0 still types templatesDir only):
    // the cast keeps tsc happy and the manifest carries it all the same.
    assets: { templatesDir: "assets/templates", samplesDir: "samples" },
    // The template-convention line this repo targets (m0saic 0.3.1): the checks
    // hold its templates to the rules up to it and report newer ones as advice.
    conventions: "0.3.1",
};
/**
 * Packs, in display order. One is enough to start; add more by mirroring
 * the social/ folder (pack id = folder name = the <pack> segment of ids).
 */
exports.TEMPLATE_PACKS = [
    {
        id: "social",
        title: "Social",
        description: "Posts, stories and reels: your own photos and clips at the centre, the words beside them.",
    },
    {
        id: "email",
        title: "Email",
        description: "Newsletter heroes addressed to one client: her name, her occasion, the piece you chose for her.",
    },
    {
        id: "print",
        title: "Print",
        description: "Cards for the window and the case, at print size: the piece, its name and its price.",
    },
];
