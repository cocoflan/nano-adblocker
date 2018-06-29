/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2014-2016 Raymond Hill

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

    Home: https://github.com/gorhill/uBlock
*/

/* global uDom */

/******************************************************************************/

(function() {

'use strict';

/******************************************************************************/

// Patch 2018-01-06: User filters can be an empty file, make it a special case
// and do not show the error message
var currentAsset = "";

/******************************************************************************/

var onAssetContentReceived = function(details) {
    if ( details && details.content ) {
        if ( !details.content.endsWith('\n') ) {
            details.content += '\n';
        }
        nanoIDE.setValueFocus(details.content, -1);
    } else {
        nanoIDE.setValueFocus('', -1);
        if ( currentAsset !== 'user-filters' ) {
            nanoIDE.editor.session.setAnnotations([{
                row: 0,
                type: 'error',
                text: vAPI.i18n('genericFilterReadError')
            }]);
        }
    }
};

/******************************************************************************/

// Patch 2018-01-01: Read line wrap settings
var onLineWrapSettingsReceived = function(lineWrap) {
    nanoIDE.setLineWrap(lineWrap === true);
    
    var q = window.location.search;
    var matches = q.match(/^\?url=([^&]+)/);
    if ( !matches || matches.length !== 2 ) {
        // Patch 2018-01-06: Display an error
        onAssetContentReceived();
        return;
    }
    currentAsset = matches[1];

    vAPI.messaging.send(
        'default',
        {
            what: 'getAssetContent',
            url: decodeURIComponent(currentAsset)
        },
        onAssetContentReceived
    );
};

/******************************************************************************/

// Patch 2018-01-01: Read line wrap settings
nanoIDE.init('content', true, true);
vAPI.messaging.send(
    'dashboard',
    {
        what: 'userSettings',
        name: 'nanoViewerWordSoftWrap'
    },
    onLineWrapSettingsReceived
);

/******************************************************************************/

})();
