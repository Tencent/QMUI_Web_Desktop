"use strict";

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const _ = require('lodash');
const shell = electron.shell;
const ipcRender = electron.ipcRenderer;
const Common = require(path.join(__dirname, './src/common'));
const mainProcess = remote.process;

// 变量声明
let $wrapper = $('#wrapper');
let $welcomeStage = $('#welcomeStage');
let $openProject = $('#openProject');
let $projectStage = $('#projectStage');
let $projectList = $('#projectList');
let $gulpButton = $('#gulpButton');
let $delProject = $('#delProject');
let $operationStage = $('#operationStage');
let $logContent = $('#log');
let $cleanLog = $('#cleanLog');
let $closeSettingButton = $('#closeSetting');
let $showSettingButton = $('#showSetting');
let $settingStage = $('#settingStage');
let $curProject = null;
let finderTitle = Common.PLATFORM === 'win32' ? '打开项目文件夹' : '打开项目目录';
let closeGulpManually = false;

ipcRender.on('message', function(event){
     event.send('dd')
});

// 输出平台相关的标识 class
if (Common.PLATFORM === 'win32') {
  $wrapper.addClass('qw_windows');
}

// 禁止缩放
electron.webFrame.setZoomLevelLimits(1, 1);

// 初始化
init();

// 如果是第一次打开,设置数据并存储
// 其他则直接初始化数据
function init() {

  let storage = Common.getLocalStorage();

  if (!storage) {
    storage = {};
    storage.name = Common.NAME;
    storage['setting'] = {};
    storage['setting']['compass'] = {};
    storage['setting']['compass']['notification'] = 'true';
    storage['setting']['compass']['statusIcon'] = 'true';

    let workspace = path.join(remote.app.getPath(Common.DEFAULT_PATH), Common.WORKSPACE);

    storage.workspace = workspace;
    Common.setLocalStorage(storage)
  } else {
    $projectStage.removeClass('qw_hide');
    $operationStage.removeClass('qw_hide');
    $welcomeStage.addClass('qw_hide');
    initData();
  }

  initSetting();
}

// 初始化数据
function initData() {
    let storage = Common.getLocalStorage();

    if (storage) {

        if (!_.isEmpty(storage['projects'])) {
            let html = '';

            for (let i in storage['projects']) {

                html += `<li class="project_stage_item js_project_item" data-project="${i}" data-name="${storage['projects'][i]['name']}" title="${storage['projects'][i]['path']}">
                          <a class="qw_icon qw_icon_Folder js_openFolder" href="javascript:;" title="${finderTitle}"></a>
                          <div class="project_stage_item_cnt">
                            <div class="project_stage_item_title">${storage['projects'][i]['name']} (${i})</div>
                            <div class="project_stage_item_path">${storage['projects'][i]['path']}</div>
                          </div>
                        </li>`;
            }

            $projectList.html(html);

            // 当前活动项目
            $curProject = $projectList.find('.js_project_item').eq(0);
            $curProject.addClass('project_stage_item_Current');

            // 复制一份数据到 sessionStorage，方便后续使用
            Common.setSessionStorage(storage);

        } else {
            $welcomeStage.removeClass('qw_hide');
            $projectStage.addClass('qw_hide');
            $operationStage.addClass('qw_hide');
        }
    }
}

function initSetting() {
  // 设置界面处理
  let storage = Common.getLocalStorage();

  if (!_.isEmpty(storage['setting'])) {
    if (storage['setting']['compass']['notification'] === 'true') {
      let $compassNotification = $('#compass_notification');
      $compassNotification.attr('checked', true);
    }
    if (storage['setting']['compass']['statusIcon'] === 'true') {
      let $compassStatusIcon = $('#compass_statusIcon');
      $compassStatusIcon.attr('checked', true);
    }
  }
}


// 打开项目
$openProject.on('change', function () {
    if (this && this.files.length) {
        let projectPath = this.files[0].path;

        openProject(projectPath);

    } else {
        alert('选择目录出错,请重新选择!');
    }
    // 每次选择后清空 value，避免下次选择同一个目录时不触发 change
    $openProject.val('');
});

// 拖曳放置项目
$wrapper[0].ondragover = function () {
  $(this).addClass('frame_wrap_Draging');
  return false;
};
$wrapper[0].ondragleave = $wrapper[0].ondragend = function () {
  $(this).removeClass('frame_wrap_Draging');
  return false;
};
$wrapper[0].ondrop = function (e) {
  e.preventDefault();

  $(this).removeClass('frame_wrap_Draging');

  var file = e.dataTransfer.files[0];

  var stat = fs.statSync(file.path);
  if (stat.isDirectory()) {
    openProject(file.path);
  }
  return false;
};

