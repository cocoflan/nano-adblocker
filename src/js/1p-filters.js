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

// Patch 2017-12-06: Add syntax highlighting
ace.define('ace/mode/nano_filters', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextMode = ace.require('ace/mode/text').Mode;
    var HighlightRules = ace.require('ace/mode/nano_filters_hr').HighlightRules;
    exports.Mode = function() {
        this.HighlightRules = HighlightRules;
    };
    oop.inherits(exports.Mode, TextMode);
});
ace.define('ace/mode/nano_filters_hr', function(require, exports, module) {
    const oop = ace.require('ace/lib/oop');
    const TextHighlightRules = ace.require('ace/mode/text_highlight_rules')
        .TextHighlightRules;
    exports.HighlightRules = function() {
        this.$rules = {
            start: [
                //Comments
                {
                    token: 'comment',
                    regex: /^! === /,
                    next: 'header'
                },
                {
                    // TODO 2017-12-06: Inline comments are only allowed for
                    // network filter
                    token: 'comment.line',
                    regex: /^(?:!|# |\[).*/
                },
                //CSS
                {
                    token: 'keyword.control',
                    regex: /#@?\$?#/,
                    next: 'double_hash'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /^@@|\||,|\^|\*/
                },
                //Options
                {
                    token: 'invalid.illegal',
                    regex: /\$,/,
                    next: 'options'
                },
                {
                    token: 'keyword.control',
                    regex: /\$/,
                    next: 'options'
                },
                //Domains (default)
                {
                    defaultToken: 'string.unquoted'
                }
            ],
            header: [
                //Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                //NSFW flag
                {
                    token: 'keyword.other',
                    regex: /NSFW!/
                },
                //Header text (default)
                {
                    defaultToken: 'text'
                }
            ],
            double_hash: [
                //Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Script inject
                {
                    token: 'keyword.control',
                    regex: /script:inject\(/,
                    next: 'script_inject_part1'
                },
                //CSS (default)
                {
                    defaultToken: 'constant.character'
                }
            ],
            script_inject_part1: [
                //Exit
                {
                    // TODO 2017-12-07: Is this right? Need to investigate how
                    // uBlock Origin process commas
                    token: 'invalid.illegal',
                    regex: /,\)?$/,
                    next: 'start'
                },
                {
                    token: 'keyword.control',
                    regex: /\)$/,
                    next: 'start'
                },
                {
                    //Unexpected line break
                    token: 'invalid.illegal',
                    regex: /.?$/,
                    next: 'start'
                },
                //Parameters
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'script_inject_part2'
                },
                //Scriplet name (default)
                {
                    defaultToken: 'variable.other'
                }
            ],
            script_inject_part2: [
                //Exit
                {
                    //Missing parentheses
                    token: 'invalid.illegal',
                    regex: /[^\)]?$/,
                    next: 'start'
                },
                {
                    token: 'keyword.control',
                    regex: /\)$/,
                    next: 'start'
                },
                //Parameters (default)
                {
                    defaultToken: 'constant.character'
                }
            ],
            options: [
                //Exit
                {
                    token: 'invalid.illegal',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                //Modifiers
                {
                    token: 'keyword.control',
                    regex: /document|~?first-party|~?third-party|important|badfilter/
                },
                //Actions
                {
                    token: 'variable.other',
                    regex: /popup|popunder|generichide|inline-script/
                },
                //Types
                {
                    //Compatible layer
                    token: 'variable.parameter',
                    regex: /beacon|ping|elemhide|object-subrequest/
                },
                {
                    //Resource type
                    token: 'variable.parameter',
                    regex: /~?(?:font|image|media|object|script|stylesheet|subdocument|xmlhttprequest)/
                },
                {
                    //Special types
                    token: 'variable.parameter',
                    regex: /websocket|webrtc|data|other/
                },
                //Redirect
                {
                    token: 'keyword.language',
                    regex: /redirect=/,
                    next: 'options_redirect'
                },
                //Domains restriction
                {
                    token: 'keyword.language',
                    regex: /domain=/,
                    next: 'options_domain'
                },
                //CSP
                {
                    token: 'keyword.language',
                    regex: /csp=/,
                    next: 'options_csp'
                },
                {
                    token: 'keyword.language',
                    regex: /csp/
                },
                //Invalid (default)
                {
                    defaultToken: 'invalid.illegal'
                }
            ],
            options_redirect: [
                //Exit
                {
                    token: 'invalid.illegal',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                //Redirect resource name (default)
                {
                    defaultToken: 'variable.language',
                }
            ],
            options_domain: [
                //Exit
                {
                    token: 'invalid.illegal',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                //Domains (default)
                {
                    defaultToken: 'string.unquoted'
                }
            ],
            options_csp: [
                //Exit
                {
                    token: 'invalid.illegal',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                //Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                //CSP text (default)
                {
                    defaultToken: 'constant.character'
                }
            ]
        };
    };
    oop.inherits(exports.HighlightRules, TextHighlightRules);
});

/******************************************************************************/

var editor = ace.edit('userFilters');
editor.getSession().setMode('ace/mode/nano_filters');
editor.$blockScrolling = Infinity;

/******************************************************************************/

var messaging = vAPI.messaging;
var cachedUserFilters = '';

/******************************************************************************/

// This is to give a visual hint that the content of user blacklist has changed.

function userFiltersChanged(changed) {
    if ( typeof changed !== 'boolean' ) {
        changed = editor.getValue().trim() !== cachedUserFilters;
    }
    uDom.nodeFromId('userFiltersApply').disabled = !changed;
    uDom.nodeFromId('userFiltersRevert').disabled = !changed;
}

/******************************************************************************/

// TODO 2017-12-06: Find out what is the purpose of the parameter first
function renderUserFilters(first) {
    var onRead = function(details) {
        if ( details.error ) { return; }
        cachedUserFilters = details.content.trim();
        if ( first ) {
            editor.setValue(details.content + '\n', 1);
            editor.focus();
        } else {
            editor.setValue(details.content, 1);
        }
        editor.renderer.scrollCursorIntoView();
        userFiltersChanged(false);
    };
    messaging.send('dashboard', { what: 'readUserFilters' }, onRead);
}

/******************************************************************************/

function allFiltersApplyHandler() {
    messaging.send('dashboard', { what: 'reloadAllFilters' });
    uDom('#userFiltersApply').prop('disabled', true );
}

/******************************************************************************/

var handleImportFilePicker = function() {
    // https://github.com/chrisaljoudi/uBlock/issues/1004
    // Support extraction of filters from ABP backup file
    var abpImporter = function(s) {
        var reAbpSubscriptionExtractor = /\n\[Subscription\]\n+url=~[^\n]+([\x08-\x7E]*?)(?:\[Subscription\]|$)/ig;
        var reAbpFilterExtractor = /\[Subscription filters\]([\x08-\x7E]*?)(?:\[Subscription\]|$)/i;
        var matches = reAbpSubscriptionExtractor.exec(s);
        // Not an ABP backup file
        if ( matches === null ) {
            return s;
        }
        // 
        var out = [];
        var filterMatch;
        while ( matches !== null ) {
            if ( matches.length === 2 ) {
                filterMatch = reAbpFilterExtractor.exec(matches[1].trim());
                if ( filterMatch !== null && filterMatch.length === 2 ) {
                    out.push(filterMatch[1].trim().replace(/\\\[/g, '['));
                }
            }
            matches = reAbpSubscriptionExtractor.exec(s);
        }
        return out.join('\n');
    };

    var fileReaderOnLoadHandler = function() {
        var sanitized = abpImporter(this.result);
        editor.setValue(editor.getValue().trim() + '\n' + sanitized, 1);
        editor.renderer.scrollCursorIntoView();
        userFiltersChanged();
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

var exportUserFiltersToFile = function() {
    var val = editor.getValue().trim();
    if ( val === '' ) {
        return;
    }
    var filename = vAPI.i18n('1pExportFilename')
        .replace('{{datetime}}', uBlockDashboard.dateNowToSensibleString())
        .replace(/ +/g, '_');
    vAPI.download({
        'url': 'data:text/plain;charset=utf-8,' + encodeURIComponent(val + '\n'),
        'filename': filename
    });
};

/******************************************************************************/

var applyChanges = function() {
    var onWritten = function(details) {
        if ( details.error ) {
            return;
        }
        editor.setValue(details.content, 1);
        cachedUserFilters = details.content.trim();
        // Patch 2017-12-06: Add false as I just set the value to be the same
        userFiltersChanged(false);
        allFiltersApplyHandler();
        // TODO 2017-12-06: Maybe set the cursor back to its original position?
        editor.focus();
        editor.renderer.scrollCursorIntoView();
    };

    var request = {
        what: 'writeUserFilters',
        content: editor.getValue()
    };
    messaging.send('dashboard', request, onWritten);
};

var revertChanges = function() {
    editor.setValue(cachedUserFilters + '\n', 1);
    editor.renderer.scrollCursorIntoView();
    // Patch 2017-12-06: Add false as I just set the value to be the same
    userFiltersChanged(false);
};

/******************************************************************************/

// TODO 2017-12-06: What is cloud?
var getCloudData = function() {
    //return uDom.nodeFromId('userFilters').value;
    return editor.getValue();
};

var setCloudData = function(data, append) {
    if ( typeof data !== 'string' ) {
        return;
    }
    if ( append ) {
        data = uBlockDashboard.mergeNewLines(editor.getValue(), data);
    }
    editor.setValue(data, 1);
    editor.renderer.scrollCursorIntoView();
    userFiltersChanged();
};

self.cloud.onPush = getCloudData;
self.cloud.onPull = setCloudData;

/******************************************************************************/

// Handle user interaction
uDom('#importUserFiltersFromFile').on('click', startImportFilePicker);
uDom('#importFilePicker').on('change', handleImportFilePicker);
uDom('#exportUserFiltersToFile').on('click', exportUserFiltersToFile);
uDom('#userFiltersApply').on('click', applyChanges);
uDom('#userFiltersRevert').on('click', revertChanges);
// TODO 2017-12-06: Check on every keystroke can get expensive real fast, any
// better implementation?
editor.getSession().on('change', userFiltersChanged);

renderUserFilters(true);

/******************************************************************************/

// https://www.youtube.com/watch?v=UNilsLf6eW4

})();
