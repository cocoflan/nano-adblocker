/**
 * Process and pack locale.
 * Expects the extension core to be already built.
 * Need to manually clear build output if uBOVersion changed or
 * /src/_nano-locales/en/messages.nano.js changed
 */
"use strict";

/**
 * The version of uBlock Origin that Nano Adblocker is based on.
 * @const {string}
 */
const uBOVersion = "v1.14.23.12 (with HTML filtering disabled)";

(async () => {
    console.log("[Nano] Pack Locale :: Started");

    const localePath = require("./build-engine.node.js").ezInit() + "/_locales";
    await createDirectory(localePath);

    let allKeys = [];
    let [enOriginal, enExtra] = await Promise.all([
        fs.readFile("src/_locales/en/messages.json", "utf8"),
        fs.readFile("src/_nano-locales/en/messages.nano.js", "utf8"),
    ]);
    enOriginal = JSON.parse(enOriginal);
    enExtra = eval(enExtra); // Trust me, it will be fine

    assert(enOriginal && typeof enOriginal === "object");
    assert(enExtra && typeof enExtra === "object");

    for (let key in enOriginal) {
        if (key === "dummy") {
            continue;
        }

        if (enOriginal.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            assert(enOriginal[key] && typeof enOriginal[key] === "object" && typeof enOriginal[key].message === "string");
            allKeys.push(key);
        }
    }
    for (let key in enExtra) {
        if (enExtra.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            assert(enExtra[key] && typeof enExtra[key] === "object" && typeof enExtra[key].message === "string");
            allKeys.push(key);
        }
    }

    const processOne = async (lang, hasExtra) => {
        await createDirectory(localePath + "/" + lang);

        let original, extra;
        if (hasExtra) {
            [original, extra] = await Promise.all([
                fs.readFile("src/_locales/" + lang + "/messages.json", "utf8"),
                fs.readFile("src/_nano-locales/" + lang + "/messages.nano.js", "utf8"),
            ]);
        } else {
            original = await fs.readFile("src/_locales/" + lang + "/messages.json", "utf8");
            extra = "(() => { 'use strict'; return { }; })();";
        }
        original = JSON.parse(original);
        extra = eval(extra);

        let result = {};
        for (let key of allKeys) {
            const originalHas = original.hasOwnProperty(key);
            const extraHas = extra.hasOwnProperty(key);

            assert(!originalHas || !extraHas);
            if (originalHas) {
                assert(original[key] && typeof original[key] === "object" && typeof original[key].message === "string");
                result[key] = original[key];
            } else if (extraHas) {
                assert(extra[key] && typeof extra[key] === "object" && typeof extra[key].message === "string");
                result[key] = extra[key];
            } else {
                // Fallback to English
                const originalHas = enOriginal.hasOwnProperty(key);
                const extraHas = enExtra.hasOwnProperty(key);

                assert(originalHas !== extraHas);
                if (originalHas) {
                    result[key] = enOriginal[key];
                } else {
                    result[key] = enExtra[key];
                }
            }

            result[key].message = result[key].message.replace(/uBlock Origin|uBlock\u2080|uBlock(?!\/)|uBO/g, "Nano").replace(/ublock/g, "nano");

            // Special cases
            if (key === "1pResourcesOriginal") {
                result[key].message = result[key].message.replace("Nano", "uBlock Origin");
            }
            if (key === "aboutBasedOn") {
                result[key].message = result[key].message.replace("Nano", "uBlock Origin").replace("{{@version}}", uBOVersion);
            }
        }

        await fs.writeFile(localePath + "/" + lang + "/messages.json", JSON.stringify(result, null, 2), { encoding: "utf8" });
    };

    const [langsOriginal, langsExtra] = await Promise.all([
        fs.readdir("src/_locales"),
        fs.readdir("src/_nano-locales"),
    ]);
    let tasks = [];
    for (let lang of langsOriginal) {
        if (langsExtra.includes(lang)) {
            tasks.push(smartBuildFile([
                "src/_locales/" + lang + "/messages.json",
                "src/_nano-locales/" + lang + "/messages.nano.js",
            ], localePath + "/" + lang + "/messages.json", processOne, lang, true));
        } else {
            tasks.push(smartBuildFile([
                "src/_locales/" + lang + "/messages.json",
            ], localePath + "/" + lang + "/messages.json", processOne, lang, false));
        }
    }
    await Promise.all(tasks);

    console.log("[Nano] Pack Locale :: Done");
})();
