// Patch 2017-12-16: Add an alternative dashboard.
// This file should be formatted by Visual Studio and use my own code style.
// This new dashboard will only work for modern browsers.

"use strict";

// ===== Main Controllers =====

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
 * Update action buttons for this tab.
 * The two arrays that are passed in must be parallel arrays.
 * @method
 * @param {Array.<string>} inIcons - The icons to set.
 * @param {Array.<string>} inTooltips - The tooltips to set.
 * @param {Array.<Function>} inHandlers - The click handlers.
 * @return {Array.<HTMLElement>} The updated buttons.
 */
const drawActionBtns = (() => {
    const buttons = [...document.querySelectorAll("[id^='nano-action-']")];
    const icons = document.querySelectorAll("[id^='nano-action-'] > span");
    const tooltips = document.querySelectorAll("[data-mdl-for^='nano-action-']");

    return (inIcons, inTooltips, inHandlers) => {
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
            if (currentTab === this) {
                return;
            }

            closeDrawer();

            if (currentTab && !currentTab.teardown(this)) {
                return;
            }

            this.init();
        };
        this.btn1.addEventListener("click", onclick);
        this.btn2.addEventListener("click", onclick);
    }
    /**
     * Initialize the tab.
     * @method
     */
    init() {
        this.btn1.classList.add("is-active");
        this.btn2.classList.add("is-active");
        this.content.classList.add("is-active");
        currentTabTextElement.textContent = this.btn2.children[1].textContent;

        currentTab = this;
    }
    /**
     * Teardown current tab. If overriden, should take in the caller tab in case teardown
     * succeeded asynchronously.
     * @method
     * @return {boolean} True if the operation succeeded, false otherwise.
     */
    teardown() {
        this.btn1.classList.remove("is-active");
        this.btn2.classList.remove("is-active");
        this.content.classList.remove("is-active");

        return true;
    }
};

// ===== Tab Objects =====

/**
 * The settings tab.
 * @const {Tab}
 */
const tabSettings = new class extends Tab {
    /**
     * Pass appropriate elements to super.
     */
    constructor() {
        super(
            document.getElementById("nano-tab-settings"),
            document.getElementById("nano-drawer-settings"),
            document.getElementById("nano-section-settings"),
        );
    }
    /**
     * No action buttons for settings tab.
     */
    init() {
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
};

/**
 * The filters tab.
 */
const tabFilters = new class extends Tab {
    /**
     * Pass appropriate elements to super.
     */
    constructor() {
        super(
            document.getElementById("nano-tab-filters"),
            document.getElementById("nano-drawer-filters"),
            document.getElementById("nano-section-filters"),
        );
    }
    /**
     * 3 buttons: Update now, Purge all caches, Apply changes
     */
    init() {
        super.init();
        this.buttons = drawActionBtns(
            ["update", "delete_forever", "done"],
            [vAPI.i18n("3pUpdateNow"), vAPI.i18n("3pPurgeAll"), vAPI.i18n("3pApplyChanges")],
            // TODO
            [() => { }, () => { }, () => { }],
        );
    }
    /**
     * Check for unsaved changes.
     */
    teardown() {
        // TODO 2017-12-17: Check for unsaved changes 
        super.teardown();
        return true;
    }
};

/**
 * The rules tab.
 */
const tabRules = new class extends Tab {
    /**
     * Pass appropriate elements to super.
     */
    constructor() {
        super(
            document.getElementById("nano-tab-rules"),
            document.getElementById("nano-drawer-rules"),
            document.getElementById("nano-section-rules"),
        );
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export
     */
    init() {
        super.init();
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "file_download"],
            [vAPI.i18n("1pApplyChanges"), vAPI.i18n("genericRevert"), vAPI.i18n("1pImport"), vAPI.i18n("1pExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );
    }
    /**
     * Check for unsaved changes.
     */
    teardown() {
        // TODO 2017-12-17: Check for unsaved changes 
        super.teardown();
        return true;
    }
};

/**
 * The whitelist tab.
 */
const tabWhitelist = new class extends Tab {
    /**
     * Pass appropriate elements to super.
     */
    constructor() {
        super(
            document.getElementById("nano-tab-whitelist"),
            document.getElementById("nano-drawer-whitelist"),
            document.getElementById("nano-section-whitelist"),
        );
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export
     */
    init() {
        super.init();
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "file_download"],
            [vAPI.i18n("whitelistApply"), vAPI.i18n("genericRevert"), vAPI.i18n("whitelistImport"), vAPI.i18n("whitelistExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );
    }
    /**
     * Check for unsaved changes.
     */
    teardown() {
        // TODO 2017-12-17: Check for unsaved changes 
        super.teardown();
        return true;
    }
};

/**
 * The matrix tab.
 */
const tabMatrix = new class extends Tab {
    /**
     * Pass appropriate elements to super.
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
     */
    init() {
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
    /**
     * Check for unsaved changes.
     */
    teardown() {
        // TODO 2017-12-17: Check for unsaved changes 
        super.teardown();
        return true;
    }
};

/**
 * The advanced tab.
 * @const {Tab}
 */
const tabDev = new class extends Tab {
    /**
     * Pass appropriate elements to super.
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
     */
    init() {
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
};

/**
 * The about tab.
 * @const {Tab}
 */
const tabAbout = new class extends Tab {
    /**
     * Pass appropriate elements to super.
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
     */
    init() {
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
};

// ===== Bootstrap =====

// TODO: read localstorage for last active tab etc.
tabSettings.init();
