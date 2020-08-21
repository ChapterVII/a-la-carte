const { queryConfig, addOrder, delOrder, queryTeamOrderList } = require('../api/order');
const { saveOrderFile, readOrderFile, today, requiredConfigItems, readConfigFile } = require('../utils');

exports.getConfig = async (orderConfig) => {
  try {
    const res = await queryConfig(orderConfig);
    if (res && res.retCode === 0 && res.gpclConfig && res.gpclConfig.fields) {
      // console.log('订餐平台配置查询成功: ', res);
      const config = {version: res.gpclVersion};
      res.gpclConfig.fields.forEach(i => {
        if (requiredConfigItems.includes(i.name)) {
          config[i.name] = {
            label: i.label,
            options: i.dict.values,
          }
        }
      })
      return config;
    }
    console.error('订餐平台配置查询失败: ', res);
  } catch(e) {
  }
  return;
}

exports.createOrder = async (food) => {
  const config = readConfigFile();
  if (!config || !config.order) {
    return;
  }
  const { name, company } = config.order;
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