# \[Work In Progress Documentation\] Filter Incompatibility

**This documentation is a draft, and may not be accurate.**

A lot of filters work in both Nano Adblocker and uBlock Origin, however, there are some differences in how filters are handled 
when it comes to edge cases. 

## Extra Resources

Nano Adblocker has [extra resources](https://github.com/NanoAdblocker/NanoFilters/blob/master/NanoFilters/NanoResources.txt), 
when a filter references one of those resources, it will not work as intended in uBlock Origin out of the box. You can load those 
extra resources to uBlock Origin in advanced settings. 

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

When any of these convenience options are used, uBlock Origin will discard the filter. 

## The Option `mp4`

Nano Adblocker will replace the option `mp4` with `media,redirect=nano-noopmp4-1s`, uBlock Origin will instead discard the filter. 

This option should not be negated, however, Nano Adblocker will treat `~mp4` to be the same as `mp4`. 

This option is from Adguard and means redirect MP4 requests to a blank MP4 file, Nano Adblocker will instead redirect media requests 
to a blank MP4 file. Keep in mind that not all media requests are MP4 requests and not all MP4 requests are media requests. Because 
of this difference, **this option may change in the future without notice**. 

A deprecation warning will be dispatched when this option is used in Nano Adblocker. 

## The Option `empty`

Nano Adblocker will discard the filter if it has the option `empty`, uBlock Origin will instead ignore the option. 

This option is from Adguard and means redirect requests to an appropriate blank file, ignoring the option and block the request 
instead will likely make things worse. 
