// Patch 2017-12-16: Add an alternative dashboard.
// This file should be formatted by Visual Studio and use modern code style.
// This new dashboard will only work for modern browsers.

"use strict";

// ===== Dashboard Controller =====

/**
 * The tab that is currently active.
 * @var {Tab}
 */
let currentTab = null;
/**
 * The current tab indicator for small screen.
 * @const {HTMLElement}
 */
const currentTabTextElement = document.getElementById("nano-selected-tab");

/**
 * Whether this instance has the mutex lock.
 * @const {boolean}
 */
let hasMutex = false;

/**
 * CSS flags.
 * @var {boolean}
 */
let allowTextSelection, disableTooltips;

/**
 * Update action buttons for this tab.
 * The two arrays that are passed in must be parallel arrays.
 * @function
 * @param {Array.<string>} inIcons - The icons to set.
 * @param {Array.<string>} inTooltips - The tooltips to set.
 * @param {Array.<Function>} inHandlers - The click handlers.
 * @return {Array.<HTMLElement>} The updated buttons.
 */
const drawActionBtns = (() => {
    const buttons = [...document.querySelectorAll("[id^='nano-action-']")];
    const icons = document.querySelectorAll("[id^='nano-action-'] > span");
    const tooltips = document.querySelectorAll("[data-mdl-for^='nano-action-']");

    // There should be at least 5
    console.assert(buttons.length >= 5);
    console.assert(buttons.length === icons.length && icons.length === tooltips.length);

    return (inIcons, inTooltips, inHandlers) => {
        console.assert(inIcons.length === inTooltips.length && inTooltips.length === inHandlers.length);
        console.assert(inIcons.length <= buttons.length);

        for (let i = 0; i < buttons.length; i++) {
            if (i < inIcons.length) {
                icons[i].textContent = inIcons[i];
                tooltips[i].textContent = inTooltips[i];
                buttons[i].onclick = inHandlers[i];
                buttons[i].style.display = "block";
            } else {
                buttons[i].onclick = null;
                buttons[i].style.display = "none";
            }
        }
        return buttons.slice(0, inIcons.length);
    };
})();
/**
 * Close the drawer.
 * @function
 */
const closeDrawer = (() => {
    let backdrop = null;
    return () => {
        if (backdrop) {
            if (backdrop.classList.contains("is-visible")) {
                backdrop.click();
            }
        } else {
            backdrop = document.querySelector(".mdl-layout__obfuscator.is-visible");
            if (backdrop) {
                backdrop.click();
            }
        }
    };
})();

/**
 * Tab interface.
 * @class
 */
const Tab = class {
    /**
     * Constructor.
     * @constructor
     * @param {HTMLElement} btn1 - The tab bar button.
     * @param {HTMLElement} btn2 - The drawer button.
     * @param {HTMLElement} content - The content section.
     */
    constructor(btn1, btn2, content) {
        this.btn1 = btn1;
        this.btn2 = btn2;
        this.content = content;

        const onclick = () => {
            if (!hasMutex) {
                return;
            }

            if (currentTab === this) {
                return;
            }

            closeDrawer();

            if (currentTab) {
                if (currentTab.hasChanges()) {
                    showConfirmModal(vAPI.i18n("genericUnsavedChange"), () => {
                        currentTab.unload();
                        this.init();
                    });
                } else {
                    currentTab.unload();
                    this.init();
                }
            } else {
                this.init();
            }
        };
        this.btn1.addEventListener("click", onclick);
        this.btn2.addEventListener("click", onclick);
    }
    /**
     * Initialize this tab.
     * @method
     */
    init() {
        console.assert(hasMutex);

        this.btn1.classList.add("is-active");
        this.btn2.classList.add("is-active");
        this.content.classList.add("is-active");
        currentTabTextElement.textContent = this.btn2.children[1].textContent;

        this.initCloud();

        currentTab = this;
        vAPI.localStorage.setItem("nanoDashboardLastVisitedTab", this.constructor.name);
    }
    /**
     * Initialize cloud.
     * @method
     */
    initCloud() {
        Cloud.init(false);
    }
    /**
     * Check whether this tab is ready to be unloaded.
     * @method
     * @return {boolean} True if there are unsaved changes, false otherwise.
     */
    hasChanges() {
        return false;
    }
    /**
     * Unload this tab.
     * @method
     */
    unload() {
        this.btn1.classList.remove("is-active");
        this.btn2.classList.remove("is-active");
        this.content.classList.remove("is-active");
    }
};

