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

// Patch 2017-12-13: Add linter for white list
nano.WhitelistLinter = function() {
    this.warnings = [];
    
    this.reSuspeciousRegExp = /^\/[0-9a-zA-Z-_.]+\/$/;
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
/******************************************************************************/

nano.whitelistLinter = new nano.WhitelistLinter();

/******************************************************************************/

})();
