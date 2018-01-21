// JSON does not allow comments, which makes things too painful
(() => {
    "use strict";
    return {
        // Dialog buttons
        "genericYes": {
            "message": "是",
            "description": "Button 'Yes' for dialogs"
        },
        "genericNo": {
            "message": "否",
            "description": "Button 'No' for dialogs"
        },
        "genericOK": {
            "message": "确定",
            "description": "Button 'OK' for dialogs"
        },
        // Generic messages
        "genericUnsavedChange": {
            "message": "您确定要离开这个标签么？未保存的更改将会丢失。",
            "description": "Unsaved change warning"
        },
        "genericFilterReadError": {
            "message": "未能读取数据，请刷新。",
            "description": "Error when filter data could not be loaded"
        },
        "genericDataSaveError": {
            "message": "未能保存数据，请重试。",
            "description": "Error when changes could not be saved"
        },
        "genericNothingToExport": {
            "message": "没有任何数据需要导出。",
            "description": "Error when nothing to export"
        },

        // New cloud UI
        "nanoCloudNoData": {
            "message": "没有云端数据。",
            "description": "English: No cloud data"
        },
        "nanoCloudLastSync": {
            "message": "上次同步： {{device}} 在 {{time}}",
            "description": "English: Last sync: {{device}} at {{time}}"
        },
        "nanoCloudSyncFailed": {
            "message": "出现了一些问题：\n{{error}}",
            "description": "English: Something went wrong:\n{{error}}"
        },

        // Dashboard dialog messages
        "dashboardMutexError": {
            "message": "未能获取互斥锁，您是否已经打开一个控制面板了？",
            "description": "Error when mutex locked by another dashboard"
        },

        // Settings groups
        "settingGeneralGroup": {
            "message": "基本",
            "description": "Group 'General' of settings tab"
        },
        "settingUserInterfaceGroup": {
            "message": "界面",
            "description": "Group 'User interface' of settings tab"
        },
        "settingOtherGroup": {
            "message": "其他",
            "description": "Group 'Other' of settings tab"
        },
        // Settings prompts
        "settingsDashboardAllowSelectionPrompt": {
            "message": "允许在控制面板中选择文字",
            "description": "English: Allow text selection in dashboard"
        },
        "settingsEditorWordWrapPrompt": {
            "message": "在规则编辑器中启用自动换行（ soft warp ）",
            "description": "English: Soft wrap long lines in filter editor"
        },
        "settingsViewerWordWrapPrompt": {
            "message": "在规则查看器中启用自动换行（ soft warp ）",
            "description": "English: Soft wrap long lines in filter viewer"
        },
        // Extra strings for new dashboard
        "settingDiskUsage": {
            "message": "占用空间： ",
            "description": "English: Disk usage: "
        },
        "settingMebibyte": {
            "message": " MiB",
            "description": "English: MiB"
        },
        "settingsLastBackedupFilePrompt": {
            "message": "上次备份文件名： ",
            "description": "English: Last backed up file: "
        },
        "settingsLastRestoredFilePrompt": {
            "message": "上次恢复文件名： ",
            "description": "English: Last restored file: "
        },

        // The tab name of advanced settings
        "advancedPageName": {
            "message": "高级",
            "description": "Advanced settings tab name"
        },

        // Extra help messages for user filters
        "1pResourcesReference": {
            "message": "Nano 拥有两套资源，",
            "description": "English: Nano comes with two sets of resources,"
        },
        "1pResourcesOriginal": {
            "message": "uBlock Origin 的资源",
            "description": "English: uBlock Origin Resources"
        },
        "1pResourcesAnd": {
            "message": "和",
            "description": "English: and"
        },
        "1pResourcesNano": {
            "message": "Nano 的额外资源",
            "description": "English: Nano Extra Resources"
        },
        "1pResourcesPeriod": {
            "message": "。",
            "description": "English: ."
        },
        "1pFilterEditorHelp": {
            "message": "Nano 规则编辑器是由 Ace 驱动，大部分快捷键都一样。",
            "description": "Explain the similarity between Nano Filter Editor and Ace in terms of shortcut keys"
        },

        // Whitelist linter limit warnings
        "whitelistLinterAborted": {
            "message": "Nano 没有验证剩下的白名单，因为已经有过多的错误。",
            "description": "Warning when too many errors"
        },
        "whitelistLinterTooManyWarnings": {
            "message": "Nano 没有检查剩下的白名单，因为已经有过多的警告。",
            "description": "Warning when too many warnings"
        },
        // Whitelist linter errors
        "whitelistLinterInvalidHostname": {
            "message": "这个主机名称无效。",
            "description": "Error when hostname not valid"
        },
        "whitelistLinterInvalidRegExp": {
            "message": "这个正则表达式有语法错误。",
            "description": "Error when regular expression has syntax errors"
        },
        "whitelistLinterInvalidURL": {
            "message": "这个路径无效。",
            "description": "Error when a URL not valid"
        },
        // Whitelist linter warnings
        "whitelistLinterSuspeciousRegExp": {
            "message": "这行被解析成了正则表达式，您确定这是正确的么？",
            "description": "Warning when parsed as regular expression but is unlikely the intention of user"
        },

        // Tab name of hosts matrix
        "matrixPageName": {
            "message": "主机矩阵",
            "description": "Hosts matrix tab name"
        },

        // Title of filter viewer
        "filterViewerPageName": {
            "message": "Nano — 规则查看器",
            "description": "Title of the filter viewer"
        },

        // Based on message of about page
        "aboutBasedOn": {
            "message": "基于 {{@data}}",
            "description": "English: Based on {{@data}}"
        }
    };
})();
