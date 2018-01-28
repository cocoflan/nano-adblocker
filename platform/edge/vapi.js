/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2017 The uBlock Origin authors

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

'use strict';

/* global HTMLDocument, XMLDocument */

// For background page, auxiliary pages, and content scripts.

/******************************************************************************/

// https://bugzilla.mozilla.org/show_bug.cgi?id=1408996#c9
var vAPI = window.vAPI; // jshint ignore:line

// https://github.com/chrisaljoudi/uBlock/issues/464
// https://github.com/chrisaljoudi/uBlock/issues/1528
//   A XMLDocument can be a valid HTML document.

// https://github.com/gorhill/uBlock/issues/1124
//   Looks like `contentType` is on track to be standardized:
//   https://dom.spec.whatwg.org/#concept-document-content-type

// https://forums.lanik.us/viewtopic.php?f=64&t=31522
//   Skip text/plain documents.

if (
    (document instanceof HTMLDocument ||
      document instanceof XMLDocument &&
      document.createElement('div') instanceof HTMLDivElement
    ) &&
    (/^image\/|^text\/plain/.test(document.contentType || '') === false)
) {
    vAPI = window.vAPI = vAPI instanceof Object && vAPI.uBO === true
        ? vAPI
        : { uBO: true };
}

/******************************************************************************/

// Patch 2018-01-05: Add compatibility shims

// Works fine so far, must not delete 'browser' as it craches Microsoft's code
// Might have some problems with code that depends on the difference between
// 'chrome' and 'browser'
self.edge = self.chrome || {};
self.chrome = self.browser;

// Edge does not accept 'fullwide' and inserts weird Unicode character that
// breaks the syntax highlighter
(function() {
    var _toLocaleString = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args[0] === 'fullwide') {
            args.shift();
        }
        return _toLocaleString.apply(this, args).replace(/\u200E|\u200F/g, '');
    };
})();

// Edge returns a weird DOM object instead of something iterable
(function() {
    var _querySelectorAll = document.querySelectorAll;
    document.querySelectorAll = function () {
        var result = _querySelectorAll.apply(this, arguments);
        return Array.prototype.slice.call(result);
    };
})();
(function() {
    var _querySelectorAll = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function () {
        var result = _querySelectorAll.apply(this, arguments);
        return Array.prototype.slice.call(result);
    };
})();

// Patch 2018-01-27: Hotfix for fetch, I know this fix is disgusting, but it
// gets the job done I will get a proper shim working in the near future
window.econfig = {};
window.econfig.dateStripMarks = true;
window.econfig.fetchAware = false;
if (window.chrome.webRequest) {
    window.chrome.webRequest.ResourceType = {
        "MAIN_FRAME": "main_frame",
        "SUB_FRAME": "sub_frame",
        "STYLESHEET": "stylesheet",
        "SCRIPT": "script",
        "IMAGE": "image",
        // "FONT": "font", // Not available as of 41
        "OBJECT": "object",
        "XMLHTTPREQUEST": "xmlhttprequest",
        "FETCH": "fetch", // Not available as of 40, available in 41, but not Chromium
        "PING": "ping",
        // "CSP_REPORT": "csp_report", // Not available as of 41
        // "MEDIA": "media", // Not available as of 41
        // "WEBSOCKET": "websocket", // Not available as of 41
        "OTHER": "other",
    };
    (() => {
        const _addListener = window.chrome.webRequest.onBeforeRequest.addListener;
        window.chrome.webRequest.onBeforeRequest.addListener = (callback, filter, opt_extraInfoSpec) => {
            if (!window.econfig.fetchAware) {
                if (filter && filter.types) {
                    if (filter.types.includes("xmlhttprequest")) {
                        filter.types.push("fetch");
                    }
                }
                const _callback = callback;
                callback = (details) => {
                    if (details.type === "fetch") {
                        details.type = "xmlhttprequest";
                    }
                    return _callback(details);
                };
            }
            try {
                _addListener(callback, filter, opt_extraInfoSpec);
            } catch (err) {
                console.warn("chrome.webRequest.onBeforeRequest: Crash prevented\n", err);
            }
        };
    })();
    (() => {
        const _addListener = window.chrome.webRequest.onBeforeSendHeaders.addListener;
        window.chrome.webRequest.onBeforeSendHeaders.addListener = (callback, filter, opt_extraInfoSpec) => {
            try {
                _addListener(callback, filter, opt_extraInfoSpec);
            } catch (err) {
                console.warn("chrome.webRequest.onBeforeSendHeaders: Crash prevented\n", err);
            }
        };
    })();
}

/******************************************************************************/
