/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2014-2017 The uBlock Origin authors

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

// For background page or non-background pages

'use strict';

/******************************************************************************/
/******************************************************************************/

(function(self) {

var chrome = self.chrome;

/******************************************************************************/

vAPI.setTimeout = vAPI.setTimeout || self.setTimeout.bind(self);

/******************************************************************************/

// http://www.w3.org/International/questions/qa-scripts#directions

var setScriptDirection = function(language) {
    document.body.setAttribute(
        'dir',
        ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(language) !== -1 ? 'rtl' : 'ltr'
    );
};

/******************************************************************************/

vAPI.download = function(details) {
    if ( !details.url ) {
        return;
    }

    var a = document.createElement('a');
    a.href = details.url;
    a.setAttribute('download', details.filename || '');
    a.setAttribute('type', 'text/plain');
    a.dispatchEvent(new MouseEvent('click'));
};

/******************************************************************************/

vAPI.getURL = chrome.runtime.getURL;

/******************************************************************************/

// Patch 2017-12-07: Add a couple placeholders, might need a real i18n system
// soon...
var i18nPlaceholders = {
    'genericYes': 'Yes',
    'genericNo': 'No',
    'genericOK': 'OK',
    'genericUnsavedChange': 'Do you want to leave this tab? Changes you made ' + 
        'will not be saved.',
    'genericFilterReadError': '# Could not load data, please refresh.',
    'genericDataSaveError': 'Could not save data, please try again.',
    
    
    'nanoCloudNoData': 'No cloud data',
    'nanoCloudLastSync': 'Last sync: {{device}} at {{time}}',
    'nanoCloudSyncFailed': 'Something went wrong:\n{{error}}',
    
    
    'dashboardMutexError': 'Could not obtain mutex lock, do you have another ' +
        'dashboard open?',
    
    
    'settingGeneralGroup': 'General',
    'settingUserInterfaceGroup': 'User interface',
    'settingOtherGroup': 'Other',
    
    'settingsDashboardAllowSelectionPrompt': 'Allow text selection in dashboard',
    'settingsEditorWordWrapPrompt': 'Soft wrap long lines in filter editor',
    'settingsViewerWordWrapPrompt': 'Soft wrap long lines in filter viewer',
    
    'settingDiskUsage': 'Disk usage: ',
    'settingMebibyte': ' MiB',
    'settingsLastBackedupFilePrompt': 'Last backed up file:',
    'settingsLastRestoredFilePrompt': 'Last restored file:',
    

    'advancedSettingsAboutChanges': 'Nano Adblocker has different default ' +
        'values than uBlock Origin for these settings, assetFetchTimeout ' +
        'defaults to 60 and manualUpdateAssetFetchPeriod defaults to 500.',
    'advancedPageName': 'Advanced',


    '1pResourcesReference': 'Nano Adblocker comes with two sets of resources,',
    '1pResourcesAnd': 'and',
    '1pResourcesOriginal': 'uBlock Origin Resources',
    '1pResourcesNano': 'Nano Adblocker Extra Resources',
    '1pResourcesPeriod': '.',
    '1pFilterEditorHelp': 'Nano Filter Editor is powered by Ace and most ' +
        'shortcut keys works the same.',


    'whitelistLinterAborted': 'Nano did not scan the rest of the lines ' +
        'for errors because there are too many errors.',
    'whitelistLinterTooManyWarnings': 'Nano did not scan the rest of the ' +
        'lines for warnings because there are too many warnings.',
    
    'whitelistLinterInvalidHostname': 'This host name is not valid.',
    'whitelistLinterInvalidRegExp': 'This regular expression is not valid.',
    'whitelistLinterInvalidURL': 'This URL is not valid.',
    
    'whitelistLinterSuspeciousRegExp': 'This line is treated as a regular ' +
        'expression, is that intended?',


    'matrixPageName': 'Hosts matrix',


    'aboutBasedOn': 'Based on uBlock Origin v1.14.22'
};

// Patch 2017-12-06: Patch name, this has a slight performance overhead but there
// are way too many locale files
var i18nReplaceMatcher1 = /uBlock Origin|uBlock\u2080|uBlock(?!\/)|uBO/g;
var i18nReplaceMatcher2 = /ublock/g;
vAPI.i18n = function(name, substitutions) {
    if ( i18nPlaceholders.hasOwnProperty(name) ) {
        return i18nPlaceholders[name];
    }
    
    var data;
    if ( substitutions === undefined ) {
        data = chrome.i18n.getMessage(name);
    } else {
        data = chrome.i18n.getMessage(name, substitutions);
    }
    return data
        .replace(i18nReplaceMatcher1, 'Nano')
        .replace(i18nReplaceMatcher2, 'nano');
};

setScriptDirection(vAPI.i18n('@@ui_locale'));

/******************************************************************************/

// https://github.com/gorhill/uBlock/issues/3057
// - webNavigation.onCreatedNavigationTarget become broken on Firefox when we
//   try to make the popup panel close itself using the original
//   `window.open('', '_self').close()`. 

vAPI.closePopup = function() {
    if (
        self.browser instanceof Object &&
        typeof self.browser.runtime.getBrowserInfo === 'function'
    ) {
        window.close();
        return;
    }

    // TODO: try to figure why this was used instead of a plain window.close().
    // https://github.com/gorhill/uBlock/commit/b301ac031e0c2e9a99cb6f8953319d44e22f33d2#diff-bc664f26b9c453e0d43a9379e8135c6a
    window.open('', '_self').close();
};

/******************************************************************************/

// A localStorage-like object which should be accessible from the
// background page or auxiliary pages.
// This storage is optional, but it is nice to have, for a more polished user
// experience.

// https://github.com/gorhill/uBlock/issues/2824
//   Use a dummy localStorage if for some reasons it's not available.

// https://github.com/gorhill/uMatrix/issues/840
//   Always use a wrapper to seamlessly handle exceptions

vAPI.localStorage = {
    clear: function() {
        try {
            window.localStorage.clear();
        } catch(ex) {
        }
    },
    getItem: function(key) {
        try {
            return window.localStorage.getItem(key);
        } catch(ex) {
        }
        return null;
    },
    removeItem: function(key) {
        try {
            window.localStorage.removeItem(key);
        } catch(ex) {
        }
    },
    setItem: function(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch(ex) {
        }
    }
};

/******************************************************************************/

})(this);

/******************************************************************************/
