#!/usr/bin/env node
const program = require('commander');
const initial = require('../commands/initial');
const admin = require('../commands/admin');
const order = require('../commands/order');
const statistic = require('../commands/statistic');
const scheduler = require('../commands/scheduler');
const notify = require('../commands/notify');
const {mkdirDb} = require('../src/utils');

mkdirDb();

program
  .version('0.0.1')
  .command('init')
  .description('生成配置文件alacarte.config.json')
  .action(initial);

  
program
  .command('admin')
  .description('生成管理员配置文件alacarte.admin.json')
  .action(admin);

program
  .command('order')
  .description('查看菜单并点餐')
  .action(order);

program
  .command('statistic')
  .description('统计每日每餐订餐人数')
  .action(statistic);
  

program
  .command('notify')
  .option('--enable', '开启订餐通知', )
  .option('--disable', '关闭订餐通知')
  .option('--twice', '订餐二次提醒')
  .option('--statistic', '订餐统计定时发送')
  .description('订餐通知')
  .action((arg) => {
    if (arg.twice) {
      if (arg.enable) {
        scheduler.scheduleOrderTwiceNotify();
        return;
      }
      if (arg.disable) {
        scheduler.cancelOrderTwiceNotify();
        return;
      }
      notify(true);
      return;
    }
    if (arg.statistic) {
      if (arg.enable) {
        scheduler.scheduleStatisticNotify();
        return;
      }
      if (arg.disable) {
        scheduler.cancelStatisticNotify();
        return;
      }
      statistic();
      return;
    }
    if (arg.enable) {
      scheduler.scheduleOrderNotify();
      scheduler.scheduleOrderTwiceNotify();
      return;
    }

    if (arg.disable) {
      scheduler.cancelOrderNotify();
      scheduler.cancelOrderTwiceNotify();
      return;
    }
    notify();
  });

program.parse(process.argv);
