# Update Behavior

Nano Adblocker will read `! Expire` header to extract update information, and defaults to 3 days if the header is missing. This default 
is 5 days in uBlock Origin. 

The lower cap of update period is 1 day and the upper cap is 30 days. In uBlock Origin, the lower cap is 2 days and there is no upper 
cap. Nano Adblocker respects your choise as filter maintainer to choose daily update, but you are responsible in

Nano Adblocker allows you to use hour as unit, but will round it *up* to the nearest day, the caps still apply. uBlock Origin will 
ignore the header if hour is used as unit. 

You must use integer in either case, otherwise the header is ignored. 
