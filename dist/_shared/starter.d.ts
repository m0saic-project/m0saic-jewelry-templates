import { type FileAsset } from "@m0saic/template-utils/dist/m0saic/assetPath";
/**
 * THE STARTER PACK: what an empty media slot shows. The founder, 2026-10-19: "the previews shown still use clip
 * art ... those are forbidden in app ... it is a bad experience for jeweler to see cheap clip art". So a version
 * built on media-controls.ts fills an EMPTY slot with a real photo or clip from `assets/starter/` (a small fixed
 * set of free-licence stock, credited in starter.json) - the prop stays empty, the rect stays its drop target.
 *
 * The engine's starter-media pattern (knowledge: templates/reference/prop-bindings.md, "Starter media"): the
 * files ship beside the code (copy-assets mirrors them into dist) and are addressed through `fileAsset`, which
 * rewrites a path inside a packaged app's asar to its unpacked twin. A file that is not on disk (a stripped
 * build) gives null, and the caller keeps its own stand-in - never an error mosaic.
 */
export type StarterItem = {
    key: string;
    file: string;
    kind: "image" | "video";
    roles: string[];
    look: {
        piece: string;
        style: string;
        stone: string;
        metal: string;
        name: string;
    };
    credit: Record<string, string>;
};
export declare function starterItem(key: string): StarterItem | undefined;
/** The pack file for `key` as a document asset, or null when the key is unknown or the file is not on disk. */
export declare function starterAsset(key: string): FileAsset | null;
