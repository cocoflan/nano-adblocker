// Bootstrap dashboard, load the last selected tab
"use strict";

{
    const lastTab = vAPI.localStorage.getItem("nanoDashboardLastVisitedTab");
    if (window[lastTab] instanceof Tab) {
        window[lastTab].init();
    } else {
        tabSettings.init();
    }
}
