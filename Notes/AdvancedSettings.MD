# Advanced Settings

If you are not familiar with advanced settings of uBlock Origin, 
[first read this](https://github.com/gorhill/uBlock/wiki/Advanced-settings). 

In Nano Adblocker, most of the advanced settings are the same as uBlock Origin, however, the default value of some settings are 
different: 
- `assetFetchTimeout` defaults to `60`
- `manualUpdateAssetFetchPeriod` defaults to `500`

Beside different defaults, Nano Adblocker also offers a few more functionalities in the advanced settings page. These advanced 
settings can change and break at any time, make sure to backup your settings if you want to play around with them. Also file 
bug reports if they do break for you, or otherwise behave in a way that contradict the description below. 

### `Force recompile` button (Not yet available)

Discard compiled filters and selfies and recompile everything, Nano Adblocker will restart. Unsaved settings will be **discarded**. 
If you have changed a settings that requires a recompilation to work, you need to press `Apply changes` **first** to save that settings. 

How it works: When the button is clicked, `compiledMagic` and `selfieMagic` will be set to empty strings, and the extension will 
be reloaded to trigger recompilation. 

### `_nanoIgnoreThridPartyWhitelist` settings (Not yet available)

Default: `false`

When set to `true`, Nano Adblocker will discard exception and `badfilter` rules from all filter lists except `My filters` when 
compiling filters **in the future**. Filters that are already compiled will not be affected immediately. Use the `Force Recompile` 
button to trigger recompilation immediately. 

Enabling this settings **will** break many websites and you are to fix them **by yourself**. 

### `_nanoIgnorePerformanceAuditing` settings (Not yet available)

Default: `false`

When set to `true`, Nano Adblocker will no longer discard slow filters when compiling filters **in the future**. Filters that are 
already compiled will not be affected immediately. Use the `Force Recompile` button to trigger recompilation immediately. 

Enabling this settings will likely cause performanced to be flushed down the toilet, make sure you have a really fast computer when 
playing around with this settings. 
