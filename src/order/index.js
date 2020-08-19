const { addOrder, delOrder, queryTeamOrderList } = require('../api/order');
const { order } = require('../../config');
const { saveOrderFile, readOrderFile, today } = require('../utils');

exports.createOrder = async (food) => {
  const { name, company } = order;
  const res = await addOrder({
    name,
    company,
    bookDate: today,
    food,
  });
  if (res && res.retCode === 0) {
    console.log('订餐平台下单成功, 新增订单ID: ', res.newId);
    saveOrderFile({
      id: res.newId,
      date: today,
    });
  }
}

exports.deleteOrder = async () => {
  const data = readOrderFile();
  if (!data || data.date !== today) {
    console.error('今日未下单！');
    return;
  }
  const res = await delOrder(data.id);
  if (res && res.retCode === 0) {
    console.log('删除成功: ', data.id);
    saveOrderFile({});
  }
}

exports.getTeamOrderList = async () => {
  const res = await queryTeamOrderList();
  if (!res || !res.length) {
    return [];
  }
  return res.map(i => i.food);
}