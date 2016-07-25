"use strict";

const path = require('path');
const packageInfo = require(path.join(__dirname, './package.json'));

let $version = $('#version');
$version.text(packageInfo.version);

// 禁止缩放
electron.webFrame.setZoomLevelLimits(1, 1);
