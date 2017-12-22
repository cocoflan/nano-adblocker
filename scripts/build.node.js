// Build core extension files, but not assets
"use strict";

(async () => {
    console.log("[Nano] Build Core :: Started");

    const outputPath = require("./build-engine.node.js").ezInit();
    createDirectory(outputPath);

    await smartCopyDirectory("src/css", outputPath + "/css");
    await smartCopyDirectory("src/nano-img", outputPath + "/img");
    await smartCopyDirectory("src/js", outputPath + "/js");
    await smartCopyDirectory("src/lib", outputPath + "/js");
    await smartCopyDirectory("src", output, false);
    await smartCopyDirectory("platform/chromium", outputPath + "/js", false);
    await Promise.all([
        smartCopyDirectory("platform/chromium/other", outputPath),
        smartCopyFile("LICENSE", outputPath),
    ]);

    console.log("[Nano] Build Core :: Done");
})();
