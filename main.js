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


'use strict';

const electron = require('electron');
const app = electron.app;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const trayManage = require(path.join(__dirname, './src/tray'));
let mainWindow;

function createWindow() {
    // 创建一个 440x640 的浏览器窗口
    mainWindow = new BrowserWindow({width: 440, height: 640, minWidth: 400, minHeight: 640, frame: false});

    // 加载应用的界面文件
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', function () {
    createWindow();

    trayManage.tray = new Tray(trayManage.iconPath);
    trayManage.tray.on('click', () => {
        mainWindow.restore();
        app.focus();
    });

    process.on('compass', function (type) {
        if (type === 'starting') {
            trayManage.tray.setImage(trayManage.compassIconPath);
        } else if (type === 'error') {
            trayManage.tray.setImage(trayManage.errorIconPath);
        } else {
            trayManage.tray.setImage(trayManage.iconPath);
        }
    });
    process.on('closeGulp', function () {
        trayManage.tray.setImage(trayManage.closeIconPath);
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
