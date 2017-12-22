/**
 * Process and pack locale.
 * Expectes the extension core is already built.
 */
"use strict";

(async () => {
    console.log("[Nano] Pack Locale :: Started");

    const localePath = require("./build-engine.node.js").ezInit() + "/_locales";
    createDirectory(localePath);

    let allKeys = [];
    let [original, extra] = await Promise.all([
        fs.readFile("src/_locales/en/messages.json", "utf8"),
        fs.readFile("src/_nano-locales/en/messages.json", "utf8"),
    ]);
    original = JSON.parse(original);
    extra = JSON.parse(extra);

    assert(original && typeof original === "object");
    assert(extra && typeof extra === "object");

    for (let key in original) {
        if (original.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            allKey.push(key);
        }
    }
    for (let key in extra) {
        if (original.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            allKey.push(key);
        }
    }

    console.log(allKeys);

    console.log("[Nano] Pack Locale :: Done");
})();
