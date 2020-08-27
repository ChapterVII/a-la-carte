
const { sendTextMsg, sendMarkdownMsg } = require('../api/robot');
const menu = require('../menu');

const formatMenu2Markdown = (obj) => {
  let result = '### 今日晚餐 \n';
  Object.keys(obj).forEach(name => {
    if (obj[name] && obj[name].length) {
      result += `##### **${name}** \n`;
      obj[name].forEach(i => {
        result += `###### ${i.name} \n`;
      })
    }
  })
  return result;
}

exports.sendMenu = async () => {
  const menus = await menu.getMenus();
  if (!menus) return;
  const content = formatMenu2Markdown(menus);
  console.log('企业微信机器人发送菜单... \n', content);
  const response = await sendMarkdownMsg(content);
  if (response && response.errcode === 0) {
    console.log('Success！')
    sendTextMsg({
      content: '',
      "mentioned_list" :["@all"],
    });
  } else {
    console.log('Failed！');
  }
};


