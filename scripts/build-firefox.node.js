/**
 * Apply patches for Firefox, there is unfortunately no easy way to
 * smart-build this part.
 * Expects the extension core to be already built.
 * Because the manifest is only copied if the source has changed,
 * this script does not have to run on every debug build.
 */
"use strict";

(async () => {
    console.log("[Nano] Apply Firefox Patch :: Started");

    const basePath = require("./build-engine.node.js").ezInit();
    assert(isFirefox);

    let manifest = await fs.readFile(basePath + "/manifest.json", "utf8");
    manifest = JSON.parse(manifest);

    manifest["incognito"] = "spanning";
    delete manifest["options_page"];
    manifest["options_ui"] = {
        "open_in_tab": true,
        "page": "dashboard.html",
    };
    delete manifest["storage"];
    delete manifest["minimum_chrome_version"];
    manifest["applications"] = {
        "gecko": {
            "strict_min_version": "52.0",
        },
    };

    await fs.writeFile(basePath + "/manifest.json", JSON.stringify(manifest, null, 2), "utf8");

    const files = await fs.readdir("platform/webext");
    let tasks = [];
    for (let file of files) {
        if (file.endsWith(".js")) {
            tasks.push(fs.copyFile("platform/webext/" + file, basePath + "/js/" + file));
        }
    }
    await Promise.all(tasks);

    console.log("[Nano] Apply Firefox Patch :: Done");
})();
