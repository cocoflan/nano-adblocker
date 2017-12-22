/**
 * Process and pack locale.
 * Expectes the extension core is already built.
 */
"use strict";

(async () => {
    console.log("[Nano] Pack Locale :: Started");

    const localePath = require("./build-engine.node.js").ezInit() + "/_locales";
    await createDirectory(localePath);

    let allKeys = [];
    let [enOriginal, enExtra] = await Promise.all([
        fs.readFile("src/_locales/en/messages.json", "utf8"),
        fs.readFile("src/_nano-locales/en/messages.json", "utf8"),
    ]);
    enOriginal = JSON.parse(enOriginal);
    enExtra = JSON.parse(enExtra);

    assert(enOriginal && typeof enOriginal === "object");
    assert(enExtra && typeof enExtra === "object");

    for (let key in enOriginal) {
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

    const processOne = async (lang) => {
        await createDirectory(localePath + "/" + lang);

        // Outdate check should be already done
        let [orignal, extra] = await Promise.all([
            fs.readFile("src/_locales/" + lang + "/messages.json", "utf8"),
            fs.readFile("src/_nano-locales/" + lang + "/messages.json", "utf8"),
        ]);
        original = JSON.parse(original);
        extra = JSON.parse(extra);

        let result = {};
        for (let key of allKeys) {
            const originalHas = original.hasOwnProperty(key);
            const extraHas = extra.hasOwnProperty(key);

            assert(!originalHas || !extraHas);
            if (originalHas) {
                assert(orignal[key] && typeof orignal[key] === "object" && typeof orignal[key].message === "string");
                result[key] = orignal[key];
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
        }

        await fs.writeFile(localePath + "/" + lang + "/messages.json", JSON.stringify(result), { encoding: "utf8" });
    };

    const [langsOriginal, langsExtra] = await Promise.all([
        fs.readdir("src/_locales"),
        fs.readdir("src/_nano-locales"),
    ]);
    let tasks = [];
    for (let lang in langsOriginal) {
        if (langsExtra.includes(lang)) {
            tasks.push(smartBuildFile([
                "src/_locales/" + lang + "/messages.json",
                "src/_nano-locales/" + lang + "/messages.json",
            ], localePath + "/" + lang + "/messages.json", processOne, lang));
        } else {
            tasks.push(smartBuildFile([
                "src/_locales/" + lang + "/messages.json",
            ], localePath + "/" + lang + "/messages.json", processOne, lang));
        }
    }
    await Promise.all(tasks);

    console.log("[Nano] Pack Locale :: Done");
})();
