#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_options_1 = require("./options/parse-options");
var config_1 = require("./infrastructure/config");
var deps_1 = require("./infrastructure/deps");
var git_1 = require("./infrastructure/git");
var open_1 = require("./utils/open");
var express_1 = require("./express");
var options = (0, parse_options_1.parseOptions)(process.argv.slice(2));
if (options.path) {
    process.chdir(options.path);
}
(0, config_1.ensureConfig)(options);
if (!(0, deps_1.inferDeps)(options)) {
    console.error("No entry points found. Tried:", (0, deps_1.getEntryGlobs)(options).join(", "));
    console.error("\nPlease configured your entry points in .detective/config.json");
    process.exit(1);
}
if (!(0, git_1.isRepo)()) {
    console.warn("This does not seem to be a git repository.");
    console.warn("Most diagrams provided by detective do not work without git!");
}
var app = (0, express_1.setupExpress)(options);
app.listen(options.port, function () {
    var url = "http://localhost:".concat(options.port);
    console.log("Detective runs at ".concat(url));
    if (options.open) {
        (0, open_1.openSync)(url);
    }
});
