# Install in Edge

The Edge builds are still **experimental**, please report problems you
encounter, even minor ones! We ca not fix bugs that we are not aware of!

## Installation

1. Download build(s) from the
   [release page](https://github.com/NanoAdblocker/NanoCore/releases) and
   extract it. Both Nano Adblocker and Nano Defender are located there.

2. Open Edge, open `Settings` pannel, scroll all the way down, you should see
   a version number that is at least `40.15063.674.0`. If not, you need to
   first update Windows. 

3. Enter the page `about:flags` and check `Enable extension developer features`.

4. Restart Edge, open `Extensions` pannel, click `Load extension` button to side
   load the extracted package(s) from step 1.

## Other Information

Edge will disable side loaded extensions on every launch, but please still
spend the time to test it, so we can have a smooth release.

Nano Adblocker is certification, it should be availalbe in a few days on
Microsoft Store.

## Privacy Policy

Nano Adblocker and Nano Defender do not actively collect any data of any kind.

Nano Adblocker may connect to third party servers to download assets updates.
Built-in assets are defined [here](assets/assets.json). You may import other
assets, in which case Nano Adblocker will connect to additional servers as
per your instruction.

When connecting to those servers, Nano Adblocker *may* supply a version key (a
hard coded random string generated at *compile time*) in addition to normal
data for a request.

By default, Nano Adblocker will block tracking scripts that would not result in
breakage of the website, but there may be both false negative and false positive.
