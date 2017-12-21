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

        this.cloudKey = "tpFiltersPane";
        this.changed = false;
        this.lastSavedData = null;

        this.changeCheckerTimer = null;
        this.changeChecker = () => {
            this.changeCheckerTimer = null;

            if (this.lastSavedData === nanoIDE.getLinuxValue()) {
                this.changed = false;

                this.btnApply.MaterialButton.disable();
                this.btnRevert.MaterialButton.disable();

                closeAllTooltips();
            } else {
                // Should be alredy set
                console.assert(this.changed);

                this.btnApply.MaterialButton.enable();
                this.btnRevert.MaterialButton.enable();
            }
        };
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export.
     * @method
     * @override
     */
    init() {
        [this.btnApply, this.btnRevert, this.btnImportMerge, this.btnExport] = drawActionBtns(
            ["done", "undo", "note_add", "archive"],
            [vAPI.i18n("1pApplyChanges"), vAPI.i18n("genericRevert"), vAPI.i18n("1pImport"), vAPI.i18n("1pExport")],
            [
                () => {
                    this.onApplyBtnClicked();
                },
                () => {
                    this.onRevertBtnClicked();
                },
                () => {
                    this.onImportAppendBtnClicked();
                },
                () => {
                    this.onExportBtnClicked();
                },
            ],
        );

        console.assert(this.btnApply && this.btnRevert && this.btnImportMerge && this.btnExport);

        if (this.initialized) {
            nanoIDE.editor = this.editor;
        } else {
            this.initialized = true;
            this.editor = nanoIDE.init("rules-main-editor", true, false);
            this.editor.on("change", () => {
                this.onKeyboardInput();
            });
        }

        readOneSettings("nanoEditorWordSoftWrap").then((data) => {
            console.assert(typeof data === "boolean");
            console.assert(this.editor === nanoIDE.editor);

            nanoIDE.setLineWrap(data);

            vAPI.messaging.send("dashboard", { what: "readUserFilters" }, (data) => {
                console.assert(data && typeof data === "object");
                console.assert(this.editor === nanoIDE.editor);

                if (data.error) {
                    nanoIDE.setValueFocus(vAPI.i18n("genericFilterReadError"), -1);
                } else {
                    this.lastSavedData = data.content;
                    if (!this.lastSavedData.endsWith("\n")) {
                        this.lastSavedData += "\n";
                    }

                    nanoIDE.setValueFocus(this.lastSavedData);
                    this.changed = false;
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
        Cloud.init(
            true, this.cloudKey, this.content,
            () => {
                console.assert(this.editor === nanoIDE.editor);

                return nanoIDE.getLinuxValue();
            },
            (data) => {
                // Pull and overwrite
                this.onCloudPull(data, false);
            },
            (data) => {
                // Pull and merge
                this.onCloudPull(data, true);
            },
        );
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
     * Discard changes and unload.
     * @method
     * @override
     */
    unload() {
        this.changed = false;
        this.lastSavedData = null;

        console.assert(this.editor === nanoIDE.editor);

        nanoIDE.setValueFocus("");

        super.unload();
    }

    // ===== Helper Functions ======

    /**
     * Flag as changed, then schedule change checker.
     * @method
     */
    onKeyboardInput() {
        this.changed = true;

        if (this.changeCheckerTimer) {
            clearTimeout(this.changeCheckerTimer);
        }
        this.changeCheckerTimer = setTimeout(this.changeChecker, 250);
    }
    /**
     * Cloud pull.
     * @method
     * @param {string} data - The incoming cloud data.
     * @param {boolean} merge - Whether the data should be merged into existing ones.
     */
    onCloudPull(data, merge) {
        console.assert(typeof data === "string" && typeof merge === "boolean");
        console.assert(this.editor === nanoIDE.editor);

        if (merge) {
            data = uBlockDashboard.mergeNewLines(nanoIDE.getLinuxValue(), data);
        }
        nanoIDE.setValueFocus(data);
    }
    /**
     * Handle import from file.
     * @method
     * @param {HTMLElement} elem - The file picker.
     * @param {boolean} append - Whether the imported data should be appended to existing ones
     */
    onImportFilePicked(elem, append) {
        console.assert(elem instanceof HTMLInputElement && elem.type === "file");
        console.assert(typeof append === "boolean");

        const file = elem.files[0];
        if (!file || !file.name || !file.type.startsWith("text")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            let data = reader.result;
            let processed = null;

            console.assert(typeof data === "string");

            const reAbpSubscriptionExtractor = /\n\[Subscription\]\n+url=~[^\n]+([\x08-\x7E]*?)(?:\[Subscription\]|$)/ig;
            const reAbpFilterExtractor = /\[Subscription filters\]([\x08-\x7E]*?)(?:\[Subscription\]|$)/i;

            const matches = reAbpSubscriptionExtractor.exec(data);
            if (matches === null) {
                processed = data;
            } else {
                let out = [];
                let filterMatch;
                while (matches !== null) {
                    if (matches.length === 2) {
                        filterMatch = reAbpFilterExtractor.exec(matches[1].trim());
                        if (filterMatch !== null && filterMatch.length === 2) {
                            out.push(filterMatch[1].trim().replace(/\\\[/g, "["));
                        }
                    }
                    matches = reAbpSubscriptionExtractor.exec(s);
                }
                processed = out.join("\n");
            }

            console.assert(this.editor === nanoIDE.editor);

            if (append) {
                nanoIDE.setValueFocus(nanoIDE.getLinuxValue() + "\n" + processed);
            } else {
                nanoIDE.setValueFocus(processed);
            }
        };
        reader.readAsText(file);
    }

    // ===== Button Handlers =====

    /**
     * Apply button click handler.
     * @method
     */
    onApplyBtnClicked() {
        console.assert(this.changed);
        console.assert(this.editor === nanoIDE.editor);

        vAPI.messaging.send(
            "dashboard",
            {
                what: "writeUserFilters",
                content: nanoIDE.getLinuxValue(),
            },
            (data) => {
                console.assert(this.editor === nanoIDE.editor);

                if (data.error) {
                    showInfoModal(vAPI.i18n("genericDataSaveError"));
                } else {
                    this.lastSavedData = data.content;
                    nanoIDE.setValueFocus(this.lastSavedData);
                    this.changed = false;

                    vAPI.messaging.send("dashboard", { what: "reloadAllFilters" });
                }
            },
        );

        this.btnApply.MaterialButton.disable();
        this.btnRevert.MaterialButton.disable();

        closeAllTooltips();

    }
    /**
     * Revert button click handler.
     * @method
     */
    onRevertBtnClicked() {
        console.assert(this.changed);
        console.assert(this.editor === nanoIDE.editor);

        nanoIDE.setValueFocus(this.lastSavedData);
        this.changed = false;

        this.btnApply.MaterialButton.disable();
        this.btnRevert.MaterialButton.disable();

        closeAllTooltips();
    }
    /**
     * Import and append button click handler.
     * @method
     */
    onImportAppendBtnClicked() {
        pickFile((elem) => {
            this.onImportFilePicked(elem, true);
        });
    }
    /**
     * Export button click handler.
     * @method
     */
    onExportBtnClicked() {
        console.assert(this.editor === nanoIDE.editor);

        const val = this.editor.getValue();
        if (val.trim() === "") {
            showInfoModal(vAPI.i18n("genericNothingToExport"));
            return;
        }

        const name = vAPI.i18n("1pExportFilename")
            .replace("{{datetime}}", uBlockDashboard.dateNowToSensibleString())
            .replace(/ +/g, "_");
        vAPI.download({
            "url": "data:text/plain;charset=utf-8," + encodeURIComponent(val),
            "filename": name,
        });
    }
};
