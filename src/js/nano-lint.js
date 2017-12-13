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
