# Advanced Settings

If you are not familiar with advanced settings of uBlock Origin, 
[**first read this**](https://github.com/gorhill/uBlock/wiki/Advanced-settings). 

In Nano Adblocker, most of the advanced settings are the same as uBlock Origin, however, the default value of some settings are 
different: 
- `assetFetchTimeout` defaults to `60`
- `autoUpdateAssetFetchPeriod` defaults to `300` <sup>1</sup>
- `manualUpdateAssetFetchPeriod` defaults to `1` <sup>1</sup>

Beside different defaults, Nano Adblocker also offers a few more functionalities in the advanced settings page. These advanced 
functionalities **can change or break at any time**, make sure to backup your settings if you want to play around with them. Please 
open an issue when they break for you, or otherwise behave in a way that contradicts the description below. We cannot fix issues 
that we are not aware of, please take the time to report issues you encounter. 

<sup>1</sup> When fetching assets, you should either get them all done in one burst or wait a significant delay between them if you 
need to spread things out. It is expensive to keep sockets open and it is even more expensive to create new sockets. In fact, 
holding sockets open is how [Slowloris](https://en.wikipedia.org/wiki/Slowloris_(computer_security)) attacks are carried out. 

---

When a functionality is marked as `[unavailable]`, it may show in the advanced settings page, but will not work at all, not 
work as expected, or cause breakage when touched. 

When a functionality is marked as `[experimental]`, it may work properly, work sometimes, not work at all, not work as expected, or 
cause breakage when touched. 

Even when a functionality is considered stable, it is not guaranteed to always work. **Use at your own risk!** 

---

### `_nanoForceRecompile` invokable `[experimental]`

Available since 1.0.0.22

When invoked, Nano Adblocker will discard compiled filters and selfies then restart, during which *all* filters will be recompiled. 
**Any unsaved changes will be discarded** during the restart and all opened extension pages will be closed. 

---

### `_nanoDisconnectFrom_jspenguincom` toggleable `[unavailable]`

Default: `false`

*Note: Nano Adblocker does not connect to `jspenguin.com` yet, this option will become available as soon as it does.*

When set to `true`, Nano Adblocker will no longer send background requests to `jspenguin.com`. Consequently, some default filters and 
internal assets will update up to 5 times *less* frequently and you can no longer report broken websites from the popup panel. 

---

### `_nanoIgnorePerformanceAuditing` toggleable `[unavailable]`

Default: `false`

When set to `true`, Nano Adblocker will no longer discard slow filter rules from `My filters` when compiling filters **in the 
future**. Similarly, setting this toggle to `false` **or turning off advanced mode** will **not** cause slow filters to be 
immediately removed. 

Performanced *will* be flushed down the toilet if not used properly, make sure you have a *really* fast computer when playing 
around with this settings. 

---

### `_nanoIgnoreThirdPartyWhitelist` toggleable `[experimental]`

Available since 1.0.0.22

Default: `false`

When set to `true`, Nano Adblocker will discard exception and `badfilter` rules from all filter lists except `My filters` when 
compiling filters **in the future**. Similarly, setting this toggle to `false` **or turning off advanced mode** will **not** 
cause discarded filters to be immediately restored. 

Negated domains are sometimes transformed into exception rules, they will not be affected **for now**. This is really hard to fix 
due to the parsing logic is not designed with discarding whitelists in mind. 

Setting this toggle to `true` **will definitely** break *many* websites and you are to fix them **by yourself**. 

---

### `_nanoMakeUserFiltersPrivileged` toggleable

Available since 1.0.0.22

Default: `false`

When set to `true`, Nano Adblocker will treat user filters as a privileged filter. 

Privileged filters have access to experimental syntax features **if there are any**. Nano Adblocker's own filters are always 
privileged. 
