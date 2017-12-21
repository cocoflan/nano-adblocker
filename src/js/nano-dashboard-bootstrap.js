// Bootstrap dashboard, load the last selected tab
"use strict";

(async () => {
    allowTextSelection = await readOneSettings("nanoDashboardAllowSelection");
    disableTooltips = await readOneSettings("tooltipsDisabled");
    updateCSS(); // Assertion inside

    hasMutex = await new Promise((resolve) => {
        vAPI.messaging.send("dashboard", { what: "obtainDashboardMutex" }, (data) => {
            resolve(data);
        });
    });

    console.assert(typeof hasMutex === "boolean");

    if (hasMutex) {
        const lastTab = vAPI.localStorage.getItem("nanoDashboardLastVisitedTab");
        if (window[lastTab] instanceof Tab) {
            window[lastTab].init();
        } else {
            tabSettings.init();
        }
    } else {
        showInfoModal(vAPI.i18n("dashboardMutexError"));
    }
})();
