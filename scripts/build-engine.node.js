/**
 * Build engine library, all scripts depending on this one assume to be
 * executed either at / or /scripts of NanoCore.
 *
 * node <build-script> <platform> [--trace-fs]
 * Available build scripts: look into /scripts directory
 * Available platforms: --chromium, --firefox, --edge
 * Optionally log all file system calls
 */
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
 * Find the base path for build output.
 * @function
 * @return {string} The base path for build output.
 */
global.baseBuildPath = () => {
    global.isChrome = global.isFirefox = global.isEdge = false;

    let buildPath;
    switch (process.argv[2]) {
        case "--chromium":
            buildPath = "dist/build/Nano_Chromium";
            global.isChrome = true;
            break;
        case "--firefox":
            buildPath = "dist/build/Nano_Firefox";
            global.isFirefox = true;
            break;
        case "--edge":
            buildPath = "dist/build/Nano_Edge";
            global.isEdge = true;
            break;
    }
    assert(buildPath !== undefined);

    return buildPath;
};

/**
 * Do common initialization then return base build path.
 * @function
 * @return {string} Base build path.
 */
exports.ezInit = (() => {
    let initialized = false;
    return () => {
        if (!initialized) {
            initialized = true;
            abortOnRejection();
            setupCwd();
        }
        return baseBuildPath();
    };
})();

/**
 * The promisified fs namespace.
 * @namespace
 */
global.fs = (() => {
    const ofs = require("fs");
    const { promisify } = require("util");

    const newfs = {
        copyFile: promisify(ofs.copyFile),
        lstat: promisify(ofs.lstat),
        mkdir: promisify(ofs.mkdir),
        readdir: promisify(ofs.readdir),
        readFile: promisify(ofs.readFile),
        writeFile: promisify(ofs.writeFile),
    };

    if (process.argv.includes("--trace-fs")) {
        return {
            copyFile: (...args) => {
                console.log("[Nano] TraceFS :: copyFile", args);
                return newfs.copyFile(...args);
            },
            lstat: (...args) => {
                console.log("[Nano] TraceFS :: lstat", args);
                return newfs.lstat(...args);
            },
            mkdir: (...args) => {
                console.log("[Nano] TraceFS :: mkdir", args);
                return newfs.mkdir(...args);
            },
            readdir: (...args) => {
                console.log("[Nano] TraceFS :: readdir", args);
                return newfs.readdir(...args);
            },
            readFile: (...args) => {
                console.log("[Nano] TraceFS :: readFile", args);
                return newfs.readFile(...args);
            },
            writeFile: (...args) => {
                console.log("[Nano] TraceFS :: writeFile", args);
                return newfs.writeFile(...args);
            },
        }
    } else {
        return newfs;
    }
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
 * Call a function if output is outdated.
 * @async @function
 * @param {Array.<string>} dependencies - Paths to dependencies of the output file.
 * @param {string} output - The path to the output file.
 * @param {AsyncFunction} build - The build function.
 * @param {...Any} [passback=undefined] - The argument to pass back to the build function.
 */
global.smartBuildFile = async (dependencies, output, build, ...passback) => {
    let stats = [];
    for (let dependency of dependencies) {
        stats.push(fs.lstat(dependency));
    }
    stats.push(fs.lstat(output));

    let dependenciesStat, outputStat;
    try {
        dependenciesStat = await Promise.all(stats);
        outputStat = dependenciesStat.pop();
    } catch (e) {
        assert(e.code === "ENOENT");
        await build(...passback);
        return;
    }

    assert(outputStat.isFile() && !outputStat.isSymbolicLink());
    let mustRebuild = false;
    for (let dependencyStat of dependenciesStat) {
        assert(dependencyStat.isFile() && !dependencyStat.isSymbolicLink());
        if (dependencyStat.mtimeMs > outputStat.mtimeMs) {
            mustRebuild = true;
            // Do not break, as we need to assert the rest of the files
        }
    }

    if (mustRebuild) {
        await build(...passback);
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

    assert(sourceStat.isFile() && !sourceStat.isSymbolicLink());
    assert(targetStat.isFile() && !targetStat.isSymbolicLink());

    if (sourceStat.mtimeMs > targetStat.mtimeMs) {
        await fs.copyFile(source, target);
    }
};

/**
 * Scan into source directory, and smart copy files into target directory.
 * @async @function
 * @param {string} source - The path to the source directory.
 * @param {string} target - The path to the target directory.
 * @param {boolean} [deep=true] - Whether subdirectories should be copied too.
 */
global.smartCopyDirectory = async (source, target, deep = true) => {
    await createDirectory(target);

    const files = await fs.readdir(source);

    let tasks = [];
    for (let i = 0; i < files.length; i++) {
        tasks.push(fs.lstat(source + "/" + files[i]));
    }
    tasks = await Promise.all(tasks);
    assert(files.length === tasks.length);

    let copyTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        assert(!tasks[i].isSymbolicLink());

        if (tasks[i].isDirectory()) {
            if (deep) {
                // Make sure to not get things overloaded
                await smartCopyDirectory(source + "/" + files[i], target + "/" + files[i]);
            }
            continue;
        }

        assert(tasks[i].isFile());
        copyTasks.push(smartCopyFile(source + "/" + files[i], target + "/" + files[i]));
    }
    await Promise.all(copyTasks);
};
