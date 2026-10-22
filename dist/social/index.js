"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialTemplates = exports.ProductSpotlightV1 = void 0;
const product_spotlight_1 = require("./product-spotlight/v1/product-spotlight");
Object.defineProperty(exports, "ProductSpotlightV1", { enumerable: true, get: function () { return product_spotlight_1.ProductSpotlightV1; } });
const piece_reel_1 = require("./piece-reel/v1/piece-reel");
const new_arrivals_1 = require("./new-arrivals/v1/new-arrivals");
/** The social pack, in display order. */
exports.socialTemplates = [
    product_spotlight_1.ProductSpotlightV1,
    piece_reel_1.PieceReelV1,
    new_arrivals_1.NewArrivalsV1,
];
__exportStar(require("./piece-reel/v1/piece-reel"), exports);
__exportStar(require("./new-arrivals/v1/new-arrivals"), exports);
