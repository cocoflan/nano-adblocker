# Filter Incompatibility

Nano Adblocker and uBlock Origin share a lot of filters, however, there are some differences in how filters are handled. 

## Extra Resources

Nano Adblocker has [extra resources](https://github.com/NanoAdblocker/NanoFilters/blob/master/NanoFilters/NanoResources.txt), 
when a filter reference one of these resources, it will not work as intended in uBlock Origin out of the box. You can load those 
extra resources with advanced settings. 

## `mp4` Option

Nano Adblocker will expand the option `mp4` to `media,redirect=nano-noopmp4-1s`, uBlock Origin will instead discard the filter. 

## `empty` Option

Nano Adblocker will discard the filter when it has the option `empty`, uBlock Origin will instead ignore the option. 

This option is from Adguard and means redirect to an appropriate blank file instead of blocking the request, ignoring the option 
is likely to make things worse. 
