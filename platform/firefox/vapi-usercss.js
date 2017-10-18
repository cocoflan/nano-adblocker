/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2017 Raymond Hill

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

/* global injectCSS, removeCSS */

'use strict';

// For content pages

if ( typeof vAPI === 'object' ) { // >>>>>>>> start of HUGE-IF-BLOCK

/******************************************************************************/
/******************************************************************************/

// Worst case scenario: user stylesheets are not available and cosmetic
// filtering does not work, while the rest of uBO still work fine.

var insertUserCSS = injectCSS || function(){},
    removeUserCSS = removeCSS || function(){};

/******************************************************************************/
/******************************************************************************/

vAPI.DOMFilterer = function() {
    this.commitTimer = new vAPI.SafeAnimationFrame(this.commitNow.bind(this));
    this.domIsReady = document.readyState !== 'loading';
    this.hideNodeId = vAPI.randomToken();
    this.hideNodeStylesheet = false;
    this.excludedNodeSet = new WeakSet();
    this.addedCSSRules = [];
    this.removedCSSRules = [];
    this.internalRules = new Set();

    this.userStylesheets = {
        sheets: new Set(),
        _sheetURI: '',
        _load: function() {
            if ( this.sheets.size === 0 || this._sheetURI !== '' ) { return; }
            this._sheetURI = 'data:text/css;charset=utf-8,' +
                             encodeURIComponent(Array.from(this.sheets));
            insertUserCSS(this._sheetURI);
        },
        _unload: function() {
            if ( this._sheetURI === '' ) { return; }
            removeUserCSS(this._sheetURI);
            this._sheetURI = '';
        },
        apply: function() {
            this._unload();
            this._load();
        },
        add: function(cssText) {
            if ( cssText === '' || this.sheets.has(cssText) ) { return; }
            this.sheets.add(cssText);
            this.dirty = true;
        },
        remove: function(cssText) {
            if ( this.sheets.has(cssText) === false ) { return; }
            this.sheets.delete(cssText);
            this.dirty = true;
        },
        toggle: function(state) {
            if ( this.sheets.size === 0 ) { return; }
            if ( state === undefined ) {
                state = this._sheetURI === '';
            }
            return state ? this._load() : this._unload();
        }
    };

    if ( this.domIsReady !== true ) {
        document.addEventListener('DOMContentLoaded', () => {
            this.domIsReady = true;
            this.commit();
        });
    }
};

vAPI.DOMFilterer.prototype = {
    reOnlySelectors: /\n\{[^\n]+/g,
    commitNow: function() {
        this.commitTimer.clear();
        var i, entry, ruleText;
        i = this.addedCSSRules.length;
        while ( i-- ) {
            entry = this.addedCSSRules[i];
            if ( entry.lazy !== true || this.domIsReady ) {
                ruleText = entry.selectors + '\n{ ' + entry.declarations + ' }';
                this.userStylesheets.add(ruleText);
                this.addedCSSRules.splice(i, 1);
                if ( entry.internal ) {
                    this.internalRules.add(ruleText);
                }
            }
        }
        i = this.removedCSSRules.length;
        while ( i-- ) {
            entry = this.removedCSSRules[i];
            ruleText = entry.selectors + '\n{ ' + entry.declarations + ' }';
            this.userStylesheets.remove(ruleText);
            this.internalRules.delete(ruleText);
        }
        this.removedCSSRules = [];
        this.userStylesheets.apply();
    },

    commit: function(commitNow) {
        if ( commitNow ) {
            this.commitTimer.clear();
            this.commitNow();
        } else {
            this.commitTimer.start();
        }
    },

    addCSSRule: function(selectors, declarations, details) {
        if ( selectors === undefined ) { return; }
        var selectorsStr = Array.isArray(selectors)
                ? selectors.join(',\n')
                : selectors;
        if ( selectorsStr.length === 0 ) { return; }
        this.addedCSSRules.push({
            selectors: selectorsStr,
            declarations,
            lazy: details && details.lazy === true,
            internal: details && details.internal === true
        });
        this.commit();
    },

    removeCSSRule: function(selectors, declarations) {
        var selectorsStr = Array.isArray(selectors)
                ? selectors.join(',\n')
                : selectors;
        if ( selectorsStr.length === 0 ) { return; }
        this.removedCSSRules.push({
            selectors: selectorsStr,
            declarations,
        });
        this.commit();
    },

    excludeNode: function(node) {
        this.excludedNodeSet.add(node);
        this.unhideNode(node);
    },

    hideNode: function(node) {
        if ( this.excludedNodeSet.has(node) ) { return; }
        node.setAttribute(this.hideNodeId, '');
        if ( this.hideNodeStylesheet === false ) {
            this.hideNodeStylesheet = true;
            this.addCSSRule(
                '[' + this.hideNodeId + ']',
                'display: none !important;',
                { internal: true }
            );
        }
    },

    unhideNode: function(node) {
        node.removeAttribute(this.hideNodeId);
    },

    toggle: function(state) {
        this.userStylesheets.toggle(state);
    },

    getAllDeclarativeSelectors_: function(all) {
        let selectors = [];
        for ( var sheet of this.userStylesheets.sheets ) {
            if ( all === false && this.internalRules.has(sheet) ) { continue; }
            selectors.push(
                sheet.replace(this.reOnlySelectors, ',').trim().slice(0, -1)
            );
        }
        return selectors.join(',\n');
    },

    getFilteredElementCount: function() {
        let selectors = this.getAllDeclarativeSelectors_(true);
        return selectors.length !== 0
            ? document.querySelectorAll(selectors.join('\n')).length
            : 0;
    },

    // TODO: remove CSS pseudo-classes which are incompatible with
    //       static profile.
    getAllDeclarativeSelectors: function() {
        return this.getAllDeclarativeSelectors_(false).join(',\n');
    }
};

/******************************************************************************/
/******************************************************************************/

} // <<<<<<<< end of HUGE-IF-BLOCK
