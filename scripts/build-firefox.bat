@ECHO OFF

NODE build.node.js --firefox
NODE pack-filters.node.js --firefox
NODE pack-locale.node.js --firefox

NODE build-firefox.node.js --firefox

PAUSE
