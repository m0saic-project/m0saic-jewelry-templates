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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.starterItem = starterItem;
exports.starterAsset = starterAsset;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const assetPath_1 = require("@m0saic/template-utils/dist/m0saic/assetPath");
const starter_json_1 = __importDefault(require("./assets/starter/starter.json"));
const DIR = path.resolve(__dirname, "assets", "starter");
const ITEMS = new Map(starter_json_1.default.items.map((i) => [i.key, i]));
const onDisk = new Map();
function starterItem(key) {
    return ITEMS.get(key);
}
/** The pack file for `key` as a document asset, or null when the key is unknown or the file is not on disk. */
function starterAsset(key) {
    var _a;
    if (!onDisk.has(key)) {
        const item = ITEMS.get(key);
        const asset = item ? (0, assetPath_1.fileAsset)(DIR, item.file, item.kind) : null;
        // The probe tests the translated path - the one the renderer will be handed.
        onDisk.set(key, asset && fs.existsSync(asset.path) ? asset : null);
    }
    return (_a = onDisk.get(key)) !== null && _a !== void 0 ? _a : null;
}
