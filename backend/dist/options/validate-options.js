"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
var fs_1 = __importDefault(require("fs"));
function validateOptions(options) {
    try {
        if (!fs_1.default.existsSync(options.config)) {
            fs_1.default.writeFileSync(options.config, "{}", "utf-8");
        }
        if (!fs_1.default.existsSync(options.sheriffDump)) {
            console.error("Sheriff export does not exist: ", options.sheriffDump);
            return false;
        }
        if (!options.port) {
            return false;
        }
    }
    catch (e) {
        console.error(e);
        return false;
    }
    return true;
}
