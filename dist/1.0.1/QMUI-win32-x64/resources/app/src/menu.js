"use strict";

const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;

var template = [
{
  label: '文件',
    submenu: [
    {
      label: '打开项目…',
      accelerator: 'CmdOrCtrl+O',
      click: function () {
        let projectPath = remote.dialog.showOpenDialog({ properties: ['openDirectory']});
        if(projectPath && projectPath.length){
          openProject(projectPath[0]);
        }
      }
    },
    {
      label: '刷新',
      accelerator: 'CmdOrCtrl+R',
      click: function(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.reload();
        }
      }
    }
  ]
},
{
  label: '运行',
  submenu: [
  {
    label: '开启/关闭 Gulp 服务',
    accelerator: 'CmdOrCtrl+1',
    click: function () {
      $gulpButton.trigger('click');
    }
  }
  ]
},
{
  label: '项目',
  submenu: [
  {
    label: '删除当前选中项目',
    accelerator: 'CmdOrCtrl+shift+D',
    click: function () {
      delProject();
    }
  }
  ]
},
{
  label: "编辑",
  submenu: [
    {
      label: "Copy",
      accelerator: "CmdOrCtrl+C",
      selector: "copy:"
    },
    {
      label: "Paste",
      accelerator: "CmdOrCtrl+V",
      selector: "paste:"
    }
  ]
},
{
  label: '窗口',
  role: 'window',
  submenu: [
  {
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  },
  {
    label: '关闭窗口',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }
  ]
},
{
  label: '帮助',
  role: 'help',
  submenu: [
  {
    label: '开启/关闭调试工具',
    click: function () {
      remote.getCurrentWebContents().toggleDevTools();
    }
  },
  {
    label: '重置储存数据',
    click: function () {
      resetAppStorage();
    }
  }
  ]
}
];

var name = 'QMUI';
if (process.platform == 'darwin') {
  template.unshift({
    label: name,
    submenu: [
  {
    label: '关于',
    click: function () {
      showAbout();
    }
  },
    {
      type: 'separator'
    },
    {
      label: '偏好设置',
      accelerator: 'CmdOrCtrl+,',
      click: function () {
        $settingStage.removeClass('qw_hide');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Services',
      role: 'services',
      submenu: []
    },
    {
      type: 'separator'
    },
    {
      label: '隐藏 ' + name,
      accelerator: 'Command+H',
      role: 'hide'
    },
    {
      label: '隐藏其他应用',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    },
    {
      label: '显示全部',
      role: 'unhide'
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      accelerator: 'Command+Q',
      click: function () {
        remote.app.quit();
      }
    }
  ]
  });
} else {
  template.unshift({
    label: name,
    submenu: [
    {
      label: '关于',
      click: function () {
        showAbout();
      }
    },
    {
      type: 'separator'
    },
    {
      label: '偏好设置',
      accelerator: 'CmdOrCtrl+,',
      click: function () {
        $settingStage.removeClass('qw_hide');
      }
    },
    {
      label: '退出',
      accelerator: 'Alt+F4',
      click: function () {
        remote.app.quit();
      }
    }
  ]
  });
}

var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
