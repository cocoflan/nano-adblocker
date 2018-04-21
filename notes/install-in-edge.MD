# Install in Edge

The Edge builds are still **experimental**, please report problems you
encounter, even minor ones! We ca not fix bugs that we are not aware of!

## Side Loading

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

Nano Defender is not quite ready yet, we are still working on it.

## Privacy Policy

Nano Adblocker and Nano Defender do not actively collect any data of any kind.

Nano Adblocker may connect to first-party or third-party servers to download
assets updates. Built-in assets are defined [here](/assets/assets.json). You
may import other assets, in which case Nano Adblocker will connect to
additional servers as per your instruction.

When connecting to first-party servers, Nano Adblocker *may* supply a version
key (a hard-coded random string generated at *compile time*). A cache buster
will be supplied to first-party and third-party servers, it will reveal your
system time accurate to 1 hour, your timezone will be kept private.

By default, Nano Adblocker will block tracking scripts that would not result in
breakage of the website, but there may be both false negatives and false
positives.

Nano Defender may connect to third-party servers when it is required for fixing
a website, only the bare minimum data required to successfully perform the
request will be sent. Nano Defender will never connect to a first-party server
unless you loaded it in debug mode.
