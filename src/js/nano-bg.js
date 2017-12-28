/*******************************************************************************

    Nano Adblocker - Just another adblocker
    Copyright (C) 2017 Nano Adblocker contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/NanoAdblocker/NanoCore
*/

// For background page

'use strict';

/******************************************************************************/

(function() {

/******************************************************************************/

// Patch 2017-12-08: Add automatic configuration for Nano Defender integration
vAPI.messaging.onNanoDefenderConnection(function(msg) {
    if ( msg === 'Nano Defender Enabled' ) {
        var performConfiguration = function() {
            if ( nano.selectedFilterLists.includes('nano-defender') ) {
                return;
            }
            
            // Make sure to keep this fixed:
            // https://github.com/NanoAdblocker/NanoCore/issues/49
            if ( !nano.selectedFilterListsLoaded ) {
                setTimeout(performConfiguration, 500);
                return;
            }
            
            // An extra check to be absolutely sure
            if ( nano.selectedFilterLists.length === 0 ) {
                return;
            }
            
            nano.saveSelectedFilterLists([ 'nano-defender' ], true);
            var dispatchReload = function() {
                if ( nano.loadingFilterLists ) {
                    setTimeout(dispatchReload, 500);
                } else {
                    nano.loadFilterLists();
                }
            };
            dispatchReload();
        };
        performConfiguration();
    }
});

/******************************************************************************/

// Patch 2017-12-08: Add mutex lock for dashboard
nano.currentDashboardMutexTabID = null;
nano.getDashboardMutex = function(sender) {
    var id = sender.tab.id;

    // Refresh?
    if ( id === nano.currentDashboardMutexTabID ) {
        return true;
    }
    
    // First time opened?
    if ( nano.currentDashboardMutexTabID === null ) {
        nano.currentDashboardMutexTabID = id;
        return true;
    }

    // Last one closed?
    var page = nano.pageStoreFromTabId(nano.currentDashboardMutexTabID);
    if ( !page ) {
        nano.currentDashboardMutexTabID = id;
        return true;
    }
    
    // Last one navigated away?
    if ( NanoReIsDashboardURL.test(page.rawURL) ) {
        return false;
    } else {
        nano.currentDashboardMutexTabID = id;
        return true;
    }
};

/******************************************************************************/

// Patch 2017-12-26: Mark some filter lists as privileged
nano.privilegedFiltersAssetKeys = [
    'nano-filters',
    'nano-timer',
    'nano-annoyance',
    'nano-whitelist',
    'nano-defender'
];

/******************************************************************************/

// Patch 2017-12-25: Add compile flags
nano.compileFlags = {
    firstParty: false,
    isPartial: false,
    
    isPrivileged: false,
    
    keepSlowFilters: false,
    strip3pWhitelist: false
};

/******************************************************************************/

// Patch 2017-12-26: Add force recompile to advanced settings dashboard
nano.nanoForceRecompile = function() {
    vAPI.storage.set({
        'compiledMagic': '',
        'selfieMagic': ''
    });
    vAPI.app.restart();
};

/******************************************************************************/

})();
