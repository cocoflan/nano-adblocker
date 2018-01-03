#!/usr/bin/env bash
#
# This script assumes a linux environment

# Patch 2017-12-06: Point resources repository to our own
RESOURCES=NanoFilters
REMOTE=https://github.com/NanoAdblocker/NanoFilters.git

DES=$1/assets

printf "*** Packaging assets in $DES... "

if [ -n "${TRAVIS_TAG}" ]; then
  pushd .. > /dev/null
  git clone $REMOTE
  popd > /dev/null
fi

# Patch 2017-12-08: Clean up directory structure
rm -rf $DES
mkdir $DES
cp ./assets/assets.json $DES/

mkdir $DES/ThirdParty
cp -R ../$RESOURCES/ThirdParty/* $DES/ThirdParty/

mkdir $DES/NanoFilters
cp -R ../$RESOURCES/NanoFilters/* $DES/NanoFilters/

echo "done."
