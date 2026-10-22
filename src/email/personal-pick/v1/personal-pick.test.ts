import { mediaControlsSuite } from "../../../__testutils__/media-controls";
import { photoLedSuite } from "../../../__testutils__/photo-led";
import { PERSONAL_PICK_MEDIA, PersonalPickV1, personalPickBase } from "./personal-pick";

// The hero as such (the base the controls wrap)...
photoLedSuite(personalPickBase, "@jewelry/email/personal-pick/v1", ["productImage"]);
// ...and the shipped template: every media input with its area and its fit, held to the base.
mediaControlsSuite(PersonalPickV1, personalPickBase, PERSONAL_PICK_MEDIA);