/**
 * Update CSS for controlling text selection and tooltips.
 * @function
 */
const updateCSS = (() => {
    let selectionCSS = document.createElement("style");
    let tooltipCSS = document.createElement("style");

    selectionCSS.textContent = "* {" +
        "user-select: text !important;" +
        "-webkit-user-select: text !important;" +
        "-moz-user-select: text !important;" +
        "-ms-user-select: text !important;" +
        "}";
    tooltipCSS.textContent = ".mdl-tooltip {" +
        "display: none !important;" +
        "}";

    return () => {
        console.assert(typeof allowTextSelection === "boolean" && typeof disableTooltips === "boolean");

        if (allowTextSelection) {
            document.documentElement.append(selectionCSS);
        } else {
            selectionCSS.remove();
        }

        if (disableTooltips) {
            document.documentElement.append(tooltipCSS);
        } else {
            tooltipCSS.remove();
        }
    };
})();

// ===== Cloud Controller =====

/**
 * Whether cloud sync is enabled.
 * @var {boolean}
 */
let cloudSyncEnabled = false;

/**
 * Cloud controller.
 * @const {Namespace}
 */
const Cloud = {};
/**
 * Cloud UI container.
 * @private @const {HTMLElement}
 */
Cloud.containerElem = document.getElementById("nano-cloud-ui");
/**
 * Cloud UI content element.
 * @private @const {HTMLElement}
 */
Cloud.contentElem = document.getElementById("nano-cloud-state");
/**
 * Cloud UI buttons.
 * @private @const {HTMLElement}
 */
Cloud.pushBtn = document.getElementById("cloud-push");
Cloud.pullBtn = document.getElementById("cloud-pull");
Cloud.mergeBtn = document.getElementById("cloud-pull-merge");
/**
 * Whether one-time initialization was done.
 * @private @var {boolean}
 */
Cloud.initialized = false;
/**
 * Initialize cloud UI.
 * @function
 * @param {boolean} enabled - Whether cloud sync is enabled for this tab, if false, other arguments are optional.
 * @param {string} dataKey - The cloud data key.
 * @param {HTMLElement} target - The main container of this tab, optional if not enabled.
 * @param {Function} onPush - The function to call when push button is clicked, must return data to push.
 * @param {Function} onPull - The function to call when pull button is clicked, pulled data will be passed over.
 * @param {Function} onMerge - The function to call when merge button is clicked, pulled data will be passed over.
 */
Cloud.init = (enabled, dataKey, target, onPush, onPull, onMerge) => {
    if (enabled) {
        console.assert(dataKey && typeof dataKey === "string");
        console.assert(target instanceof HTMLDivElement);
        console.assert(typeof onPush === "function" && typeof onPull === "function" && typeof onMerge === "function");

        Cloud.dataKey = dataKey;
        Cloud.target = target;
        Cloud.onPush = onPush;
        Cloud.onPull = onPull;
        Cloud.onMerge = onMerge;

        target.prepend(Cloud.containerElem);

        if (Cloud.initialized) {
            Cloud.redrawUI(() => {
                Cloud.containerElem.removeAttribute("hidden");
            });
        } else {
            Cloud.initialized = true;
            vAPI.messaging.send("cloudWidget", { what: "cloudGetOptions" }, (data) => {
                if (!data || typeof data !== "object") {
                    Cloud.initialized = false;
                    return;
                }

                Cloud.defaultDeviceName = data.defaultDeviceName;
                Cloud.deviceName = data.deviceName;

                const inputElem = document.getElementById("nano-cloud-device-name");
                inputElem.value = Cloud.deviceName || Cloud.defaultDeviceName;
                inputElem.addEventListener("change", () => {
                    if (!inputElem.value) {
                        inputElem.value = Cloud.defaultDeviceName;
                    }

                    vAPI.messaging.send(
                        "cloudWidget",
                        {
                            what: "cloudSetOptions",
                            options: {
                                deviceName: inputElem.value,
                            },
                        },
                        (data) => {
                            if (data && typeof data === "object") {
                                Cloud.defaultDeviceName = data.defaultDeviceName;
                                Cloud.deviceName = data.deviceName;
                            }
                        },
                    );
                });

                Cloud.pushBtn.addEventListener("click", Cloud.pushBtnClick);
                Cloud.pullBtn.addEventListener("click", Cloud.pullBtnClicked);
                Cloud.mergeBtn.addEventListener("click", Cloud.mergeBtnClicked);

                Cloud.init(enabled, dataKey, target, onPush, onPull, onMerge);
            });
        }
    } else {
        Cloud.containerElem.setAttribute("hidden", "");
    }
};
/**
 * Read data and update cloud sync UI.
 * @private @function
 * @param {Function} [callback=noop] - The callback function, fetched data will be passed over.
 */
