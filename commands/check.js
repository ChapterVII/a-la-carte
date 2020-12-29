const check = require('../src/chat/check');
const utils = require('../src/utils');

module.exports = () => {
  if (!utils.checkAdminConfigExist()) {
    console.error('请配置管理员权限！');
    return;
  }
  check.sendCheckResult();
};