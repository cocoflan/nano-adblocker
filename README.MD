# Nano Adblocker Core

Just another adblocker

Nano Adblocker is based on [uBlock Origin](https://github.com/gorhill/uBlock).

Please open an issue if there is something you want us to know.

This repository contains the legacy code of Nano Adblocker, the new code can be
found in the
[Nano Core 2 repository](https://github.com/NanoAdblocker/NanoCore2).

*Chrome Web Store approves new builds **within seconds** but Microsoft Store
takes weeks for a new version to be published, so the Edge version will be
somewhat behind and that is out of my control.*

### [Get it for Chrome](https://chrome.google.com/webstore/detail/nano-adblocker/gabbbocakeomblphkmmnoamkioajlkfo)

### [Get it for Edge (Beta)](https://www.microsoft.com/store/productId/9NSXDX2TDB3V)

### Maintainers wanted for other browsers (open an issue and let me know)

### [Get Nano Defender, the perfect companion extension for Nano Adblocker](https://jspenguin2017.github.io/uBlockProtector/)

## For Developers

### [Edge version discussion thread](https://github.com/NanoAdblocker/NanoCore/issues/40)

## Notable Change

### \[[Work in progress](https://github.com/NanoAdblocker/NanoCore/issues/1)\] Nano Filter Linter, neat and saves frustration

![Screenshot](https://i.imgur.com/SStKkqq.png)

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

- [Extended advanced settings](https://github.com/NanoAdblocker/NanoCore2/blob/master/notes/advanced_settings.md#advanced-settings)
- [Tweaked filter syntax](https://github.com/NanoAdblocker/NanoCore2/blob/master/notes/filter_syntax.md#filter-syntax)
- Enabled `Block CSP reports` by default (to prevent websites from abusing it
  to track users)
- Added a few more filters to filters manager
- Made cache control button to be always shown
- Added force scroll mode (to be used with element zapper)

There are also a few changes specifically for Edge:
- Mapped `fetch` requests to `xhr`
- Fixed the popup panel in logger
- Fixed advanced settings button in dashboard
- Fixed issues with InPrivate mode
