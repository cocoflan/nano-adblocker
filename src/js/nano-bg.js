// For background page

'use strict';

/******************************************************************************/

(function() {

/******************************************************************************/

// Patch 2017-12-08: Add automatic configuration for Nano Defender integration
vAPI.messaging.onNanoDefenderActivated(function(msg) {
    if ( 
        msg === 'Nano Defender Enabled' &&
        !nano.selectedFilterLists.includes('nano-defender')
    ) {
        nano.saveSelectedFilterLists([ 'nano-defender' ], true);
        var dispatchReload = function() {
            if ( nano.loadingFilterLists ) {
                setTimeout(dispatchReload, 500);
            } else {
                nano.loadFilterLists();
            }
        };
        dispatchReload();
    }
});

/******************************************************************************/

})();
