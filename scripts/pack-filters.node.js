/**
 * Pack filters.
 * NanoFilters must be in the same parent directory as NanoCore.
 * Expectes the extension core is already built.
 */
"use strict";

(async () => {
    console.log("[Nano] Pack Filters :: Started");

    const assetsPath = require("./build-engine.node.js").ezInit() + "/assets";
    createDirectory(assetsPath);

    await Promise.all([
        smartCopyFile("assets/assets.json", assetsPath + "/assets.json"),
        smartCopyDirectory("../NanoFilters/NanoFilters", assetsPath + "/NanoFilters"),
    ]);
    await smartCopyDirectory("../NanoFilters/ThirdParty", assetsPath + "/ThirdParty");

    console.log("[Nano] Pack Filters :: Done");
})();
