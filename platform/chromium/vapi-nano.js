'use strict';

(function(self) {

/******************************************************************************/

// Patch 2017-12-06: Make dashboard full tab
vAPI.openHere = function(path) {
    if ( chrome.tabs !== undefined ) {
        chrome.tabs.update({ url: path });
    }
};

/******************************************************************************/

// Patch 2017-12-09: Make back button properly return to extension manager
vAPI.extensionManager = 'chrome://extensions/';

/******************************************************************************/

})(this);
