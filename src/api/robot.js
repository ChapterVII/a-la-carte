const axios = require('../http');
const { readAdminFile } =require('../utils');

const sendMsg = (data) => {
  const admin = readAdminFile();
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