function openProject(projectPath) {

  let projectDir = path.basename(projectPath);
  let storage = Common.getLocalStorage();
  let projectInfo;
  try {
    projectInfo = require(projectPath + '/UI_dev/config.json');
  } catch(e) {
    alert('没有找到 UI_dev/config.json，不是标准的 QMUI 项目');
  }
  if (!projectInfo) {
    return;
  }

  if (storage && storage['workspace']) {
    if (!storage['projects']) {
      storage['projects'] = {};
    }

    if (storage['projects'][projectDir]) {
      alert('项目已存在');
    } else {
      storage['projects'][projectDir] = {};
      storage['projects'][projectDir]['path'] = projectPath;
      Common.setLocalStorage(storage);

      // 插入打开的项目
      insertOpenProject(projectPath);
    }
  }

}

// 插入打开的项目
function insertOpenProject(projectPath) {

  if (!$welcomeStage.hasClass('qw_hide')) {
    $welcomeStage.addClass('qw_hide');
    $projectStage.removeClass('qw_hide');
    $operationStage.removeClass('qw_hide');
  }

  // 插入节点
  let projectDir = path.basename(projectPath);
  let projectInfo = require(projectPath + '/UI_dev/config.json');
  let projectName = projectInfo.project;

  let $projectHtml = $(`<li class="project_stage_item js_project_item" data-project="${projectDir}" data-name="${projectName}" title="${projectPath}">
      <a class="qw_icon qw_icon_Folder js_openFolder" href="javascript:;" title="${finderTitle}"></a>
      <div class="project_stage_item_cnt">
        <div class="project_stage_item_title">${projectName} (${projectDir})</div>
        <div class="project_stage_item_path">${projectPath}</div>
      </div>
      </li>`);

  $projectList.append($projectHtml);

  $projectList.scrollTop($projectList.get(0).scrollHeight);

  // 只有在节点成功插入了才保存进 storage
  let storage = Common.getLocalStorage();

  if (storage) {
    if (!storage['projects']) {
      storage['projects'] = {};
    }
    if (!storage['projects'][projectDir]) {
      storage['projects'][projectDir] = {};
    }

    storage['projects'][projectDir]['name'] = projectName;
    storage['projects'][projectDir]['path'] = projectPath;
    storage['projects'][projectDir]['log'] = '';

    Common.setLocalStorage(storage);
    // 同步更新 sessionStorage，方便后续使用
    Common.setSessionStorage(storage);
  }

  $projectHtml.trigger('click');
}

// 删除项目
$delProject.on('click', function () {
  let projectDir = $curProject.data('project');
  let projectName = $curProject.data('name');
  $.prompt('删除项目不会影响项目文件，只会把项目从本项目列表中移除。', {
    title: '确认删除 ' + projectName + ' (' + projectDir + ')',
    buttons: { '确认': true, '取消': false },
    submit: function(e,v,m,f) {
      if (v) {
        delProject();
      }
    }
  });
});

function delProject(cb) {

  if (!$curProject.length) {
    return;
  }

  let projectDir = $curProject.data('project');
  let index = $curProject.index();

  $curProject.remove();

  if (index > 0) {
    $curProject = $('.project_stage_item').eq(index - 1);
  } else {
    $curProject = $('.project_stage_item').eq(index);
  }

  $curProject.trigger('click');

  killChildProcess(projectDir);

  let storage = Common.getLocalStorage();

  if (storage && storage['projects'] && storage['projects'][projectDir]) {
    delete storage['projects'][projectDir];
    Common.setLocalStorage(storage);
  }

  if (_.isEmpty(storage['projects'])) {
    $welcomeStage.removeClass('qw_hide');
    $projectStage.addClass('qw_hide');
    $operationStage.addClass('qw_hide');
  }

  console.log('Delete project success.');

  cb && cb();
}

// 清除 log 信息
$cleanLog.on('click', function () {
    $logContent.html('');
});

// 项目列表绑定点击事件
$projectList.on('click', '.js_project_item', function () {
  let $this = $(this);
  $('.js_project_item').removeClass('project_stage_item_Current');
  $this.addClass('project_stage_item_Current');
  $curProject = $this;

  if ($this.data('watch')) {
    setWatching();
  } else {
    setNormal();
  }

  // log 切换
  let projectDir = $curProject.data('project');
  let sessionStorage = Common.getSessionStorage();
  let logData = sessionStorage['projects'][projectDir]['log'];
  logData = logData ? logData : '';
  $logContent.html(`${logData}`);
  $logContent.scrollTop($logContent.get(0).scrollHeight);
});

