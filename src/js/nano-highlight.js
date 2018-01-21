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

'use strict';

/******************************************************************************/

(function() {

/******************************************************************************/

// Patch 2017-12-06: Add syntax highlighting
ace.define('ace/mode/nano_filters', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextMode = ace.require('ace/mode/text').Mode;
    var HighlightRules = ace.require('ace/mode/nano_filters_hr').HighlightRules;

    // Notes 2018-01-06: The way tokenRe works seems to have changed, must test
    // if Ace is updated
    // https://github.com/ajaxorg/ace/pull/3454/files#diff-2a8db065be808cdb78daf80b97fcb4aa
    var unicode = require('ace/unicode');
    exports.Mode = function() {
        this.HighlightRules = HighlightRules;
        this.lineCommentStart = '!';
        this.tokenRe = new RegExp(
            '^[' + unicode.packages.L + unicode.packages.Mn +
                unicode.packages.Mc + unicode.packages.Nd +
                unicode.packages.Pc + '\\-_.]+',
            'g'
        );
    };
    oop.inherits(exports.Mode, TextMode);
});
ace.define('ace/mode/nano_filters_hr', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextHighlightRules = ace.require('ace/mode/text_highlight_rules')
        .TextHighlightRules;
    exports.HighlightRules = function() {
        this.$rules = {
            start: [
                // Comments
                {
                    token: 'comment',
                    regex: /^! === /,
                    next: 'header'
                },
                {
                    token: 'comment.line',
                    regex: /^(?:!|# |\[).*/
                },
                {
                    token: 'comment.line',
                    regex: / #.*/
                },
                // Cosmetic
                {
                    token: 'keyword.control',
                    regex: /#@?(?:\?|\$)?#\^?/,
                    next: 'double_hash'
                },
                {
                    // Operator @ is at the wrong place
                    token: 'invalid.illegal',
                    regex: /#@?(?:\?|\$)?@#\^?/,
                    next: 'double_hash'
                },
                {
                    // Raw JS injection is not yet supported
                    token: 'invalid.illegal',
                    regex: /#@?%@?#/
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /^@@|\||,|\^|\*/
                },
                // Options
                {
                    token: 'invalid.illegal',
                    regex: /\$(?!.*?(?:\/|\$)),/,
                    next: 'options'
                },
                {
                    // Unexpected end of line
                    token: 'invalid.illegal',
                    regex: /\$$/
                },
                {
                    token: 'keyword.control',
                    regex: /\$(?!.*?(?:\/|\$))/,
                    next: 'options'
                },
                // Domains (default)
                {
                    defaultToken: 'string.unquoted'
                }
            ],
            header: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                // NSFW header
                {
                    token: 'keyword.other',
                    regex: /NSFW!/
                },
                // Header text (default)
                {
                    defaultToken: 'text'
                }
            ],
            double_hash: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Script inject
                {
                    token: 'keyword.control',
                    regex: /script:inject\(/,
                    next: 'script_inject_part1'
                },
                // CSS (default)
                {
                    defaultToken: 'constant.character'
                }
            ],
            script_inject_part1: [
                // Exit
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
                    // Unexpected line break
                    token: 'invalid.illegal',
                    regex: /.?$/,
                    next: 'start'
                },
                // Parameters
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'script_inject_part2'
                },
                // Scriplet name (default)
                {
                    defaultToken: 'variable.other'
                }
            ],
            script_inject_part2: [
                // Exit
                {
                    // Missing parentheses
                    token: 'invalid.illegal',
                    regex: /[^\)]?$/,
                    next: 'start'
                },
                {
                    token: 'keyword.control',
                    regex: /\)$/,
                    next: 'start'
                },
                // Separator
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'script_inject_part2'
                },
                // Parameters (default)
                {
                    defaultToken: 'constant.character'
                }
            ],
            options: [
                // Exit
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
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                // Modifiers
                {
                    token: 'keyword.control',
                    regex: /document|~?(?:third-party|3p|first-party|1p)|important|badfilter/
                },
                // Actions
                {
                    token: 'variable.other',
                    // inline-font and inline-script must be before font and script
                    regex: /elemhide|generichide|inline-font|inline-script|popunder|popup|ghide/
                },
                // Types
                {
                    // Resource type
                    token: 'variable.parameter',
                    // object-subrequest must be before object
                    regex: /~?(?:font|image|media|object-subrequest|object|script|stylesheet|subdocument|xmlhttprequest|css|iframe|xhr|mp4)/
                },
                {
                    // Special types
                    token: 'variable.parameter',
                    regex: /beacon|data|other|ping|websocket/
                },
                // Redirect
                {
                    token: 'keyword.language',
                    regex: /redirect=/,
                    next: 'options_redirect'
                },
                // Domains restriction
                {
                    token: 'keyword.language',
                    regex: /domain=/,
                    next: 'options_domain'
                },
                // CSP
                {
                    token: 'keyword.language',
                    regex: /csp=/,
                    next: 'options_csp'
                },
                {
                    token: 'keyword.language',
                    regex: /csp/
                },
                // Invalid (default)
                {
                    defaultToken: 'invalid.illegal'
                }
            ],
            options_redirect: [
                // Exit
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
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // Redirect resource name (default)
                {
                    defaultToken: 'variable.language',
                }
            ],
            options_domain: [
                // Exit
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
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // Domains (default)
                {
                    defaultToken: 'string.unquoted'
                }
            ],
            options_csp: [
                // Exit
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
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // CSP text (default)
                {
                    defaultToken: 'constant.character'
                }
            ]
        };
    };
    oop.inherits(exports.HighlightRules, TextHighlightRules);
});

/******************************************************************************/

})();
