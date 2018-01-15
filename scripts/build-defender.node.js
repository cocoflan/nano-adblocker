/**
 * Build Nano Defender in release mode.
 * NanoDefender must be in the same parent directory as NanoCore.
 */
"use strict";

(async () => {
    console.log("[Nano] Build Defender :: Started");

    const buildPath = require("./build-engine.node.js").ezInit() + "_Defender";
    assert(isFirefox || isEdge);

    let repository = "NanoDefender";
    if (process.argv.includes("--use-ubr-repository")) {
        // Undocumented internal option
        repository = "uBlockProtector";
    }

    await smartCopyDirectory("../" + repository + "/Extension Compiler/Extension", buildPath);

    // This is not beautiful, but good enough
    await fs.copyFile("../" + repository + "/Extension Compiler/Extension/common.js", buildPath + "/common.js");
    if (isFirefox) {
        await fs.appendFile(buildPath + "/common.js", "\na.isFirefox = true;\na.debugMode = false;\n", { encoding: "utf8" });
    } else {
        await fs.appendFile(buildPath + "/common.js", "\na.isEdge = true;\na.debugMode = false;\n", { encoding: "utf8" });
    }

    let manifest = await fs.readFile(buildPath + "/manifest.json", "utf8");
    manifest = JSON.parse(manifest);

    manifest["description"] = "An anti-adblock defuser for Nano Adblocker";
    manifest["homepage_url"] = "https://github.com/NanoAdblocker/NanoDefender/";
    delete manifest["minimum_chrome_version"];
    if (isFirefox) {
        manifest["applications"] = {
            "gecko": {
                "strict_min_version": "57.0",
            },
        };
    } else {
        // TODO 2018-01-05: The size is wrong, but Edge does not seem to care
        manifest["icons"] = {
            "16": "icon128.png",
            "128": "icon128.png",
        };
        manifest["browser_action"]["default_icon"] = {
            "38": "icon128.png",
        };

        manifest["background"]["persistent"] = true;
        manifest["minimum_edge_version"] = "40.15063.674.0";

        manifest["browser_specific_settings"] = {
            "edge": {
                "browser_action_next_to_addressbar": false,
            },
        };
    }

    await fs.writeFile(buildPath + "/manifest.json", JSON.stringify(manifest, null, 2), "utf8");

    console.log("[Nano] Build Defender :: Done");
})();
