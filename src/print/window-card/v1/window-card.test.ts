import { mediaControlsSuite } from "../../../__testutils__/media-controls";
import { photoLedSuite } from "../../../__testutils__/photo-led";
import { WINDOW_CARD_MEDIA, WindowCardV1, windowCardBase } from "./window-card";

// The card as such (the base the controls wrap)...
photoLedSuite(windowCardBase, "@jewelry/print/window-card/v1", ["productImage"], { still: true });
// ...and the shipped template: every media input with its area and its fit, held to the base.
mediaControlsSuite(WindowCardV1, windowCardBase, WINDOW_CARD_MEDIA);
