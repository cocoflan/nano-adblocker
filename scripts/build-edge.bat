@ECHO OFF

NODE build.node.js --edge
NODE pack-filters.node.js --edge
NODE pack-locale.node.js --edge

NODE build-edge.node.js --edge

PAUSE
