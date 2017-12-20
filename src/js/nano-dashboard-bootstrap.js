// Bootstrap dashboard, load the last selected tab
"use strict";

(async () => {
    window.allowTextSelection = await readOneSettings("nanoDashboardAllowSelection");
    window.disableTooltips = await readOneSettings("tooltipsDisabled");

    updateCSS();

    const lastTab = vAPI.localStorage.getItem("nanoDashboardLastVisitedTab");
    if (window[lastTab] instanceof Tab) {
        window[lastTab].init();
    } else {
        tabSettings.init();
    }
})();