// 在 item 中打开项目文件夹
$projectList.on('click', '.js_openFolder', function () {
  let $this = $(this);
  let projectPath = $this.parents('.js_project_item').attr('title');

  if (projectPath) {
    shell.showItemInFolder(projectPath);
  }
});

function setNormal() {
  $gulpButton.removeClass('operation_stage_gulpBtn_Watching');
  $gulpButton.text('开启 Gulp 服务');

  $curProject.removeClass('project_stage_item_Watching');
  $curProject.data('watch', false);
}

function setWatching() {
  $gulpButton.addClass('operation_stage_gulpBtn_Watching');
  $gulpButton.text('Gulp 正在服务');

  $curProject.addClass('project_stage_item_Watching');
  $curProject.data('watch', true);
}

// 结束子进程
function killChildProcess(projectDir) {
  let storage = Common.getLocalStorage();

  if (storage && storage['projects'][projectDir] && storage['projects'][projectDir]['pid']) {

    try {
      if (Common.PLATFORM === 'win32') {
        childProcess.exec('taskkill /pid ' + storage['projects'][projectDir]['pid'] + ' /T /F');
      } else {
        process.kill(storage['projects'][projectDir]['pid']);
      }
    } catch (e) {
      console.log('pid not found');
    }

    storage['projects'][projectDir]['pid'] = 0;
    Common.setLocalStorage(storage);

    $('.js_project_item[data-project="' + projectDir + '"]').removeData('pid');
  }
}

function logReply(data) {
  let originData = data;
  let projectDir = $curProject.data('project');
  let sessionStorage = Common.getSessionStorage();
  data = data.replace(/\n/g, '<br/>');
  data = data.replace(/\[(.*?)\]/g, '[<span class="operation_stage_log_time">$1</span>]'); // 时间高亮
  data = data.replace(/\'(.*?)\'/g, '\'<span class="operation_stage_log_keyword">$1</span>\''); // 单引号内的关键词高亮 
  data = data.replace(/(QMUI .*?):/, '\'<span class="operation_stage_log_qmui">$1</span>\''); // QMUI 任务名高亮 
  $logContent.append(`${data}`);
  $logContent.scrollTop($logContent.get(0).scrollHeight);

  // 把 log 写入 sessionStorage
  sessionStorage['projects'][projectDir]['log'] = $logContent.html();
  Common.setSessionStorage(sessionStorage);

  // Compass 编译完成后发通知
  let localStorage = Common.getLocalStorage();
  // Compass 编译失败通知
  if (originData.match(/'compass' errored/i)) {
    if (localStorage['setting']['compass']['statusIcon'] === 'true') {
      mainProcess.emit('compass', 'error');
    }
    if (localStorage['setting']['compass']['notification'] === 'true') {
      Common.postNotification('Compass 编译失败', '详细情况请查看 Log');
    }
  } 
  // Compass 编译完成通知
  if (originData.match(/Finished 'compass'/i)) {
    if (localStorage['setting']['compass']['statusIcon'] === 'true') {
      mainProcess.emit('compass', 'finish');
    }
    if (localStorage['setting']['compass']['notification'] === 'true') {
      Common.postNotification('Compass 编译完成', '样式已经输出');
    }
  }
  // Compass 编译开始通知（仅有状态栏通知）
  if (originData.match(/Starting 'compass'/i)) {
    if (localStorage['setting']['compass']['statusIcon'] === 'true') {
      mainProcess.emit('compass', 'starting');
    }
  }
}

