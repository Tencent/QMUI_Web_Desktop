"use strict";

const path = require('path');
const Common = require(path.join(__dirname, './common'));

class TrayManage {
  constructor() {
    this.tray = null;
    this.iconPath = Common.PLATFORM === 'win32' ? path.join(__dirname, '..', 'images/logo_tray_windows.png') : path.join(__dirname, '..', 'images/logo_tray.png');
    this.compassIconPath = path.join(__dirname, '..', 'images/logo_tray_compass.png');
    this.errorIconPath = path.join(__dirname, '..', 'images/logo_tray_error.png');
    this.closeIconPath = path.join(__dirname, '..', 'images/logo_tray_close.png');
  }
}

module.exports = new TrayManage();
