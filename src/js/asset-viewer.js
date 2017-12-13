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

var onAssetContentReceived = function(details) {
    nanoIDE.init('content', true, true);
    if ( details && details.content ) {
        nanoIDE.setValueFocus(details.content, -1);
    } else {
        // TODO 2017-12-12: Maybe add an error message?
        // Or keep it empty but annotate the line as error?
        nanoIDE.setValueFocus('', -1);
    }
};

/******************************************************************************/

var q = window.location.search;
var matches = q.match(/^\?url=([^&]+)/);
if ( !matches || matches.length !== 2 ) {
    return;
}

vAPI.messaging.send(
    'default',
    {
        what : 'getAssetContent',
        url: decodeURIComponent(matches[1])
    },
    onAssetContentReceived
);

/******************************************************************************/

})();
