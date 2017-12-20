// Settings tab controller
"use strict";

window.tabSettings = new class tabSettings extends Tab {
    /**
     * Pass appropriate elements to super then upgrade textboxes.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-settings"),
            document.getElementById("nano-drawer-settings"),
            document.getElementById("nano-section-settings"),
        );

        this.initialized = false;

        // Upgrade textbox
        const textboxes = document.querySelectorAll("#nano-section-settings input:not([class])");
        for (let i = 0; i < textboxes.length; i++) {
            let container = document.createElement("div");
            container.className = "mdl-textfield mdl-js-textfield nano-inline-textbox";

            let input = document.createElement("input");
            input.className = "mdl-textfield__input";
            input.type = textboxes[i].type;
            input.id = "nano-settings-textbox-" + i.toString();

            let label = document.createElement("label");
            label.className = "mdl-textfield__label";
            label.setAttribute("for", input.id);

            container.append(input, label);

            textboxes[i].replaceWith(container);
        }
    }
    /**
     * No action buttons for settings tab.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns([], [], []);

        if (this.initialized) {
            vAPI.messaging.send("dashboard", { what: "getLocalData" }, (data) => {
                this.refreshState(data);
                super.init();
            });
        } else {
            this.initialized = true;
            vAPI.messaging.send("dashboard", { what: "userSettings" }, (data) => {
                const checkboxes = document.querySelectorAll("[id^='settings-'][data-setting-type='bool']");
                for (let checkbox of checkboxes) {
                    if (data[checkbox.dataset.settingName] === true) {
                        checkbox.parentNode.MaterialSwitch.on();
                    }

                    checkbox.addEventListener("change", () => {
                        this.saveSettingsChange(checkbox.dataset.settingName, checkbox.checked);
                    });
                }

                const inputs = document.querySelectorAll("[id^='nano-settings-textbox-']");
                // Inputs are to be handled individually
                inputs[0].dataset.settingName = "largeMediaSize";
                inputs[0].dataset.settingType = "input";
                inputs[0].value = data.largeMediaSize;
                inputs[0].addEventListener("change", () => {
                    let v = inputs[0].value;

                    v = parseInt(v, 10);
                    // parseInt can also return Infinity, but -Infinity is smaller than 0 and Infinity is larger
                    // than 1000000
                    if (isNaN(v) || v < 0) {
                        v = 0;
                    } else if (v > 1000000) {
                        v = 1000000;
                    }

                    if (v !== inputs[0].value) {
                        inputs[0].value = v;
                        inputs[0].parentNode.classList.remove("is-invalid");
                    }

                    this.saveSettingsChange("largeMediaSize", v);
                });

                document.querySelector("[data-i18n='aboutBackupDataButton']").addEventListener("click", () => {
                    this.onBackupBtnClicked();
                });
                document.querySelector("[data-i18n='aboutRestoreDataButton']").addEventListener("click", () => {
                    this.onRestoreBtnClicked();
                });
                document.querySelector("[data-i18n='aboutResetDataButton']").addEventListener("click", () => {
                    this.onResetBtnClicked();
                });

                vAPI.messaging.send("dashboard", { what: "getLocalData" }, (data) => {
                    this.refreshState(data);
                    super.init();
                });
            });
        }
    }

    // ===== Helper Functions =====

    /**
     * Refresh state.
     * @method
     * @param {Object} data - The state data.
     */
    refreshState(data) {
        const timeOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
        };

        let diskUsage = data.storageUsed;
        const diskUsageElem = document.getElementById("nano-settings-disk-usage");
        if (typeof diskUsage === "number") {
            diskUsage = diskUsage / 1024 / 1024;
            diskUsage = Math.ceil(diskUsage * 100);
            diskUsage = diskUsage / 100;

            diskUsageElem.textContent = vAPI.i18n("settingDiskUsage") + diskUsage.toString() + vAPI.i18n("settingMebibyte");
            diskUsageElem.style.display = "block";
        } else {
            diskUsageElem.style.display = "none";
        }

        let lastBackup = data.lastBackupFile;
        const lastBackupElem = document.getElementById("nano-settings-last-backup");
        const lastBackupFileElem = document.getElementById("nano-settings-last-backedup-file");
        if (typeof lastBackup === "string" && lastBackup.length > 0) {
            let d = new Date(data.lastBackupTime);

            lastBackupElem.textContent = vAPI.i18n("settingsLastBackupPrompt") + " " + d.toLocaleString("fullwide", timeOptions);
            lastBackupFileElem.textContent = vAPI.i18n("settingsLastBackedupFilePrompt") + " " + lastBackup;
            lastBackupElem.style.display = "block";
            lastBackupFileElem.style.display = "block";
        } else {
            lastBackupElem.style.display = "none";
            lastBackupFileElem.style.display = "none";
        }

        let lastRestore = data.lastRestoreFile;
        const lastRestoreElem = document.getElementById("nano-settings-last-restore");
        const lastRestoreFileElem = document.getElementById("nano-settings-last-restored-file");
        if (typeof lastRestore === "string" && lastRestore.length > 0) {
            let d = new Date(data.lastRestoreTime);

            lastRestoreElem.textContent = vAPI.i18n("settingsLastRestorePrompt") + " " + d.toLocaleString("fullwide", timeOptions);
            lastRestoreFileElem.textContent = vAPI.i18n("settingsLastRestoredFilePrompt") + " " + lastRestore;
            lastRestoreElem.style.display = "block";
            lastRestoreFileElem.style.display = "block";
        } else {
            lastRestoreElem.style.display = "none";
            lastRestoreFileElem.style.display = "none";
        }

        if (data.cloudStorageSupported === false) {
            document.getElementById("settings-cloud-storage-enabled").parentNode.MaterialSwitch.disable();
        }
        if (data.privacySettingsSupported === false) {
            const inputs = document.querySelectorAll("#settings-privacy-group input");
            for (let input of inputs) {
                input.parentNode.MaterialSwitch.disable();
            }
        }
    }
    /**
     * Save changes to a settings.
     * @method
     * @param {string} name - The name of the settings.
     * @param {boolean|number} val - The new value.
     */
    saveSettingsChange(name, val) {
        let mustUpdateCSS = false;

        if (name === "nanoDashboardAllowSelection") {
            allowTextSelection = val;
            mustUpdateCSS = true;
        }
        if (name === "tooltipsDisabled") {
            disableTooltips = val;
            mustUpdateCSS = true;
        }

        if (mustUpdateCSS) {
            updateCSS();
        }

        vAPI.messaging.send(
            "dashboard",
            {
                what: "userSettings",
                name: name,
                value: val,
            },
        );
    }
    /**
     * Handle restore from file.
     * @method
     * @param {HTMLElement} elem - The file picker.
     */
    onRestoreFilePicked(elem) {
        const file = elem.files[0];
        if (!file || !file.name || !file.type.startsWith("text")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            let data;
            let abort = false;

            try {
                data = JSON.parse(reader.result);
            } catch (err) {
                abort = true;
            }
            if (!abort && (
                typeof data !== "object" ||
                typeof data.userSettings !== "object" ||
                typeof data.netWhitelist !== "string"
            )) {
                abort = true;
            }
            if (!abort && (
                typeof data.filterLists !== "object" &&
                !Array.isArray(data.selectedFilterLists)
            )) {
                abort = true;
            }

            if (abort) {
                showInfoModal(vAPI.i18n("aboutRestoreDataError"));
                return;
            }

            const time = new Date(data.timeStamp);
            const msg = vAPI.i18n("aboutRestoreDataConfirm").replace("{{time}}", time.toLocaleString());
            showConfirmModal(msg, () => {
                vAPI.messaging.send(
                    "dashboard",
                    {
                        what: "restoreUserData",
                        userData: data,
                        file: file.name,
                    },
                );
            });
        };
        reader.readAsText(file);
    }

    // ===== Button Handlers =====

    /**
     * Backup button click handler.
     * @method
     */
    onBackupBtnClicked() {
        vAPI.messaging.send("dashboard", { what: "backupUserData" }, (res) => {
            if (typeof res !== "object" || typeof res.userData !== "object") {
                return;
            }

            vAPI.download({
                "url": "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(res.userData, null, 2)),
                "filename": res.localData.lastBackupFile,
            });

            this.refreshState(res.localData);
        });
    }
    /**
     * Restore button click handler.
     * @method
     */
    onRestoreBtnClicked() {
        pickFile((elem) => {
            this.onRestoreFilePicked(elem);
        });
    }
    /**
     * Factory reset button click handler.
     * @method
     */
    onResetBtnClicked() {
        showConfirmModal(vAPI.i18n("aboutResetDataConfirm"), () => {
            vAPI.messaging.send("dashboard", { what: "resetUserData" });
        });
    }
};
