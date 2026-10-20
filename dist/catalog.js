"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_CATALOG = void 0;
const template_utils_1 = require("@m0saic/template-utils");
const template_catalog_json_1 = __importDefault(require("./template-catalog.json"));
const repo_1 = require("./repo");
/** The gathered catalog (validated by the build step that wrote it). */
exports.TEMPLATE_CATALOG = template_catalog_json_1.default;
(0, template_utils_1.declareTemplateCatalog)(exports.TEMPLATE_CATALOG.templates);
// …and the conventions target (`repo.conventions`): rules newer than it are advice here.
(0, template_utils_1.declareTemplateConventions)(repo_1.TEMPLATE_REPO.conventions);
