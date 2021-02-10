const axios = require('../http');
const UTILS = require('../utils');

async function baseRobotRequest(data) {
  const admin = UTILS.readAdminFile();
  if (!admin || !admin.robot) {
    console.error('未获取到robot link！');
    return;
  }
  return axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    url: admin.robot,
    data,
  });
}

exports.sendTextMsg = (text) => {
  return baseRobotRequest({
    msgtype: 'text',
    text,
  });
}

exports.sendMarkdownMsg = (content) => {
  return baseRobotRequest({
    msgtype: 'markdown',
    markdown: {
      content,
    },
  });
}

