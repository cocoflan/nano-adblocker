'use strict';

/******************************************************************************/

self.nanoIDE = self.nanoIDE || {};

/******************************************************************************/

self.nanoIDE.init = function(element, highlight, readonly) {
    self.nanoIDE.editor = ace.edit(element);
    var editor = self.nanoIDE.editor;
    var session = editor.getSession();

    if ( highlight ) {
        session.setMode('ace/mode/nano_filters');
    } else {
        session.setMode('ace/mode/text');
    }

    editor.setReadOnly(readonly);

    // Patch 2017-12-10: Disable commands that makes no sense
    var uselessCommands = ['blockindent', 'blockoutdent', 'indent', 'outdent'];
    for ( var cmd of uselessCommands ) {
        editor.commands.removeCommand(cmd);
    }

    // Patch 2017-12-09: Fix line ending, Ace's auto-detect feature is broken
    if ( navigator.userAgent.includes('Windows') ) {
        session.setNewLineMode('windows');
    } else {
        session.setNewLineMode('unix');
    }

    editor.$blockScrolling = Infinity;

    return editor;
};
