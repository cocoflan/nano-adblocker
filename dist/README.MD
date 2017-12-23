# Build Instruction

Nano Adblocker uses cross platform build scripts written in JavaScript. 

To begin, you first need to install the current branch of [Node.js](https://nodejs.org/). 

The following commands assumes you are in the `/scripts` directory, you can run the build scripts from `/` or `/scripts` of 
the repository. 

The first build can take a few seconds, subsequent builds will be much faster as the build script only copies files that have 
changed. When coding, chances are the first command alone is enough to synchronize changes. 

## Chromium

Run the following commands: 
```bash
node build.node.js --chromium
node pack-filters.node.js --chromium
node pack-locale.node.js --chromium
node build-chromium.node.js --chromium
```

## Firefox

Run the following commands: 
```bash
node build.node.js --firefox
node pack-filters.node.js --firefox
node pack-locale.node.js --firefox
node build-firefox.node.js --firefox
```

The Firefox version of Nano Defender can be built with `node build-defender.node.js --firefox`. The Chromium version uses another 
build scripts which can be found in the `/Continuous Integration` directory of Nano Defender repository. 
