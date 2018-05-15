# Nano Adblocker Core

Just another adblocker

Nano Adblocker is based on [uBlock Origin](https://github.com/gorhill/uBlock).

Please open an issue if there is something you want us to know.

*Chrome Web Store approves new builds **within seconds** but Microsoft Store
takes weeks for a new version to be published, so the Edge version will be
somewhat behind and that is out of my control.*

### [Get it for Chrome](https://chrome.google.com/webstore/detail/nano-adblocker/gabbbocakeomblphkmmnoamkioajlkfo)

### [(Beta) Get it for Edge](https://www.microsoft.com/store/productId/9NSXDX2TDB3V)

### Maintainers wanted for other browsers (open an issue and let me know)

### [Get Nano Defender, the perfect companion extension for Nano Adblocker](https://jspenguin2017.github.io/uBlockProtector/)

## For Developers

### [Edge version discussion thread](https://github.com/NanoAdblocker/NanoCore/issues/40)

### [Firefox version discussion thread](https://github.com/NanoAdblocker/NanoCore/issues/41)

## Notable Change

<!--
### \[[Work in progress](https://github.com/NanoAdblocker/NanoCore/issues/33)\] Nano Dashboard, clean and modern

![Screenshot](https://i.imgur.com/LUAu7KO.png)

Not yet available
-->

### \[[Work in progress](https://github.com/NanoAdblocker/NanoCore/issues/1)\] Nano Filter Linter, neat and saves frustration

#### Know exactly why your rule is misbehaving

![Screenshot](https://i.imgur.com/zboYYEr.png)

<!--
#### Get notified for common mistakes

![Screenshot](https://i.imgur.com/IkTaEQ3.png)
-->

Partially available since 1.0.0.22

### Nano Filter Viewer, powerful and blazing fast

![Screenshot](https://i.imgur.com/fZh4Hqn.png)

Available since 1.0.0.10

### [Nano Extra Resources](https://github.com/NanoAdblocker/NanoFilters/blob/master/NanoFiltersSource/NanoResources.txt), useful and configurable

![Screenshot](https://i.imgur.com/0HIYf4d.png)

Available since 1.0.0.6

### Nano Filter Highlighter, beautiful and helpful

![Screenshot](https://i.imgur.com/KktoFJL.png)

Available since 1.0.0.0

## Other Change

*Note: user interface and other housekeeping changes are not listed here.*

- [Extended advanced settings](/notes/advanced-settings.MD#advanced-settings)
- [Extended filter syntax](/notes/filter-syntax.MD#filter-syntax)
- [Polished filter list subscription process](/notes/filter-list-authoring.MD#filter-list-authoring)
- [Added whitelists for Edge build](/notes/dashboard-whitelist.MD#dashboard-whitelist)
- Enabled `Block CSP reports` by default (to prevent websites from abusing it
  to track users)
- Added a few more filters to filters manager
- Made cache control button to be always shown
- Added force scroll mode (to be used with element zapper)

There are also a few changes specifically for Edge: 
- Mapped `fetch` requests to `xhr`
- Fixed the popup panel in logger
- Fixed advanced settings button in dashboard

## Pending Features

We are constantly improving! The list of pending features can be found
[here](/notes/pending-features.MD#pending-features).
