const notifier = require('node-notifier');
const ora = require('ora');
const path = require('path');
const order = require('./order');
const { getUnsplashImg } = require('../src/api/notify');
const { checkTodayNotifyIcon, getValidNotifyIconPath } = require('../src/utils/index');

const orderNotifier = async (isTwice) => {
  if (!checkTodayNotifyIcon()) {
    const spinner = ora('获取icon...');
    spinner.start();
    await getUnsplashImg();
    spinner.succeed();
  }
  notifier.notify(
    {
      title: '订餐提醒',
      message: isTwice ? '再不订餐今天就没饭吃咯~' : '叮咚，可以订餐啦！',
      icon: getValidNotifyIconPath(),
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
      }
    }
  );
}

module.exports = orderNotifier;

