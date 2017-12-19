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
            if (currentTab === this) {
                return;
            }

            closeDrawer();

            if (currentTab) {
                if (currentTab.hasChanges()) {
                    return;
                } else {
                    currentTab.unload();
                }
            }

            this.init();
        };
        this.btn1.addEventListener("click", onclick);
        this.btn2.addEventListener("click", onclick);
    }
    /**
     * Initialize this tab.
     * @method
     */
    init() {
        this.btn1.classList.add("is-active");
        this.btn2.classList.add("is-active");
        this.content.classList.add("is-active");
        currentTabTextElement.textContent = this.btn2.children[1].textContent;

        currentTab = this;
        vAPI.localStorage.setItem("nanoDashboardLastVisitedTab", this.constructor.name);
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

// ===== Tab Objects =====

/**
 * The settings tab.
 * @const {Tab}
 */
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

        // Upgrade textbox
        const textboxes = document.querySelectorAll("#nano-section-settings input:not([class])");
        for (let i = 0; i < textboxes.length; i++) {
            let container = document.createElement("div");
            container.className = "mdl-textfield mdl-js-textfield nano-inline-textbox";

            let input = document.createElement("input");
            input.className = "mdl-textfield__input";
            input.type = textboxes[i].type;
            input.id = "nano-settings-upgraded-textbox-" + i;

            let label = document.createElement("label");
            label.className = "mdl-textfield__label";
            label.setAttribute("for", input.id);

            container.append(input, label);

            // Might need a polyfill for Edge
            // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
            textboxes[i].replaceWith(container);
        }
    }
    /**
     * No action buttons for settings tab.
     * @method
     * @override
     */
    init() {
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
};

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
        super.init();
        this.buttons = drawActionBtns(
            ["done", "update", "delete_forever"],
            [vAPI.i18n("3pApplyChanges"), vAPI.i18n("3pUpdateNow"), vAPI.i18n("3pPurgeAll")],
            // TODO
            [() => { }, () => { }, () => { }],
        );
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
 * The rules tab.
 * @const {Tab}
 */
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
    }
    /**
     * 4 buttons: Apply changes, Revert, Import and append, Export.
     * @method
     * @override
     */
    init() {
        super.init();
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "archive"],
            [vAPI.i18n("1pApplyChanges"), vAPI.i18n("genericRevert"), vAPI.i18n("1pImport"), vAPI.i18n("1pExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );
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
        super.init();
        this.buttons = drawActionBtns(
            ["done", "undo", "note_add", "archive"],
            [vAPI.i18n("whitelistApply"), vAPI.i18n("genericRevert"), vAPI.i18n("whitelistImport"), vAPI.i18n("whitelistExport")],
            // TODO
            [() => { }, () => { }, () => { }, () => { }],
        );
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
        super.init();
        this.buttons = drawActionBtns([], [], []);
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
        super.init();
        this.buttons = drawActionBtns([], [], []);
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
        super.init();
        this.buttons = drawActionBtns([], [], []);
    }
};

// ===== Bootstrap =====

{
    const lastTab = vAPI.localStorage.getItem("nanoDashboardLastVisitedTab");
    if (window[lastTab] instanceof Tab) {
        window[lastTab].init();
    } else {
        tabSettings.init();
    }
}
