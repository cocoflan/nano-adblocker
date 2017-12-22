// Build core extension files, but not assets
"use strict";

(async () => {
    console.log("[Nano] Build Core :: Started");

    const outputPath = require("./build-engine.node.js").ezInit();
    createDirectory(outputPath);

    console.log("[Nano] Build Core :: Done");
})();
