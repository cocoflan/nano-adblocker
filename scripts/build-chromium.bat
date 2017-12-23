@ECHO OFF

NODE build.node.js --chromium
NODE pack-filters.node.js --chromium
NODE pack-locale.node.js --chromium

NODE build-chromium.node.js --chromium

PAUSE
