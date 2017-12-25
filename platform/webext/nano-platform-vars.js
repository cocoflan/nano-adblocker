/*******************************************************************************

    Nano Adblocker - Just another adblocker
    Copyright (C) 2017 Nano Adblocker contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/NanoAdblocker/NanoCore
*/

'use strict';

/******************************************************************************/

window.NanoDefenderExtensionID = '{6ea144f3-db99-47f4-9a1d-815e8b3944d1}';
window.NanoReIsDashboardURL = new RegExp('^' + chrome.runtime.getURL('') +
    '(?:nano-)?dashboard\\.html$');

/******************************************************************************/

window.NanoAdblockerDeveloperModeExtensionID = '';
