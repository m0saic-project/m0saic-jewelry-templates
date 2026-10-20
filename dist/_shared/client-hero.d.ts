import type { MosaicSource } from "@m0saic/types";
import type { asAssetId } from "@m0saic/types";
import type { LayoutConstraint } from "@m0saic/template-utils";
import { type TextFit } from "./text";
import { type Beats, type Block, type Chrome, type Palette, type Rect } from "./jewel";
/**
 * The client hero: the one layout every "addressed to one person" template
 * in this repo shares. Three beats - a greeting that IS the thumbnail, a
 * piece on its card with a reason, an offer held to the last frame - and
 * the same geometry whether the row is a birthday, an anniversary, a
 * wish-list item back in stock or a repair ready for pickup. What differs
 * per template is WHICH fields of the record fill which line, so each
 * template owns its props and its copy, and all of them own this shape.
 */
export type ClientHeroCopy = {
    brandName: string;
    hasLogo: boolean;
    /** The greeting line as drawn: "Hi Susie," / "Happy birthday, Susie". */
    hello: string;
    /** Under the greeting. Empty removes it. */
    sub: string;
    kicker: string;
    title: string;
    body: string;
    offer: string;
    code: string;
    expiry: string;
    cta: string;
    url: string;
};
/** Which prop keys each drawn line binds to (a composite line lists several). */
export type ClientHeroBind = {
    hello: string[];
    sub: string[];
    kicker: string[];
    title: string[];
    body: string[];
    offer: string[];
    code: string[];
    expiry: string[];
    cta: string[];
    url: string[];
    image: string;
    accent: string;
};
export type ClientHeroLayout = {
    W: number;
    H: number;
    stacked: boolean;
    chrome: Chrome;
    hello: Block;
    sub: Block | null;
    card: Rect;
    art: Rect;
    kicker: Block | null;
    title: Block;
    body: Block | null;
    offer: Block | null;
    pill: Rect | null;
    code: TextFit | null;
    expiry: Block | null;
    cta: Block | null;
    url: Block | null;
};
export declare function layoutClientHero(copy: ClientHeroCopy, W: number, H: number): ClientHeroLayout;
export declare function clientHeroContract(L: ClientHeroLayout): LayoutConstraint[];
/** The three-beat share table every client hero uses: 22% hello, 36% the piece, 42% the offer. */
export declare const CLIENT_HERO_SHARES: number[];
/**
 * Push every content piece (the chrome is the caller's). Beat one leaves
 * before the card arrives; the card holds; beat two's copy makes way for
 * the offer; the offer holds to the last frame.
 */
export declare function clientHeroPieces(piece: (rect: Rect, importance: number, source: MosaicSource) => void, L: ClientHeroLayout, P: Palette, T: Beats, imageId: ReturnType<typeof asAssetId>, bind: ClientHeroBind): void;
