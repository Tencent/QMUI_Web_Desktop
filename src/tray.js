/**
 * Tencent is pleased to support the open source community by making QMUI Web Desktop available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
