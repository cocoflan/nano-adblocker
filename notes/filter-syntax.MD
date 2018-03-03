# Filter Syntax

If you are not familiar with filter syntax of uBlock Origin,
[**please read this first**](https://github.com/gorhill/uBlock/wiki/Static-filter-syntax).

In Nano Adblocker, most of the filter syntax are the same as uBlock Origin,
however, there are a few exceptions.

## Extra Resources

Nano Adblocker has
[extra resources](https://raw.githubusercontent.com/NanoAdblocker/NanoFilters/master/NanoFilters/NanoResources.txt),
and when a filter references one of those resources, it will not work as
intended in uBlock Origin out of the box. You can, however, load those extra
resources to uBlock Origin in advanced settings to make those filters work.

## Convenience Options

Nano Adblocker will map options as follows for convenience:
```
    3p -> third-party
    1p -> first-party

 ghide -> generichide
   css -> stylesheet
iframe -> subdocument
   xhr -> xmlhttprequest
```

When any of these convenience options are used, uBlock Origin will discard the
filter.

If any of the mapped option gets another meaning in uBlock Origin, **this
mapping will change without notice**.

## The Option `mp4`

Nano Adblocker will replace the option `mp4` with
`media,redirect=nano-noopmp4-1s`, uBlock Origin will instead discard the filter.

This option should not be negated, however, Nano Adblocker will treat `~mp4` to
be the same as `mp4`, **this may change in the future without notice**.

This option is from Adguard and means redirect MP4 requests to a blank MP4 file,
Nano Adblocker will instead redirect media requests to a blank MP4 file. Keep
in mind that not all media requests are MP4 requests and not all MP4 requests
are media requests. Because of this difference, **this option may change in the
future without notice**.

A deprecation warning will be dispatched when this option is used in Nano
Adblocker.

## The Option `empty`

Nano Adblocker will discard the filter if it has the option `empty`, uBlock
Origin will instead ignore the option.

This option is from Adguard and means redirect requests to an appropriate
blank file, ignoring the option and block the request instead will likely to
make things worse.
