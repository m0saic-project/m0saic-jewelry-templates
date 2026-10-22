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
exports.TEMPLATE_REPO = exports.TEMPLATE_PACKS = exports.templates = exports.repo = void 0;
// FIRST: declare this repo's catalog, so every template below is defined with
// its label / description / tags / prop copy applied (see ./catalog).
require("./catalog");
const repo_1 = require("./repo");
Object.defineProperty(exports, "TEMPLATE_PACKS", { enumerable: true, get: function () { return repo_1.TEMPLATE_PACKS; } });
Object.defineProperty(exports, "TEMPLATE_REPO", { enumerable: true, get: function () { return repo_1.TEMPLATE_REPO; } });
const social_1 = require("./social");
const email_1 = require("./email");
const print_1 = require("./print");
/** The two exports every Mosaic host requires from a template repo. */
exports.repo = repo_1.TEMPLATE_REPO;
exports.templates = [
    ...social_1.socialTemplates,
    ...email_1.emailTemplates,
    ...print_1.printTemplates,
];
// Library re-exports for anyone importing this repo as code. `export *`
// ONLY for template modules — never pair `export * from "./x"` with a
// named re-export of the same module (tsc double-require hazard).
__exportStar(require("./social"), exports);
__exportStar(require("./email"), exports);
__exportStar(require("./print"), exports);
