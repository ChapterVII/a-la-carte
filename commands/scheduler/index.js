const path = require('path');
const process = require('child_process');
const iconv = require('iconv-lite')

const notifyOrderPath = path.resolve(__dirname, './notifyOnce.js');
const twiceNotifyOrderPath = path.resolve(__dirname, './notifyTwice.js');
const notifyStatisticPath = path.resolve(__dirname, './statistic.js');



const TIME_MAP = {
  ORDER_NOTIFY: '10:00:00',
  ORDER_TWICE_NOTIFY: '13:45:00',
  STATISTIC_NOTIFY: '17:30:00',
}

const TASK_MAP = {
  ORDER_NOTIFY: 'alacarte-order-task',
  ORDER_TWICE_NOTIFY: 'alacarte-order-twice-task',
  STATISTIC_NOTIFY: 'alacarte-statistic-task'
}

const CMD_MAP = {
  ORDER_NOTIFY: `schtasks /create /tn ${TASK_MAP.ORDER_NOTIFY} /tr "node ${notifyOrderPath}" /sc daily /st ${TIME_MAP.ORDER_NOTIFY} /f`,
  QUERY_ORDER_NOTIFY: `schtasks /query /tn ${TASK_MAP.ORDER_NOTIFY} /fo LIST`,
  CANCEL_ORDER_NOTIFY: `schtasks /delete /tn ${TASK_MAP.ORDER_NOTIFY} /f`,
  ORDER_TWICE_NOTIFY: `schtasks /create /tn ${TASK_MAP.ORDER_TWICE_NOTIFY} /tr "node ${twiceNotifyOrderPath}" /sc daily /st ${TIME_MAP.ORDER_TWICE_NOTIFY} /f`,
  QUERY_ORDER_TWICE_NOTIFY: `schtasks /query /tn ${TASK_MAP.ORDER_TWICE_NOTIFY} /fo LIST`,
  CANCEL_ORDER_TWICE_NOTIFY: `schtasks /delete /tn ${TASK_MAP.ORDER_TWICE_NOTIFY} /f`,
  STATISTIC_NOTIFY: `schtasks /create /tn ${TASK_MAP.STATISTIC_NOTIFY} /tr "node ${notifyStatisticPath}" /sc daily /st ${TIME_MAP.STATISTIC_NOTIFY} /f`,
  QUERY_STATISTIC_NOTIFY: `schtasks /query /tn ${TASK_MAP.STATISTIC_NOTIFY} /fo LIST`,
  CANCEL_STATISTIC_NOTIFY: `schtasks /delete /tn ${TASK_MAP.STATISTIC_NOTIFY} /f`,
};

const format = (stdout) => iconv.decode(new Buffer(stdout, 'binary'), 'cp936');

// 10:00进行订餐初次提醒
exports.scheduleOrderNotify = () => {
  process.exec(CMD_MAP.ORDER_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(stderr ? format(stderr)  : '订餐提醒服务开启失败!');
      return;
    }
    console.log(`已开启订餐提醒服务！提醒时间：每日${TIME_MAP.ORDER_NOTIFY}`);
  });
}

exports.cancelOrderNotify = () => {
  process.exec(CMD_MAP.QUERY_ORDER_NOTIFY, { encoding: 'binary' }, (_error, _stdout, _stderr) => {
    if (_error || _stderr) {
      console.log(_stderr ? format(_stderr)  : '订餐提醒服务获取失败!');
      return;
    }
    process.exec(CMD_MAP.CANCEL_ORDER_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.log(stderr ? format(stderr)  : '关闭订餐二次提醒服务失败!');
        return;
      }
      console.log('已成功关闭订餐提醒服务！');
    });
  });
}

// 14:00进行订餐二次提醒
exports.scheduleOrderTwiceNotify = () => {
  process.exec(CMD_MAP.ORDER_TWICE_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(stderr ? format(stderr)  : '订餐二次提醒服务开启失败!');
      return;
    }
    console.log(`已开启订餐二次提醒服务！提醒时间：每日${TIME_MAP.ORDER_TWICE_NOTIFY}`);
  });
}

exports.cancelOrderTwiceNotify = () => {
  process.exec(CMD_MAP.QUERY_ORDER_TWICE_NOTIFY, { encoding: 'binary' }, (_error, _stdout, _stderr) => {
    if (_error || _stderr) {
      console.log(_stderr ? format(_stderr)  : '二次提醒服务获取失败!');
      return;
    }
    process.exec(CMD_MAP.CANCEL_ORDER_TWICE_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.log(stderr ? format(stderr)  : '关闭订餐二次提醒服务失败!');
        return;
      }
      console.log('已成功关闭订餐二次提醒服务！');
    });
  });
}

// 17:30进行订餐统计提醒
exports.scheduleStatisticNotify = () => {
  process.exec(CMD_MAP.STATISTIC_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(stderr ? format(stderr)  : '订餐统计通知服务开启失败!');
      return;
    }
    console.log(`已开启订餐统计通知服务！提醒时间：每日${TIME_MAP.STATISTIC_NOTIFY}`);
  });
}

exports.cancelStatisticNotify = () => {
  process.exec(CMD_MAP.QUERY_STATISTIC_NOTIFY, { encoding: 'binary' }, (_error, _stdout, _stderr) => {
    if (_error || _stderr) {
      console.log(_stderr ? format(_stderr)  : '订餐统计通知服务获取失败!');
      return;
    }
    process.exec(CMD_MAP.CANCEL_STATISTIC_NOTIFY, { encoding: 'binary' }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.log(stderr ? format(stderr)  : '关闭订餐统计通知服务失败!');
        return;
      }
      console.log('已成功关闭订餐统计通知服务！');
    });
  });
}