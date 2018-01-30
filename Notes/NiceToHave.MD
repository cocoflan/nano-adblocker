# Nice To Have

These features are marked as nice to have. Pull requests welcomed. 

## Group 1

These are features that we would like to use and we may implement them in the future. 

---

Make `_nanoIgnoreThirdPartyWhitelist` also discard rules transformed to exception rules due to only having negated domains. 

`easy` `low priority`

## Group 2

These are features that we would accept but are unlikely to be implemented by ourselves, please submit pull request if you implemented 
them. 

---

Option to make synchronization automatic. Could be difficult to get it right. 

https://github.com/gorhill/uBlock/issues/783

---

Add clear statistics. 

`easy`

https://github.com/gorhill/uBlock/issues/3315

---

An option to not collapse network-blocked resource on a per-domain or URL basis. 

ABP seems to have the option `$~collapse`

`hard`

https://github.com/gorhill/uBlock/issues/1146

---

Whitelist for a limited amount of time or until page close. 

How should cache be handled?

https://github.com/gorhill/uBlock/issues/3178

---

Clicking domain in popup UI expand that one domain. 

`low priority`

https://github.com/gorhill/uBlock/issues/284

---

Add button to Logger for disabling selected filter
Use `badfilter` for network filters and `#@#` for others, not possible to neutralize all filters as of now

---

Add undo button for wizard-created filters
https://github.com/gorhill/uBlock/issues/515

---

Count script snippets separately. 

`low priority`

https://github.com/gorhill/uBlock/issues/2837

---

Add dark theme. 

Maybe separate settings for normal and incognito mode?

Blocked by https://github.com/NanoAdblocker/NanoCore/issues/33

`blocked` `low priority`

https://github.com/gorhill/uBlock/issues/3342

---

Add tool tips to Logger. 

`Low priority`

---

Public API for better integration with other extensions. 

It is more difficult than it sounds, as we also need a white list manager for which extension is allowed to connect. 

`low priority`

https://github.com/gorhill/uBlock/issues/3352

---

Add XPath 3.1 polyfill. 

`under consideration` `low priority`

https://github.com/gorhill/uBlock/issues/3389
