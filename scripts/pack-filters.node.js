/**
 * Pack filters.
 * NanoFilters must be in the same parent directory as NanoCore.
 * Expects the extension core to be already built.
 */
"use strict";

(async () => {
    console.log("[Nano] Pack Filters :: Started");

    const assetsPath = require("./build-engine.node.js").ezInit() + "/assets";
    await createDirectory(assetsPath);

    await Promise.all([
        smartCopyFile("assets/assets.json", assetsPath + "/assets.json"),
        smartCopyDirectory("../NanoFilters/NanoFilters", assetsPath + "/NanoFilters"),
    ]);
    await smartCopyDirectory("../NanoFilters/ThirdParty", assetsPath + "/ThirdParty");

    // Also parse the assets file to make sure it is valid
    JSON.parse(await fs.readFile(assetsPath + "/assets.json", "utf8"));

    console.log("[Nano] Pack Filters :: Done");
})();