Cloud.redrawUI = (callback) => {
    console.assert(Cloud.dataKey && typeof Cloud.dataKey === "string");

    const timeOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
    };

    vAPI.messaging.send(
        "cloudWidget",
        {
            what: "cloudPull",
            datakey: Cloud.dataKey,
        },
        (data) => {
            if (data && typeof data === "object") {
                Cloud.data = data;

                Cloud.pullBtn.MaterialButton.enabled();
                Cloud.mergeBtn.MaterialButton.enabled();

                const time = new Date(data.tstamp);
                Cloud.contentElem.textContent = vAPI.i18n("nanoCloudLastSync")
                    .replace("{{device}}", data.source)
                    .replace("{{time}}", time.toLocaleString("fullwide", timeOptions));
            } else {
                Cloud.data = null;

                Cloud.pullBtn.MaterialButton.disable();
                Cloud.mergeBtn.MaterialButton.disable();

                Cloud.contentElem.textContent = vAPI.i18n("nanoCloudNoData");
            }

            if (callback) {
                callback();
            }
        },
    );
};
/**
 * Push button click handler.
 * @private @function
 */
Cloud.pushBtnClick = () => {
    console.assert(Cloud.dataKey && typeof Cloud.dataKey === "string" && typeof Cloud.onPush === "function");

    vAPI.messaging.send(
        "cloudWidget",
        {
            what: "cloudPush",
            datakey: Cloud.dataKey,
            data: Cloud.onPush(),
        },
        (error) => {
            if (typeof error === "string") {
                showInfoModal(vAPI.i18n("nanoCloudSyncFailed").replace("{{error}}", error || ""));
            }
            Cloud.redrawUI();
        },
    );
};
/**
 * Pull button click handler.
 * @private @function
 */
Cloud.pullBtnClicked = () => {
    console.assert(Cloud.data && typeof Cloud.data === "object" && typeof Cloud.onPull === "function");

    Cloud.onPull(Cloud.data);
};
/**
 * Merge button click handler.
 * @private @function
 */
Cloud.mergeBtnClicked = () => {
    console.assert(Cloud.data && typeof Cloud.data === "object" && typeof Cloud.onMerge === "function");

    Cloud.onMerge(Cloud.data);
};

// ===== Helper Functions =====

/**
 * Pick a file.
 * @function
 * @param {Function} callback - The function to call.
 ** @param {HTMLElement} elem - The file picker.
 */
const pickFile = (callback) => {
    console.assert(typeof callback === "function");

    // Do not have to be attached to DOM.
    // It should be really rare that we need to pick a file, we will not cache the element.
    let filePicker = document.createElement("input");
    filePicker.setAttribute("type", "file");
    filePicker.addEventListener("change", () => {
        callback(filePicker);
    });
    filePicker.click();
};

/**
 * Show a information modal.
 * @function
 * @param {string} msg - The message to show.
 */
const showInfoModal = (() => {
    const dialog = document.getElementById("nano-info-dialog");

    console.assert(dialog);

    const content = dialog.querySelector("p");
    const btnOK = dialog.querySelector("button");

    console.assert(content && btnOK);

    btnOK.addEventListener("click", () => {
        dialog.close();
    });

    return (msg) => {
        console.assert(msg && typeof msg === "string");

        if (window.HTMLDialogElement) {
            content.textContent = msg;
            dialog.showModal();
        } else {
            alert(msg);
        }
    };
})();
/**
 * Show a confirm modal.
 * @function
 * @param {string} msg - The message to show.
 * @param {Function} callback - The callback when yes is clicked.
 */
