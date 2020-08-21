const { sendTextMsg, sendMarkdownMsg } = require('../api/robot');
const { getMenuList, readAdminFile } = require('../utils');
const { getTeamOrderList } = require('../order');

const getFoodCountMap = (foodList) => {
  const menuList = getMenuList();
  const foodMap = {};
  foodList.forEach(i => {
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

const sendStatisticMsg = async (content) => {
  console.log('企业微信机器人发送 \n', content);
  const admin = readAdminFile();
  if (!admin || !admin.id) {
    return;
  }
  const { id } = admin;
  const { markdown, text } = content;
  if (!markdown) {
    sendTextMsg({
      content: text,
      mentioned_list: [id],
    });
    return;
  }

  const response = await sendMarkdownMsg(markdown);
  if (response.errcode === 0) {
    sendTextMsg({
      content: '',
      mentioned_list :[id],
    });
  }
}

exports.sendStatisticResult = async () => {
  const foodList = await getTeamOrderList();
  if (!foodList.length) {
    console.log('今日无人订餐！');
    sendStatisticMsg({text: '今日无人订餐！'});
  } else {
    try {
      const foodMap = getFoodCountMap(foodList);
      sendStatisticMsg({markdown: formatStatisticData(foodMap, foodList.length)});
    } catch (e) {
      console.log('error', e);
      sendStatisticMsg({text: e});
    }
  }
};