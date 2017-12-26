# Advanced Settings

If you are not familiar with advanced settings of uBlock Origin, 
[**first read this**](https://github.com/gorhill/uBlock/wiki/Advanced-settings). 

In Nano Adblocker, most of the advanced settings are the same as uBlock Origin, however, the default value of some settings are 
different: 
- `assetFetchTimeout` defaults to `60`
- `manualUpdateAssetFetchPeriod` defaults to `500`

Beside different defaults, Nano Adblocker also offers a few more functionalities in the advanced settings page. These advanced 
functionalities **can change or break at any time**, make sure to backup your settings if you want to play around with them. Please 
open an issue when they break for you, or otherwise behave in a way that contradicts the description below. 

When a functionality is marked as not yet available, it may show in the advanced settings page, but will not work at all, not 
work as expected, or cause breakage when touched. 

### `_nanoForceRecompile` invokable (Not yet available)

When invoked, Nano Adblocker will discard compiled filters and selfies then restart, during which all filters will be recompiled. 
Unsaved settings will be **discarded**. If you have changed a settings that requires a recompilation to work, you need to press 
`Apply changes` **first** to save that settings. 

### `_nanoIgnoreThirdPartyWhitelist` toggleable (Not yet available)

Default: `false`

When set to `true`, Nano Adblocker will discard exception and `badfilter` rules from all filter lists except `My filters` when 
compiling filters **in the future**. Filters that are already compiled will not be affected immediately. Invoke `_nanoForceRecompile` 
to trigger recompilation immediately. 

Enabling this settings **will** break many websites and you are to fix them **by yourself**. 

### `_nanoIgnorePerformanceAuditing` toggleable (Not yet available)

Default: `false`

When set to `true`, Nano Adblocker will no longer discard slow filters when compiling filters **in the future**. Filters that are 
already compiled will not be affected immediately. Invoke `_nanoForceRecompile` to trigger recompilation immediately. 

Enabling this settings will likely cause performanced to be flushed down the toilet, make sure you have a *really* fast computer when 
playing around with this settings. 

### `_nanoMakeUserFiltersPrivileged` toggleable (Not yet available)

Default: `false`

When set to `true`, Nano Adblocker will treat user filters as a privileged filter. 

We have not yet decided what extra a privileged filter can do. 
