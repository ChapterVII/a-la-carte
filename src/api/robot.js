const axios = require('../http');
const utils =require('../utils');

const sendMsg = (data) => {
  const admin = utils.readAdminFile();
  if (!admin || !admin.robot) {
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
  return sendMsg({
    msgtype: 'text',
    text,
  });
}

exports.sendMarkdownMsg = (content) => {
  return sendMsg({
    msgtype: 'markdown',
    markdown: {
      content,
    },
  });
}