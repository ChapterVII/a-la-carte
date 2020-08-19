const axios = require('../http');
const { admin, robot } = require('../../administrator');

const sendMsg = (data) => {
  if (!admin) {
    console.error('Please apply for administrator permission first!');
    return;
  }
  if (!robot || !robot.URL) {
    console.error('cannot find your robot webHook!');
    return;
  }
  return axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    url: robot.URL,
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