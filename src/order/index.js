
const ora = require('ora');
const orderApi = require('../api/order');
const utils = require('../utils');

exports.getConfig = async (orderConfig) => {
  try {
    const res = await orderApi.queryConfig(orderConfig);
    if (res && res.retCode === 0 && res.gpclConfig && res.gpclConfig.fields) {
      const config = {version: res.gpclVersion};
      res.gpclConfig.fields.forEach(i => {
        if (utils.requiredConfigItems.includes(i.name)) {
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

exports.createOrder = (food) => {
  return new Promise(async (resolve) => {
    const config = utils.readConfigFile();
    if (!config || !config.order) {
      return;
    }
    const { name, company } = config.order;
    
    const spinner = ora('正在下单...');
    spinner.start();
    const res = await orderApi.addOrder({
      name,
      company,
      bookDate: utils.today,
      food,
    });
    if (res && res.retCode === 0) {
      console.log('res: ', res);
      utils.saveOrderFile({
        id: res.newId,
        date: utils.today,
      });
      spinner.succeed(`订餐平台下单成功, 新增订单ID: ${res.newId}`);
    } else {
      spinner.fail(`订餐平台下单失败! ${res && res.retMsg ? res.retMsg : ''}`);
    }
    setTimeout(() => {
      resolve();
    }, 3000);
  })
}

exports.deleteOrder = async () => {
  const data = utils.readOrderFile();
  if (!data || data.date !== utils.today) {
    console.error('今日未下单！');
    return;
  }
  const res = await orderApi.delOrder(data.id);
  if (res && res.retCode === 0) {
    console.log('删除成功: ', data.id);
    utils.saveOrderFile({});
    return true;
  }
  console.log(res && res.retMsg ? res.retMsg : '删除失败！');
  return;
}

exports.getTeamOrderList = async () => {
  const res = await orderApi.queryTeamOrderList();
  if (!res || !res.length) {
    return [];
  }
  console.log('getTeamOrderList: ', res);
  return res.map(i => ({
    food: i.food,
    name: i.name,
  }));
}