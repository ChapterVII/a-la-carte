const notifier = require('node-notifier');
const ora = require('ora');
const path = require('path');
const order = require('./order');
const notifyApi = require('../src/api/notify');
const utils = require('../src/utils');
const menu = require('../src/menu');

const orderNotifier = async (isTwice) => {
  if (!utils.checkTodayNotifyIcon()) {
    const spinner = ora('获取icon...');
    spinner.start();
    await notifyApi.getUnsplashImg();
    spinner.succeed();
  }
  notifier.notify(
    {
      title: '订餐提醒',
      message: isTwice ? '再不订餐今天就没饭吃咯~' : '叮咚，可以订餐啦！',
      icon: utils.getValidNotifyIconPath(),
      sound: true,
      actions: ['Start', 'Close']
    },
    function(err, data) {
      if (err) {
        console.error('订餐提醒桌面通知失败了: ', err);
        return;
      }
      if (data === 'activate' || data === 'start') {
        order();
      } else if (utils.checkAdminConfigExist()) {
        menu.getMenus();
      }
    }
  );
}

module.exports = orderNotifier;

