"use strict";

const fs = require('fs');
const electron = require('electron');
const remote = electron.remote;

class Common {

}

Common.NAME = 'QMUI_Web_Electron';
Common.WORKSPACE = `${Common.NAME}_workspace`;
Common.PLATFORM = process.platform;
Common.DEFAULT_PATH = Common.PLATFORM === 'win32' ? 'desktop' : 'home';
Common.info = require('../package.json');

Common.requireUncached = function (module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

Common.fileExist = function (filePath) {
  try {
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return true;
    }
    return false;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw new Error(err);
  }
};

Common.dirExist = function (dirPath) {
  try {
    var stat = fs.statSync(dirPath);
    if (stat.isDirectory()) {
      return true;
    }
    return false;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw new Error(err);
  }
}

const storageTypeLocal = 'local';
const storageTypeSession = 'session';

Common.getStorage = function (type) {
  let storage = type === storageTypeLocal ? window.localStorage : window.sessionStorage;

  if (storage.getItem(Common.NAME)) {
    return JSON.parse(storage.getItem(Common.NAME));
  }
  return false;
};

Common.setStorage = function (type, storageContent) {
  let storage = type === storageTypeLocal ? localStorage : sessionStorage;
  storage.setItem(Common.NAME, JSON.stringify(storageContent));
};

Common.resetStorage = function (type) {
  let storage = type === storageTypeLocal ? localStorage : sessionStorage;
  let storageItem = storage.getItem(Common.NAME);

  if (storageItem) {
      storage.removeItem(Common.NAME);
  }
};
Common.getLocalStorage = function () {
  return Common.getStorage(storageTypeLocal); 
};
Common.getSessionStorage = function () {
  return Common.getStorage(storageTypeSession); 
};
Common.setLocalStorage = function (storageContent) {
  Common.setStorage(storageTypeLocal, storageContent);
};
Common.setSessionStorage = function (storageContent) {
  Common.setStorage(storageTypeSession, storageContent);
};
Common.resetLocalStorage = function () {
  Common.resetStorage(storageTypeLocal);
};
Common.resetSessionStorage = function () {
  Common.resetStorage(storageTypeSession);
};

Common.postNotification = function(title, content) {
  let options = {
    title: title,
    body: content
  };
  let notification = new Notification(title, options);
  notification.onclick = function () {
    remote.app.focus();
  };
}

module.exports = Common;
