// Package assets, assume to be executed either at / or /scripts of NanoCore
// Also expects NanoFilters to be in the same parent directory as NanoCore
// Must be ran after everything else is built
"use strict";

(async () => {
    const assetsPath = require("./build-common.node.js").ezInit() + "/assets";
    createDirectory(assetsPath);

    await Promise.all([
        smartCopyFile("assets/assets.json", assetsPath + "/assets.json"),
        smartCopyDirectory("../NanoFilters/NanoFilters", assetsPath + "/NanoFilters"),
    ]);
    await smartCopyDirectory("../NanoFilters/ThirdParty", assetsPath + "/ThirdParty");

    console.log("Done");
})();