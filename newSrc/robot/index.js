const UTILS = require('../utils');
const ROBOT_API = require('./api');
export class Robot {
  constructor() {
    
  }

  async send(content, ids) {
    try {
      const { markdown, text } = content;
      if (!markdown && text) {
        ROBOT_API.sendTextMsg({
          content: text,
          mentioned_list: ids,
        });
        return;
      }
      console.log('markdown content before send by robot: \n', markdown);
      const response = await ROBOT_API.sendMarkdownMsg(markdown);
      if (response.errcode === 0) {
        ROBOT_API.sendTextMsg({
          content: '',
          mentioned_list : ids,
        });
        return;
      }
      console.log('Robot.send.sendMarkdownMsg failed, response: \n', response);
    } catch (e) {
      console.log('Robot.send error: \n', e);
    }
  }
}