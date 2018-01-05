# Build Instruction

Nano Adblocker uses build scripts written in JavaScript which are blazing fast and cross platform. 

To begin, you first need to install the current branch of [Node.js](https://nodejs.org/). 

Then, you need to put NanoCore and NanoFilters in the same parent directory. 

The commands below assume that you are in the `/scripts` directory, you can run the build scripts from `/` or `/scripts` of 
this repository. 

The first build can take a few seconds, subsequent builds will be much faster as the build scripts only copy files that have 
changed. Keep in mind that you may need to delete old build results if you changed the build scripts. 

The first command builds everything except filters and locales, the second and third commands build filters and locales respectively, 
and the last command applies platform specific patches. 

When coding, chances are the first command alone is enough to synchronize changes. 

The build results can be found in the `/dist/build` directory. 

## Chromium

Run the following commands: 
```bash
node build.node.js --chromium
node pack-filters.node.js --chromium
node pack-locale.node.js --chromium
node build-chromium.node.js --chromium
```

You need to run the platform specific build script when changing locales. 

## Firefox

Run the following commands: 
```bash
node build.node.js --firefox
node pack-filters.node.js --firefox
node pack-locale.node.js --firefox
node build-firefox.node.js --firefox
```

You need to run the platform specific build script when changing vAPI scripts or the manifest. 

### Nano Defender for Firefox

The Firefox version of Nano Defender can be built with `node build-defender.node.js --firefox`. The Chromium version uses different 
build scripts which can be found in the `/Continuous Integration` directory of NanoDefender repository. You need to put NanoCore 
and NanoDefender in the same parent directory. 

## Edge

Run the following commands: 
```bash
node build.node.js --edge
node pack-filters.node.js --edge
node pack-locale.node.js --edge
node build-edge.node.js --edge
```

You need to run the platform specific build script when changing vAPI scripts or the manifest. 

### Packaging

Packaging on other platform involve simply zipping the build folder, however, it is a bit more complex for Edge. After packaging 
the structure of build directory will become corrupted as seen by build scripts, you need to manually clean up build files after 
packaging, you only need to package if you are publishing to Microsoft Store. 

First, you need to install the latest current branch of [Node.js](https://nodejs.org/en/), then open an elevated PowerShell prompt 
and run the following command: 
```PowerShell
npm install -g manifoldjs
```

Navigate to the build directory of Edge, open a PowerShell prompt and run the following command: 
```
manifoldjs -l debug -p edgeextension -f edgeextension -m Nano_Edge/manifest.json
```
