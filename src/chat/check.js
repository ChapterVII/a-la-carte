const moment = require('moment');
const { sendTextMsg, sendMarkdownMsg } = require('../api/robot');
const orderApi = require('../api/order');
const utils = require('../utils');
const menu = require('../menu');

const formatCheckData = (data) => {
  let result = '';
  data.forEach(i => {
    result += `##### ${i.name} **${i.food}** \n`;
  });
  const title = `### 请核对并前往美餐平台补餐:  \n`;
  result = title + result;
  return result;
}

const sendCheckMsg = async (content, adminId) => {
  const { markdown, text } = content;
  if (!markdown) {
    sendTextMsg({
      content: text,
      mentioned_list: [adminId],
    });
    return;
  }
  console.log(content.markdown);
  const response = await sendMarkdownMsg(markdown);
  if (response.errcode === 0) {
    sendTextMsg({
      content: '',
      mentioned_list :[adminId],
    });
  }
}

exports.sendCheckResult = async () => {
  const admin = utils.readAdminFile();
  if (!admin || !admin.id || !admin.members) {
    return;
  }
  const { id } = admin;
  const res = await orderApi.queryOrderList();
  if (res && res.list && res.list.length) {
    if (moment().day() === 5) {
      // 周五特定，自己点全部
      const teamOrders = utils.filterTeamOrder(res.list);
      if (teamOrders && teamOrders.length) {
        sendCheckMsg({markdown: formatCheckData(teamOrders)}, id);
        return;
      }
       
    }
    const orderedNum = await menu.getOrderNum();
    if (res.list.length > orderedNum) {
      const sortedOrderList = res.list.sort((a, b) => a.createTime > b.createTime ? 1 : -1);
      const addOrder = utils.filterTeamOrder(sortedOrderList.slice(orderedNum));
      sendCheckMsg({markdown: formatCheckData(addOrder)}, id);
    }
  }
};