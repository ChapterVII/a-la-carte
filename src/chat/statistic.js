const { sendTextMsg, sendMarkdownMsg } = require('../api/robot');
const utils = require('../utils');
const order = require('../order');

const getFoodCountMap = async (foodList) => {
  const menuList = await utils.getMenuList();
  const foodMap = {};
  menuList.length && foodList.forEach(i => {
    const menu = menuList.find(m => m.includes(i));
    if (!menu) {
      console.error(`not found matched food by foodName "${i}"`);
    } else {
      if (!foodMap[menu]) {
        foodMap[menu] = 1;
      } else {
        foodMap[menu] += 1;
      }
    }
  });
  return foodMap;
}

const formatStatisticData = (data, sum) => {
  let result = '';
  let count = 0;
  Object.keys(data).forEach(name => {
    const v = data[name];
    result += `##### ${name} **${v}**份 \n`;
    count += v;
  });
  if (count !== sum) {
    throw '自动获取订餐总数与订餐人数不一致';
  }
  const title = `### 今日订餐总数: **${count}**份 \n`;
  result = title + result;
  return result;
}

const chooseMemberIds = (orderList, members, adminId) => {
  if (Array.isArray(orderList) && orderList.length) {
    const hasIdList = orderList.filter(i => members.find(m => m.name === i.name).id);
    const adminName = members.find(m => m.id === adminId).name;
    const filteredNames = hasIdList.filter(i => i.name !== adminName).map(l => l.name);
    const l = filteredNames.length;
    if (l < 3) {
      const ids = filteredNames.map(n => members.find(m => m.name === n).id);
      return ids;
    }
    const randomIndex1 = Math.floor(Math.random() * l);
    console.log('randomIndex1: ', randomIndex1, filteredNames[randomIndex1]);
    const restNames = [...filteredNames];
    restNames.splice(randomIndex1, 1);
    const randomIndex2 = Math.floor(Math.random() * restNames.length);
    console.log('randomIndex2: ', randomIndex2, restNames[randomIndex2]);
    const randomIds = [filteredNames[randomIndex1], restNames[randomIndex2]].map(n => members.find(m => m.name === n).id);
    console.log('randomIds: ', randomIds);
    return randomIds;
  }
  return [];
}

const sendStatisticMsg = async (content, adminId, memberIds) => {
  const { markdown, text } = content;
  // if (!markdown) {
  //   sendTextMsg({
  //     content: text,
  //     mentioned_list: [adminId],
  //   });
  //   return;
  // }
  console.log(content.markdown);
  // const response = await sendMarkdownMsg(markdown);
  // const mentionedList = memberIds.length < 3 ? memberIds : [adminId, ...memberIds];
  // if (response.errcode === 0) {
  //   sendTextMsg({
  //     content: '',
  //     mentioned_list : memberIds,
  //   });
  // }
}

exports.sendStatisticResult = async () => {
  const admin = utils.readAdminFile();
  if (!admin || !admin.id || !admin.members) {
    return;
  }
  const { id, members } = admin;
  const res = await order.getTeamOrderList();
  if (!res.length) {
    console.log('今日无人订餐！');
    sendStatisticMsg({text: '今日无人订餐！'}, id);
  } else {
    try {
      const foodList = res.map(i => i.food);
      const foodMap = await getFoodCountMap(foodList);
      const memberIds = chooseMemberIds(res, members, id);
      sendStatisticMsg({markdown: formatStatisticData(foodMap, foodList.length)}, id, memberIds);
    } catch (e) {
      console.log('error', e);
      sendStatisticMsg({text: e}, id);
    }
  }
};