const {sendStatisticResult} = require('../src/chat/statistic');
const { checkAdminConfigExist } = require('../src/utils');

module.exports = () => {
  if (!checkAdminConfigExist()) {
    console.error('请配置管理员权限！');
    return;
  }
  sendStatisticResult();
};