const showConfirmModal = (() => {
    const dialog = document.getElementById("nano-confirm-dialog");

    console.assert(dialog);

    const content = dialog.querySelector("p");
    const [btnNo, btnYes] = dialog.querySelectorAll("button");

    console.assert(content && btnNo && btnYes);

    return (msg, callback) => {
        console.assert(msg && typeof msg === "string" && typeof callback === "function");

        if (window.HTMLDialogElement) {
            content.textContent = msg;
            btnYes.onclick = () => {
                dialog.close();
                callback();
            };
            btnNo.onclick = () => {
                dialog.close();
            };
            dialog.showModal();
        } else {
            if (confirm(msg)) {
                callback();
            }
        }
    };
})();

/**
 * Read one settings.
 * @function
 * @param {string} name - The name of the settings.
 * @return {Promise} Promise of this task.
 */
const readOneSettings = (name) => {
    console.assert(name && typeof name === "string");

    return new Promise((resolve) => {
        vAPI.messaging.send(
            "dashboard",
            {
                what: "userSettings",
                name: name,
            },
            (data) => {
                resolve(data);
            },
        );
    });
};

// ===== Polyfills =====
{
    function replaceWith(elem, ...rest) {
        console.assert(elem instanceof HTMLElement);
        if (rest.length) {
            throw new Error("ChildNode.replaceWith() polyfill needs an upgrade.");
        }

        this.parentNode.replaceChild(this, elem);
    }

    if (!DocumentType.prototype.replaceWith) {
        DocumentType.prototype.replaceWith = replaceWith;
    }
    if (!Element.prototype.replaceWith) {
        Element.prototype.replaceWith = replaceWith;
    }
    if (!CharacterData.prototype.replaceWith) {
        CharacterData.prototype.replaceWith = replaceWith;
    }
}

// ===== Tab Objects =====

/**
 * The filters tab.
 * @const {Tab}
 */
window.tabFilters = new class tabFilters extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-filters"),
            document.getElementById("nano-drawer-filters"),
            document.getElementById("nano-section-filters"),
        );
    }
    /**
     * 3 buttons: Update now, Purge all caches, Apply changes.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns(
            ["done", "update", "delete_forever"],
            [vAPI.i18n("3pApplyChanges"), vAPI.i18n("3pUpdateNow"), vAPI.i18n("3pPurgeAll")],
            // TODO
            [() => { }, () => { }, () => { }],
        );

        super.init();
    }
    /**
     * Check for unsaved changes.
     * @method
     * @override
     */
    hasChanges() {
        // TODO 2017-12-17: Check for unsaved changes
        return false;
    }
};

/**
 * The whitelist tab.
 * @const {Tab}
 */
window.tabWhitelist = new class tabWhitelist extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-whitelist"),
            document.getElementById("nano-drawer-whitelist"),
            document.getElementById("nano-section-whitelist"),
        );
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "archive"],
            [vAPI.i18n("whitelistApply"), vAPI.i18n("genericRevert"), vAPI.i18n("whitelistImport"), vAPI.i18n("whitelistExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );

        super.init();
    }
    /**
     * Check for unsaved changes.
     * @method
     * @override
     */
    hasChanges() {
        // TODO 2017-12-17: Check for unsaved changes 
        return false;
    }
};

/**
 * The advanced tab.
 * @const {Tab}
 */
window.tabAdvanced = new class tabAdvanced extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-advanced"),
            document.getElementById("nano-drawer-advanced"),
            document.getElementById("nano-section-advanced"),
        );
    }
    /**
     * No action buttons for advanced tab.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns([], [], []);

        super.init();
    }
};

/**
 * The matrix tab.
 * @const {Tab}
 */
window.tabMatrix = new class tabMatrix extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-matrix"),
            document.getElementById("nano-drawer-matrix"),
            document.getElementById("nano-section-matrix"),
        );
    }
    /**
     * No action buttons for matrix tab.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns([], [], []);

        super.init();
    }
    /**
     * Check for unsaved changes.
     * @method
     * @override
     */
    hasChanges() {
        // TODO 2017-12-17: Check for unsaved changes 
        return false;
    }
};

/**
 * The about tab.
 * @const {Tab}
 */
window.tabAbout = new class tabAbout extends Tab {
    /**
     * Pass appropriate elements to super.
     * @constructor
     * @override
     */
    constructor() {
        super(
            document.getElementById("nano-tab-about"),
            document.getElementById("nano-drawer-about"),
            document.getElementById("nano-section-about"),
        );
    }
    /**
     * No action buttons for about tab.
     * @method
     * @override
     */
    init() {
        this.buttons = drawActionBtns([], [], []);

        super.init();
    }
};
