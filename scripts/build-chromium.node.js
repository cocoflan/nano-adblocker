/**
 * Apply patches for Chromium.
 * Expects the extension core to be already built.
 */
"use strict";

(async () => {
    console.log("[Nano] Apply Chromium Patch :: Started");

    const localePath = require("./build-engine.node.js").ezInit() + "/_locales";
    await smartCopyDirectory(localePath + "/nb", localePath + "/no");

    console.log("[Nano] Apply Chromium Patch :: Done");
})();
