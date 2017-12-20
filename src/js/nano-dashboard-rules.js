// My rules tab controller
"use strict";

window.tabRules = new class tabRules extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-rules"),
            document.getElementById("nano-drawer-rules"),
            document.getElementById("nano-section-rules"),
        );

        this.initialized = false;
        this.changed = false;
        this.lastSavedData = null;
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "archive"],
            [vAPI.i18n("1pApplyChanges"), vAPI.i18n("genericRevert"), vAPI.i18n("1pImport"), vAPI.i18n("1pExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );

        if (this.initialized) {
            nanoIDE.editor = this.editor;
        } else {
            this.initialized = true;
            this.editor = nanoIDE.init("rules-main-editor", true, false);
        }

        readOneSettings("nanoEditorWordSoftWrap").then((data) => {
            nanoIDE.setLineWrap(data);
            vAPI.messaging.send("dashboard", { what: "readUserFilters" }, (data) => {
                if (data.error) {
                    nanoIDE.setValueFocus(vAPI.i18n("generidFilterReadError"), -1);
                } else {
                    this.lastSavedData = data.content;
                    if (!this.lastSavedData.endsWith("\n")) {
                        this.lastSavedData += "\n";
                    }

                    nanoIDE.setValueFocus(this.lastSavedData);
                }

                super.init();
            });
        });
    }
    /**
     * Initialize cloud.
     * @method
     * @override
     */
    initCloud() {
        Cloud.init(true, "tpFiltersPane", this.content);
    }
    /**
     * Check for unsaved changes.
     * @method
     * @override
     */
    hasChanges() {
        return this.changed;
    }
    /**
     * Do clean up.
     * @method
     * @override
     */
    unload() {
        this.changed = false;
        this.lastSavedData = null;
        nanoIDE.setValueFocus("");

        super.unload();
    }
};
