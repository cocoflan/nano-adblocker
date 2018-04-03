/**
 * Apply patches for Edge, there is unfortunately no easy way to
 * smart-build this part.
 * Expects the extension core to be already built.
 * Because the manifest is only copied if the source has changed,
 * this script does not have to run on every debug build.
 */
"use strict";

(async () => {
    console.log("[Nano] Apply Edge Patch :: Started");

    const basePath = require("./build-engine.node.js").ezInit();
    assert(isEdge);

    let manifest = await fs.readFile(basePath + "/manifest.json", "utf8");
    manifest = JSON.parse(manifest);

    // TODO 2018-01-05: The size is wrong, but Edge does not seem to care
    manifest["icons"] = {
        "16": "img/128_on.png",
        "128": "img/128_on.png",
    };
    manifest["browser_action"]["default_icon"] = {
        "38": "img/128_on.png",
    };

    manifest["background"]["persistent"] = true;

    delete manifest["minimum_chrome_version"];
    manifest["minimum_edge_version"] = "40.15063.674.0";

    manifest["browser_specific_settings"] = {
        "edge": {
            "browser_action_next_to_addressbar": true,
        },
    };

    await fs.writeFile(basePath + "/manifest.json", JSON.stringify(manifest, null, 2), "utf8");

    const files = await fs.readdir("platform/edge");
    let tasks = [];
    for (let file of files) {
        if (file.endsWith(".js")) {
            tasks.push(fs.copyFile("platform/edge/" + file, basePath + "/js/" + file));
        }
    }
    await Promise.all(tasks);

    console.log("[Nano] Apply Edge Patch :: Done");
})();
