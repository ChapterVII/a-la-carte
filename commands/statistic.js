const statistic = require('../src/chat/statistic');
const utils = require('../src/utils');

module.exports = () => {
  if (!utils.checkAdminConfigExist()) {
    console.error('请配置管理员权限！');
    return;
  }
  statistic.sendStatisticResult();
};