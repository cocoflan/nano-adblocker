'use strict';

/******************************************************************************/

(function() {

/******************************************************************************/

// Patch 2017-12-06: Add syntax highlighting
ace.define('ace/mode/nano_filters', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextMode = ace.require('ace/mode/text').Mode;
    var HighlightRules = ace.require('ace/mode/nano_filters_hr').HighlightRules;
    exports.Mode = function() {
        this.HighlightRules = HighlightRules;
        this.lineCommentStart = "!";
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

})();
