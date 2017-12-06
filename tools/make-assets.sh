#!/usr/bin/env bash
#
# This script assumes a linux environment

# Patch 2017-12-06: Point resources repository to our own
RESOURCES=NanoResources
REMOTE=https://github.com/NanoAdblocker/NanoResources.git

DES=$1/assets

printf "*** Packaging assets in $DES... "

if [ -n "${TRAVIS_TAG}" ]; then
  pushd .. > /dev/null
  git clone $REMOTE
  popd > /dev/null
fi

rm -rf $DES
mkdir $DES
cp    ./assets/assets.json                                       $DES/

mkdir $DES/thirdparties
cp -R ../$RESOURCES/thirdparties/easylist-downloads.adblockplus.org $DES/thirdparties/
cp -R ../$RESOURCES/thirdparties/mirror1.malwaredomains.com         $DES/thirdparties/
cp -R ../$RESOURCES/thirdparties/pgl.yoyo.org                       $DES/thirdparties/
cp -R ../$RESOURCES/thirdparties/publicsuffix.org                   $DES/thirdparties/
cp -R ../$RESOURCES/thirdparties/www.malwaredomainlist.com          $DES/thirdparties/

mkdir $DES/ublock
cp -R ../$RESOURCES/filters/*                                       $DES/ublock/

echo "done."
