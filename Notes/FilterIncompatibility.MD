# \[Work In Progress Documentation\] Filter Incompatibility

**This documentation is a draft, and may not be accurate.**

A lot of filters work in both Nano Adblocker and uBlock Origin, however, there are some differences in how filters are handled 
when it comes to edge cases. 

## Extra Resources

Nano Adblocker has [extra resources](https://github.com/NanoAdblocker/NanoFilters/blob/master/NanoFilters/NanoResources.txt), 
when a filter references one of those resources, it will not work as intended in uBlock Origin out of the box. You can load those 
extra resources to uBlock Origin in advanced settings. 

## The Option `xhr`

Nano Adblocker will map the option `xhr` to `xmlhttprequest`, uBlock Origin will instead discard the filter. 

This option is mostly for convenience, if you want your filter to work on uBlock Origin, you should write the long form out, 
no warnings will be dispatched when the shortcut is used in Nano Adblocker. 

## The Option `mp4`

Nano Adblocker will replace the option `mp4` with `media,redirect=nano-noopmp4-1s`, uBlock Origin will instead discard the filter. 

This option is from Adguard and means redirect MP4 requests to a blank MP4 file, Nano Adblocker will instead redirect media requests 
to a blank MP4 file. Keep in mind that not all media requests are MP4 requests and not all MP4 requests are media requests. 
A deprecation warning will be dispatched when this option is used in Nano Adblocker. 

## The Option `empty`

Nano Adblocker will discard the filter if it has the option `empty`, uBlock Origin will instead ignore the option. 

This option is from Adguard and means redirect to an appropriate blank file instead of blocking the request, ignoring the option 
will likely make things worse. 
