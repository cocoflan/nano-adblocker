@ECHO OFF

REM Patch 2017-12-06: Build tool shim for Windows 10
REM Need to install Python: sudo apt update && sudo apt install python -y

BASH ./tools/make-chromium.sh
PAUSE
