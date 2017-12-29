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
/******************************************************************************/

// Patch 2017-12-13: Add linter for whitelist
nano.WhitelistLinter = function() {
    this.reSuspeciousRegExp = /^\/[0-9a-zA-Z-_.]+\/$/;
    
    this.reset();
};

/******************************************************************************/

nano.WhitelistLinter.prototype.reset = function() {
    this.warnings = [];
};

/******************************************************************************/

nano.WhitelistLinter.prototype.lint = function(line, lineNum) {
    if ( this.warnings.length > 100 ) {
        return;
    } else if ( this.warnings.length === 100 ) {
        this.warnings.push({
            row: lineNum,
            type: 'warning',
            text: vAPI.i18n('whitelistLinterTooManyWarnings')
        });
        return;
    }
    
    if ( this.reSuspeciousRegExp.test(line) ) {
        this.warnings.push({
            row: lineNum,
            type: 'warning',
            text: vAPI.i18n('whitelistLinterSuspeciousRegExp')
        });
    }
};

/******************************************************************************/

nano.whitelistLinter = new nano.WhitelistLinter();

/******************************************************************************/
/******************************************************************************/

// Patch 2017-12-27: Add linter for user filters
nano.FilterLinter = function() {
    this.cachedResultKey = 'nano/cache/user-filters-linting-result';
    
    this.reset();
};

/******************************************************************************/

nano.FilterLinter.prototype.reset = function() {
    // IMPORTANT! Any change in this function must be reflected in saveResult
    // and restoreResult

    // This flag will be set to true when a full user filters recompilation is
    // initiated
    this.changed = false;

    this.warnings = [];
    this.errors = [];
    
    // The first line is 0, when resetting, line number must be -1 so the first
    // line will have number 0
    this.lastLine = -1;
};

/******************************************************************************/

// Save and restore linting result to cache storage
nano.FilterLinter.prototype.saveResult = function() {
    var payload = {
        warnings: this.warnings,
        errors: this.errors,
        
        lastLine: this.lastLine
    };
    var entry = {};
    entry[this.cachedResultKey] = JSON.stringify(payload);
    
    vAPI.cacheStorage.set(entry);
};
nano.FilterLinter.prototype.restoreResult = function() {
    var that = this;
    
    var onResultLoaded = function(result) {
        // A resonable human is probably not able to add a rule through a wizard
        // within the few milliseconds it takes for this function to resolve
        //
        // However, the chance for a full user filter recompilation before this
        // function is resolved is real, this can happen when compiledMagic
        // changed or the user recompiled all filters though advanced settings
        // page
        if ( that.changed ) {
            return;
        }
        
        var payload = result[that.cachedResultKey];
        if ( !payload ) {
            return;
        }
        
        var result;
        try {
            result = JSON.parse(payload);
        } catch ( err ) {
            return;
        }
        if ( !result instanceof Object ) {
            return;
        }
        
        if ( Array.isArray(result.warnings) ) {
            that.warnings = result.warnings;
        }
        if ( Array.isArray(result.errors) ) {
            that.errors = result.errors;
        }
        if ( typeof result.lastLine === 'number' ) {
            that.lastLine = result.lastLine;
        }
    };
    
    vAPI.cacheStorage.get(this.cachedResultKey, onResultLoaded);
};
nano.FilterLinter.prototype.clearResult = function() {
    this.reset();
    vAPI.cacheStorage.remove(this.cachedResultKey);
};

/******************************************************************************/

// Add an error or warning, up to first 100 errors and 100 warnings can be
// stored
// An extra error or warning will be dispatched when the limit is hit
nano.FilterLinter.prototype.dispatchError = function(message) {
    if ( this.errors.length > 100 ) {
        return;
    } else if ( this.errors.length === 100 ) {
        this.errors.push({
            row: this.lastLine,
            type: 'error',
            text: vAPI.i18n('filterLinterTooManyErrors')
        });
        return;
    }

    this.errors.push({
        row: this.lastLine,
        type: 'error',
        text: message
    });
};
nano.FilterLinter.prototype.dispatchWarning = function(message) {
    if ( this.warnings.length > 100 ) {
        return;
    } else if ( this.warnings.length === 100 ) {
        this.warnings.push({
            row: this.lastLine,
            type: 'warning',
            text: vAPI.i18n('filterLinterTooManyWarnings')
        });
        return;
    }

    this.warnings.push({
        row: this.lastLine,
        type: 'warning',
        text: message
    });
};

/******************************************************************************/

nano.FilterLinter.prototype.lintCosmetic = function(/* TODO */) {
    // TODO
};
nano.FilterLinter.prototype.lintNetwork = function(/* TODO */) {
    // TODO
};

/******************************************************************************/

nano.filterLinter = new nano.FilterLinter();
nano.filterLinter.restoreResult();

/******************************************************************************/
/******************************************************************************/

})();
