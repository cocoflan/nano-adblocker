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

/* global uDom, uBlockDashboard */

/******************************************************************************/

(function() {

'use strict';

/******************************************************************************/

var messaging = vAPI.messaging,
    cachedWhitelist = '';

/******************************************************************************/

// Patch 2017-12-12: Change textarea to IDE, and clearly mark lines that are bad
var editor = nanoIDE.init('whitelist', false, false);

/******************************************************************************/

var whitelistChanged = (function() {
    var changedWhitelist, notChanged, timer;
    
    var errMsg = vAPI.i18n('whitelistTooltipGenericError');

    var updateUI = function(badLines) {
        uDom.nodeFromId('whitelistRevert').disabled = notChanged;
        
        if ( badLines.errors.length === 0 ) {
            uDom.nodeFromId('whitelistApply').disabled = notChanged;
        } else {
            uDom.nodeFromId('whitelistApply').disabled = true;
        }

        editor.session.setAnnotations(badLines.errors.concat(badLines.warnings));
    };

    var validate = function() {
        timer = undefined;
        messaging.send(
            'dashboard',
            { what: 'validateWhitelistString', raw: changedWhitelist },
            updateUI
        );
    };

    return function() {
        changedWhitelist = nanoIDE.getLinuxValue().trim();
        notChanged = changedWhitelist === cachedWhitelist;
        if ( timer !== undefined ) { clearTimeout(timer); }
        timer = vAPI.setTimeout(validate, 250);
    };
})();

/******************************************************************************/

var renderWhitelist = function() {
    var onRead = function(whitelist) {
        cachedWhitelist = whitelist.trim();
        nanoIDE.setValueFocus(cachedWhitelist + '\n');
        whitelistChanged();
    };
    messaging.send('dashboard', { what: 'getWhitelist' }, onRead);
};

/******************************************************************************/

var handleImportFilePicker = function() {
    var fileReaderOnLoadHandler = function() {
        nanoIDE.setValueFocus(nanoIDE.getLinuxValue().trim() + '\n' + this.result.trim());
        whitelistChanged();
    };
    var file = this.files[0];
    if ( file === undefined || file.name === '' ) {
        return;
    }
    if ( file.type.indexOf('text') !== 0 ) {
        return;
    }
    var fr = new FileReader();
    fr.onload = fileReaderOnLoadHandler;
    fr.readAsText(file);
};

/******************************************************************************/

var startImportFilePicker = function() {
    var input = document.getElementById('importFilePicker');
    // Reset to empty string, this will ensure an change event is properly
    // triggered if the user pick a file, even if it is the same as the last
    // one picked.
    input.value = '';
    input.click();
};

/******************************************************************************/

var exportWhitelistToFile = function() {
    var val = nanoIDE.getLinuxValue().trim();
    if ( val === '' ) { return; }
    var filename = vAPI.i18n('whitelistExportFilename')
        .replace('{{datetime}}', uBlockDashboard.dateNowToSensibleString())
        .replace(/ +/g, '_');
    vAPI.download({
        'url': 'data:text/plain;charset=utf-8,' + encodeURIComponent(val + '\n'),
        'filename': filename
    });
};

/******************************************************************************/

var applyChanges = function() {
    cachedWhitelist = nanoIDE.getLinuxValue().trim();
    var request = {
        what: 'setWhitelist',
        whitelist: cachedWhitelist
    };
    messaging.send('dashboard', request, renderWhitelist);
};

var revertChanges = function() {
    nanoIDE.setValueFocus(cachedWhitelist + '\n');
    whitelistChanged();
};

/******************************************************************************/

var getCloudData = function() {
    return nanoIDE.getLinuxValue();
};

var setCloudData = function(data, append) {
    if ( typeof data !== 'string' ) {
        return;
    }
    if ( append ) {
        data = uBlockDashboard.mergeNewLines(nanoIDE.getLinuxValue().trim(), data);
    }
    nanoIDE.setValueFocus(data.trim() + '\n');
    whitelistChanged();
};

self.cloud.onPush = getCloudData;
self.cloud.onPull = setCloudData;

/******************************************************************************/

uDom('#importWhitelistFromFile').on('click', startImportFilePicker);
uDom('#importFilePicker').on('change', handleImportFilePicker);
uDom('#exportWhitelistToFile').on('click', exportWhitelistToFile);
uDom('#whitelistApply').on('click', applyChanges);
uDom('#whitelistRevert').on('click', revertChanges);
editor.session.on('change', whitelistChanged)

renderWhitelist();

/******************************************************************************/

})();