function runDevTask(projectPath){
  let child;
  let qmuiPath = projectPath + '/UI_dev/qmui_web';

  if (Common.PLATFORM === 'win32') {
    child = childProcess.exec('gulp main', {'cwd': qmuiPath, silent: true});
  } else {
    child = childProcess.spawn('gulp', ['main'], {env: {'PATH':'/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'}, cwd: qmuiPath, silent: true});
  }

  child.stdout.setEncoding('utf-8');
  child.stdout.on('data', function (data) {
    console.log(data);
    logReply(data.toString());
  });

  child.stderr.on('data', function (data) {
    console.log(data)
    logReply(data.toString());
  });

  child.on('close', function (code) {
    console.log(code);
    if (code && code !== 0) {
      logReply(`child process exited with code ${code}`);
    }

    let tipText;
    if (closeGulpManually) {
      closeGulpManually = false;
      tipText = '已关闭 Gulp 服务';
      logReply(logTextWithDate(tipText));
    } else {
      tipText = 'Gulp 进程意外关闭，请重新启动服务';
      // 意外关闭的进程并没有进入正常的流程，因此需要手动更新 storage 和 UI 表现
      let $project = $('.js_project_item[data-pid="' + this.pid + '"]');
      $project.removeClass('project_stage_item_Watching');
      $project.data('watch', false);

      let storage = Common.getLocalStorage();
      storage['projects'][projectDir]['pid'] = 0;
      Common.setLocalStorage(storage);

      if (projectDir === $curProject.data('project')) {
        logReply(logTextWithDate(tipText));
        $gulpButton.removeClass('operation_stage_gulpBtn_Watching');
        $gulpButton.text('开启 Gulp 服务');
      } else {
        let sessionStorage = Common.getSessionStorage();
        let logData = sessionStorage['projects'][projectDir]['log'];
        let closeTip = logTextWithDate(tipText).replace(/\[(.*?)\]/g, '[<span class="operation_stage_log_time">$1</span>]'); // 时间高亮
        sessionStorage['projects'][projectDir]['log'] = logData + closeTip;
        Common.setSessionStorage(sessionStorage);
      }
      // 改变状态栏图标
      mainProcess.emit('closeGulp');
      // 发出通知
      let projectName = $project.data('name');
      Common.postNotification('Gulp 意外停止工作', '项目 ' + projectName + ' (' + projectDir + ') 的 Gulp 服务停止工作，请重新启动');
    }
  });

  let storage = Common.getLocalStorage();
  let projectDir = $curProject.data('project');

  if (storage && storage['projects'] && storage['projects'][projectDir]) {
    console.log(child.pid);
    storage['projects'][projectDir]['pid'] = child.pid;
    Common.setLocalStorage(storage);

    $curProject.attr('data-pid', child.pid);

    setWatching();
  }
}

$gulpButton.on('click', function() {

  let projectDir = $curProject.data('project');

  if ($curProject.data('watch')) {
    closeGulpManually = true;
    killChildProcess(projectDir);
    setNormal();
  } else {
    let storage = Common.getLocalStorage();
    if (storage && storage['projects'] && storage['projects'][projectDir]) {
      runDevTask(storage['projects'][projectDir]['path']);
    }
  }
}); 

// 设置界面
$showSettingButton.on('click', function() {
  $settingStage.removeClass('qw_hide');
});
$closeSettingButton.on('click', function() {
  $settingStage.addClass('qw_hide');
});

$settingStage.on('change', 'input', function () {
  let $this = $(this);
  let name = $this.attr('id');
  // let val = $.trim($this.val());
  let checked = $this.prop('checked');
  let type = $this.attr('type');
  let storage = Common.getLocalStorage();

  let nameArr = name.split('_');
  let pname = nameArr[0];
  let cname = nameArr[1];

  if (type === 'checkbox') {
    storage['setting'][pname][cname] = checked.toString();
    Common.setLocalStorage(storage)
  }
});

// 关于
function showAbout() {
  const BrowserWindow = remote.BrowserWindow;

  let win = new BrowserWindow({
    width: 320,
    height: 300,
    title: '关于'
  });
  // win.webContents.openDevTools();

  let aboutPath = 'file://' + __dirname + '/about.html';
  win.loadURL(aboutPath);

  win.on('closed', function () {
    win = null;
  });
}

// 调试

// 重置储存数据
function resetAppStorage() {
  $.prompt('重置储存数据会清空本 App 中所有的相关数据，包括项目数据。', {
    title: '确认重置储存数据',
    buttons: { '确认': true, '取消': false },
    submit: function(e,v,m,f) {
      if (v) {
        Common.resetLocalStorage();
        Common.resetSessionStorage();
        remote.getCurrentWindow().reload();
      }
    }
  });
}

// 工具方法

// 时间格式
function dateFormat(date) {
  if (date.toString().length == 1) {
    return '0' + date;
  }
  return date;
}

// 生成带时间的 Log
function logTextWithDate(content) {
  let D = new Date();
  let h = dateFormat(D.getHours());
  let m = dateFormat(D.getMinutes());
  let s = dateFormat(D.getSeconds());
  return `[${h}:${m}:${s}] ${content}<br/>`;
}
