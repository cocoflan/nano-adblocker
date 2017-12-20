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

self.nanoIDE = self.nanoIDE || {};

/******************************************************************************/

self.nanoIDE.init = function(element, highlight, readonly) {
    self.nanoIDE.editor = ace.edit(element);
    var editor = self.nanoIDE.editor;
    var session = editor.session;

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
        self.nanoIDE.isWindows = true;
        session.setNewLineMode('windows');
    } else {
        self.nanoIDE.isWindows = false;
        session.setNewLineMode('unix');
    }

    editor.$blockScrolling = Infinity;

    return editor;
};

/******************************************************************************/

self.nanoIDE.setLineWrap = function(lineWrap) {
    self.nanoIDE.editor.session.setUseWrapMode(lineWrap);
};

/******************************************************************************/

self.nanoIDE.getLinuxValue = function() {
    if ( self.nanoIDE.isWindows ) {
        self.nanoIDE.editor.session.setNewLineMode('unix');
    }
    var data = self.nanoIDE.editor.getValue();
    if ( self.nanoIDE.isWindows ) {
        self.nanoIDE.editor.session.setNewLineMode('windows');
    }
    return data;
};

/******************************************************************************/

self.nanoIDE.setValueFocus = function(value, cursor, keepAnnotation) {
    if ( cursor !== -1 ) {
        cursor = 1;
    }
    
    self.nanoIDE.editor.setValue(value, cursor);
    self.nanoIDE.editor.renderer.scrollCursorIntoView();
    self.nanoIDE.editor.focus();
    
    if ( !keepAnnotation ) {
        self.nanoIDE.editor.session.clearAnnotations();
    }
};
