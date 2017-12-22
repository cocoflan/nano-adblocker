// Helper functions
"use strict";

/**
 * The assertion module.
 * @namespace
 */
global.assert = require("assert");

/**
 * Once called, further promise rejection will stop the script.
 * @function
 */
global.abortOnRejection = () => {
    process.on("unhandledRejection", (e) => {
        throw e;
    });
};

/**
 * Change the current working directory to the correct one.
 * @function
 */
global.setupCwd = () => {
    if (process.cwd().endsWith("scripts")) {
        process.chdir("..");
    }
    assert(/[\\/]NanoCore$/.test(process.cwd()));
};

/**
 * The base path for build output.
 * @const {string}
 */
global.baseBuildPath = (() => {
    let buildPath;
    switch (process.argv[2]) {
        case "--chromium":
            buildPath = "dist/build/Nano.chromium";
            break;
        case "--firefox":
            buildPath = "dist/build/Nano.firefox";
            break;
        case "--edge":
            buildPath = "dist/build/Nano.edge";
            break;
    }
    assert(buildPath !== undefined);

    return buildPath;
})();

/**
 * Do common initialization then return base build path.
 * @function
 * @return {string} Base build path.
 */
exports.ezInit = () => {
    abortOnRejection();
    setupCwd();
    return baseBuildPath;
};

/**
 * The promisified fs namespace.
 * @namespace
 */
global.fs = (() => {
    const ofs = require("fs");
    const { promisify } = require("util");
    return {
        copyFile: promisify(ofs.copyFile),
        lstat: promisify(ofs.lstat),
        mkdir: promisify(ofs.mkdir),
        readdir: promisify(ofs.readdir),
    };
})();

/**
 * Create directory if does not exist.
 * @async @function
 * @param {string} dir - The directory path.
 */
global.createDirectory = async (dir) => {
    let dirStat;
    try {
        dirStat = await fs.lstat(dir);
    } catch (e) {
        assert(e.code === "ENOENT");
        await fs.mkdir(dir);
    }
    if (dirStat) {
        assert(dirStat.isDirectory() && !dirStat.isSymbolicLink());
    }
};

/**
 * Copy source file to target and overwrite it if source file is newer.
 * @async @function
 * @param {string} source - The path to the source file.
 * @param {string} target - The path to the target file.
 */
global.smartCopyFile = async (source, target) => {
    let sourceStat, targetStat;
    try {
        [sourceStat, targetStat] = await Promise.all([
            fs.lstat(source),
            fs.lstat(target),
        ]);
    } catch (e) {
        assert(e.code === "ENOENT");
        await fs.copyFile(source, target);
        return;
    }

    // Make sure things are not obviously off
    assert(sourceStat.isFile() && !sourceStat.isSymbolicLink());
    assert(targetStat.isFile() && !targetStat.isSymbolicLink());

    const sourceTime = sourceStat.mtimeMs;
    const targetTime = targetStat.mtimeMs;
    if (sourceTime > targetTime) {
        await fs.copyFile(source, target);
    }
};

/**
 * Scan into source directory, and smart copy files into target directory.
 * @async @function
 * @param {string} source - The path to the source directory.
 * @param {string} target - The path to the target directory.
 */
global.smartCopyDirectory = async (source, target) => {
    createDirectory(target);

    const files = await fs.readdir(source);

    let tasks = [];
    for (let i = 0; i < files.length; i++) {
        tasks.push(fs.lstat(files[i]));
    }
    await Promise.all(tasks);

    let copyTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        assert(!tasks[i].isSymbolicLink());

        if (tasks[i].isDirectory()) {
            // Make sure to not get things overloaded
            await smartCopyDirectory(source + "/" + files[i], target + "/" + files[i]);
            continue;
        }

        assert(tasks[i].isFile());
        copyTasks.push(smartCopyFile(source + "/" + files[i], target + "/" + files[i]));
    }
    await Promise.all(copyTasks);
};
