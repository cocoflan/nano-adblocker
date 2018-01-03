// JSON does not allow comments, which makes things too painful
(() => {
    "use strict";
    return {
        // Dialog buttons
        "genericYes": {
            "message": "Yes",
            "description": "Button 'Yes' for dialogs"
        },
        "genericNo": {
            "message": "No",
            "description": "Button 'No' for dialogs"
        },
        "genericOK": {
            "message": "OK",
            "description": "Button 'OK' for dialogs"
        },
        // Generic messages
        "genericUnsavedChange": {
            "message": "Do you want to leave this tab? Changes you made will not be saved.",
            "description": "Unsaved change warning"
        },
        "genericFilterReadError": {
            "message": "# Could not load data, please refresh.",
            "description": "Placeholder when filter data could not be loaded"
        },
        "genericDataSaveError": {
            "message": "Could not save data, please try again.",
            "description": "Error when changes could not be saved"
        },
        "genericNothingToExport": {
            "message": "Nothing to export.",
            "description": "Error when nothing to export"
        },

        // New cloud UI
        "nanoCloudNoData": {
            "message": "No cloud data",
            "description": "English: No cloud data"
        },
        "nanoCloudLastSync": {
            "message": "Last sync: {{device}} at {{time}}",
            "description": "English: Last sync: {{device}} at {{time}}"
        },
        "nanoCloudSyncFailed": {
            "message": "Something went wrong:\n{{error}}",
            "description": "English: Something went wrong:\n{{error}}"
        },

        // Dashboard dialog messages
        "dashboardMutexError": {
            "message": "Could not obtain mutex lock, do you have another dashboard open?",
            "description": "Error when mutex locked by another dashboard"
        },

        // Settings groups
        "settingGeneralGroup": {
            "message": "General",
            "description": "Group 'General' of settings tab"
        },
        "settingUserInterfaceGroup": {
            "message": "User interface",
            "description": "Group 'User interface' of settings tab"
        },
        "settingOtherGroup": {
            "message": "Other",
            "description": "Group 'Other' of settings tab"
        },
        // Settings prompts
        "settingsDashboardAllowSelectionPrompt": {
            "message": "Allow text selection in dashboard",
            "description": "English: Allow text selection in dashboard"
        },
        "settingsEditorWordWrapPrompt": {
            "message": "Soft wrap long lines in filter editor",
            "description": "English: Soft wrap long lines in filter editor"
        },
        "settingsViewerWordWrapPrompt": {
            "message": "Soft wrap long lines in filter viewer",
            "description": "English: Soft wrap long lines in filter viewer"
        },
        // Extra strings for new dashboard
        "settingDiskUsage": {
            "message": "Disk usage: ",
            "description": "English: Disk usage: "
        },
        "settingMebibyte": {
            "message": " MiB",
            "description": "English: MiB"
        },
        "settingsLastBackedupFilePrompt": {
            "message": "Last backed up file: ",
            "description": "English: Last backed up file: "
        },
        "settingsLastRestoredFilePrompt": {
            "message": "Last restored file: ",
            "description": "English: Last restored file: "
        },

        // The tab name of advanced settings
        "advancedPageName": {
            "message": "Advanced",
            "description": "Advanced settings tab name"
        },

        // Extra help messages for user filters
        "1pResourcesReference": {
            "message": "Nano comes with two sets of resources,",
            "description": "English: Nano Adblocker comes with two sets of resources,"
        },
        "1pResourcesOriginal": {
            "message": "uBlock Origin Resources",
            "description": "English: uBlock Origin Resources"
        },
        "1pResourcesAnd": {
            "message": "and",
            "description": "English: and"
        },
        "1pResourcesNano": {
            "message": "Nano Extra Resources",
            "description": "English: Nano Extra Resources"
        },
        "1pResourcesPeriod": {
            "message": ".",
            "description": "English: ."
        },
        "1pFilterEditorHelp": {
            "message": "Nano Filter Editor is powered by Ace and most shortcut keys works the same.",
            "description": "Explain the similarity between Nano Filter Editor and Ace in terms of shortcut keys"
        },

        // Whitelist linter limit warnings
        "whitelistLinterAborted": {
            "message": "Nano did not scan the rest of the lines for errors because there are too many errors.",
            "description": "Warning when too many errors"
        },
        "whitelistLinterTooManyWarnings": {
            "message": "Nano did not scan the rest of the lines for warnings because there are too many warnings.",
            "description": "Warning when too many warnings"
        },
        // Whitelist linter errors
        "whitelistLinterInvalidHostname": {
            "message": "This host name is not valid.",
            "description": "Error when hostname not valid"
        },
        "whitelistLinterInvalidRegExp": {
            "message": "This regular expression has syntax errors.",
            "description": "Error when regular expression has syntax errors"
        },
        "whitelistLinterInvalidURL": {
            "message": "This URL is not valid.",
            "description": "Error when a URL not valid"
        },
        // Whitelist linter warnings
        "whitelistLinterSuspeciousRegExp": {
            "message": "This line is treated as a regular expression, is that intended?",
            "description": "Warning when parsed as regular expression but is unlikely the intention of user"
        },

        // Filter linter limit warnings
        "filterLinterTooManyErrors": {
            "message": "Nano did not scan the rest of the lines for errors because there are too many errors.",
            "description": "Error when too many errors"
        },
        "filterLinterTooManyWarnings": {
            "message": "Nano did not scan the rest of the lines for warnings because there are too many warnings.",
            "description": "Warning when too many warnings"
        },
        // Filter linter special deprecation warnings
        "filterLinterDeprecatedCommentBracket": {
            "message": "Using '[' to denote comment is deprecated, use '!' instead.",
            "description": "Deprecation when '[' used for comments"
        },
        "filterLinterDeprecatedInlineComment": {
            "message": "Inline comments are deprecated.",
            "description": "Deprecation when inline comments"
        },
        // Filter linter special errors
        "filterLinterInternalErrorCosmeticFilterPassedThrough": {
            "message": "A cosmetic filter passed through the cosmetic filter compiler, please file a bug report.",
            "description": "Internal error when cosmetic filter compiler is bugged"
        },
        // Cosmetic filtering errors
        "filterLinterRejectedAdguardJSInjection": {
            "message": "Raw JavaSript injection is not accepted due to security concerns.",
            "description": "Error when raw JavaScript injection"
        },
        "filterLinterRejectedStyleInjection": {
            "message": "This CSS injection rule has syntax errors.",
            "description": "Error when CSS injection has syntax errors"
        },
        "filterLinterRejectedCosmeticTooExpensive": {
            "message": "This cosmetic or script snippet rule is too expensive to be applied generically, it must be limited to specific domains.",
            "description": "Error when cosmetic or script snippet has no domain"
        },
        "filterLinterRejectedCosmeticBadIdSelector": {
            "message": "This cosmetic rule contains an invalid id selector.",
            "description": "Error when cosmetic has bad id selector"
        },
        "filterLinterRejectedCosmeticBadClassSelector": {
            "message": "This cosmetic rule contains an invalid class selector.",
            "description": "Error when cosmetic has bad class selector"
        },
        "filterLinterRejectedBadCSSSyntax": {
            "message": "This cosmetic rule has CSS syntax errors.",
            "description": "Error when cosmetic has CSS syntax errors"
        },
        "filterLinterRejectedUnrecognizedExtendedSyntaxOperator": {
            "message": "This procedural cosmetic rule contains an unrecognized operator.",
            "description": "Error when procedural cosmetic has unknown operator"
        },
        "filterLinterRejectedBadProceduralSelector": {
            "message": "This procedural cosmetic rule has syntax errors.",
            "description": "Error when procedural cosmetic has syntax errors"
        },
        // Network filtering warnings
        "filterLinterWarningDiscardedNonNegatableType": {
            "message": "Nano discarded the type option '{{type}}' because it cannot be negated.",
            "description": "English: Nano discarded the type option '{{type}}' because it cannot be negated."
        },
        "filterLinterWarningExpandedMp4Option": {
            "message": "Nano replaced the option 'mp4' with 'media,redirect=nano-noopmp4-1s'.",
            "description": "Warning when 'mp4' is replaced"
        },
        "filterLinterWarningDeprecatedMp4Option": {
            "message": "The use of the option 'mp4' is deprecated, write out the full options instead.",
            "description": "Deprecation when 'mp4'"
        },
        "filterLinterWarningUnsupportedTypeIgnored": {
            "message": "Nano discarded type options that are not yet supported.",
            "description": "Warning when unsupported type options discarded but not entire rule"
        },
        "filterLinterWarningRedirectNoType": {
            "message": "Nano discarded the option 'redirect=...' because it requires a type option.",
            "description": "Warning when 'redirect=' has no type"
        },
        "filterLinterWarningRedirectTooManyTypes": {
            "message": "Nano discarded the option 'redirect=...' because it has too many type options.",
            "description": "Warning when 'redirect=' has too many types"
        },
        "filterLinterWarningRedirectNoResourceToken": {
            "message": "Nano discarded the option 'redirect=...' because it has no arguments.",
            "description": "Warning when 'redirect=' has no arguments"
        },
        "filterLinterWarningRedirectNoSupportedType": {
            "message": "Nano discarded the option 'redirect=...' because it has no supported type option.",
            "description": "Warning when 'redirect=' has no supported type"
        },
        "filterLinterWarningRedirectNegatedDomain": {
            "message": "Nano discarded an argument from the option 'domain=...' because negated domains cannot be used with the option 'redirect=...'.",
            "description": "Warning when negated domain used with 'redirect='"
        },
        "filterLinterWarningRedirectNoValidDestinationDomain": {
            "message": "Nano discarded the option 'redirect=...' because it has no valid destination domain.",
            "description": "Warning when 'redirect=' has no destination"
        },
        "filterLinterWarningRedirectPureHostname": {
            "message": "Nano discarded the option 'redirect=...' because it cannot be used with a pure host name rule.",
            "description": "Warning when 'redirect=' pure host name"
        },
        "filterLinterWarningRedirectDoesNotMatchRegExp": {
            // TODO 2017-12-28: Think of a better warning message
            "message": "Nano discarded the option 'redirect=...' because this network rule does not match this regular expression: {{regexp}}",
            "description": "Warning when 'redirect=' failed initial test, use '{{regexp}}' to denote the tester if needed"
        },
        // Network filtering errors
        "filterLinterDiscardedLocalhostHostEntry": {
            "message": "This host file entry is discarded because it is localhost declaration.",
            "description": "Error when localhost declaration"
        },
        "filterLinterRejectedAdguardElementRemove": {
            "message": "Element remove rules with Adguard syntax are not yet supported.",
            "description": "Error when Adguard style element remove rule"
        },
        "filterLinterRejectedNegatedGenerichide": {
            "message": "The options 'generichide', 'ghide', and 'elemhide' cannot be negated.",
            "description": "Error when 'generichide' is negated"
        },
        "filterLinterRejectedRedirectInException": {
            "message": "The option 'redirect=...' cannot be used in exception rules.",
            "description": "Error when 'redirect=' used in exception"
        },
        "filterLinterRejectedBadDomainOptionArguments": {
            "message": "The option 'domain=...' has invalid arguments.",
            "description": "Error when 'domain=' has invalid arguments"
        },
        "filterLinterRejectedBadCspOptionArguments": {
            "message": "The option 'csp=...' has invalid arguments.",
            "description": "Error when 'csp=' has invalid arguments"
        },
        "filterLinterRejectedUnknownOption": {
            "message": "The option '{{option}}' is not recognized.",
            "description": "English: The option '{{option}}' is not recognized."
        },
        "filterLinterRejectedOnlyUnsupportedType": {
            "message": "A type option is not yet supported.",
            "description": "Error when unsupported type option used and entire rule discarded"
        },
        "filterLinterRejectedNetworkBadRegExp": {
            "message": "This network rule has regular expression syntax errors.",
            "description": "Error when network has regular expression syntax errors"
        },
        "filterLinterRejectedInterventionForSMed79": {
            // https://github.com/chrisaljoudi/uBlock/issues/1096
            "message": "The domain anchor may not be immediately followed by '^'.",
            "description": "Error when the bad filter from SMed79 is discarded"
        },

        // Tab name of hosts matrix
        "matrixPageName": {
            "message": "Hosts matrix",
            "description": "Hosts matrix tab name"
        },

        // Title of filter viewer
        "filterViewerPageName": {
            "message": "Nano — Filter Viewer",
            "description": "Title of the filter viewer"
        },

        // Based on message of about page
        "aboutBasedOn": {
            "message": "Based on uBlock Origin {{@version}}",
            "description": "English: Based on uBlock Origin {{@version}}"
        }
    };
})();
