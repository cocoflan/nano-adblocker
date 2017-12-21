// Bootstrap dashboard, load the last selected tab
"use strict";

(async () => {
    // I got an email saying it does not work at all, well, the new dashboard does not always work as it
    // is not done yet, I don't think I have any link that leads to it in user-accessible UI
    // Automatically bump back to old dashboard if not loaded in developer mode
    if (vAPI.getExtensionID() !== NanoAdblockerDeveloperModeExtensionID) {
        location.href = "dashboard.html";
        return;
    }

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

    addEventListener("beforeunload", (e) => {
        if (currentTab && currentTab.hasChanges()) {
            // Calling e.preventDefault() is the only correct way to handle this, but unfortunately browsers
            // are ignoring the specs
            // https://html.spec.whatwg.org/multipage/browsing-the-web.html#the-beforeunloadevent-interface
            //e.preventDefault();

            const msg = vAPI.i18n("genericUnsavedChange");
            e.returnValue = msg;
            return msg;
        }
    });
})();
