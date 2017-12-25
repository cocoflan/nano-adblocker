#!/usr/bin/env bash
#
# This script assumes a linux environment

# Patch 2017-12-06: Point resources repository to our own
RESOURCES=NanoResources

echo "*** uBlock: generating checksums.txt file..."

truncate -s 0 assets/checksums.txt

echo `md5sum assets/ublock/filter-lists.json` >> assets/checksums.txt

filters=(
    '../$RESOURCES/filters/badware.txt'
    '../$RESOURCES/filters/experimental.txt'
    '../$RESOURCES/filters/filters.txt'
    '../$RESOURCES/filters/privacy.txt'
    '../$RESOURCES/filters/resources.txt'
    '../$RESOURCES/filters/unbreak.txt'
)
for repoPath in "${filters[@]}"; do
    localPath=`printf $repoPath | sed 's/\.\.\/$RESOURCES\/filters/assets\/ublock/'`
    cp $repoPath $localPath
    echo `md5sum $localPath` >> assets/checksums.txt
done

thirdparties=(
    '../$RESOURCES/thirdparties/easylist-downloads.adblockplus.org/easylist.txt'
    '../$RESOURCES/thirdparties/easylist-downloads.adblockplus.org/easyprivacy.txt'
    '../$RESOURCES/thirdparties/mirror1.malwaredomains.com/files/justdomains'
    '../$RESOURCES/thirdparties/pgl.yoyo.org/as/serverlist'
    '../$RESOURCES/thirdparties/publicsuffix.org/list/effective_tld_names.dat'
    '../$RESOURCES/thirdparties/www.malwaredomainlist.com/hostslist/hosts.txt'
)
for repoPath in "${thirdparties[@]}"; do
    localPath=`printf $repoPath | sed 's/\.\.\/$RESOURCES\/thirdparties/assets\/thirdparties/'`
    cp $repoPath $localPath
    echo `md5sum $localPath` >> assets/checksums.txt
done

echo "*** uBlock: checksums updated."

git status assets/
