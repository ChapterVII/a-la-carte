const UTILS = require('../utils');
const PLATFORM_API = require('./api');

export class Platform {
  constructor() {
  }

  // 获取内部订餐平台配置
  async getConfig() {
    try {
      const res = await PLATFORM_API.queryConfig();
      if (res && res.retCode === 0 && res.gpclConfig && res.gpclConfig.fields) {
        const config = {version: res.gpclVersion};
        res.gpclConfig.fields.forEach(i => {
          if (UTILS.requiredConfigItems.includes(i.name)) {
            config[i.name] = {
              label: i.label,
              options: i.dict.values,
            }
          }
        })
        return config;
      }
      console.error('Platform.queryConfig failed, response: \n', res);
      return;
    } catch (e) {
      console.error('Platform.getConfig error: \n', e);
    }
  }

  // 下单
  async createOrder(food) {
    try {
      const [validFoodName] = food.split('(');
      const res = await PLATFORM_API.addOrder(validFoodName);
      if (res && res.retCode === 0) {
        UTILS.saveOrderFile({
          id: res.newId,
          date: UTILS.today,
          food,
        });
        console.log(`订餐平台下单成功, 新增订单ID: ${res.newId}`);
        return true;
      }
      console.error('Platform.addOrder failed, response: \n', res);
      return;
    } catch (e) {
      console.error('Platform.createOrder error: \n', e);
    }
  }

  // 删除当日已下单
  async deleteOrder() {
    const data = UTILS.readOrderFile();
    if (!data || data.date !== UTILS.today) {
      console.error('今日未下单！');
      return;
    }
    try {
      const res = await PLATFORM_API.delOrder(data.id);
      if (res && res.retCode === 0) {
        console.log('删除成功: ', data.id);
        UTILS.saveOrderFile({});
        return true;
      }
      console.error('Platform.delOrder failed, response: \n', res);
      return;
    } catch (e) {
      console.error('Platform.deleteOrder error: \n', e);
    }
  }
  // 获取订餐列表
  async getOrderList() {
    try {
      const res = await PLATFORM_API.queryOrderList();
      if (res && res.list && res.list.length) {
        return res.list;
      }
      console.error('Platform.queryOrderList failed, response: \n', res);
      return;
    } catch (e) {
      console.error('Platform.getOrderList error: \n', e);
    }
  }

  // 从订单列表中过滤出team成员的
  filterTeamOrder(orderList) {
    const admin = UTILS.readAdminFile();
    if (admin && admin.members && Array.isArray(orderList)) {
      const { members, dept} = admin;
      const names = members.map(m => m.name);
      return orderList.filter(i => Number(i.dept) === dept && names.includes(i.name));
    }
    return [];
  }
  
  // 获取team订餐列表
  async getTeamOrderList() {
    try {
      const orderList = await this.getOrderList();
      if (!orderList || !orderList.length) {
        return [];
      }
      return this.filterTeamOrder(orderList).map(i => ({
        food: i.food,
        name: i.name,
      }));
    } catch (e) {
      console.error('Platform.getTeamOrderList error: \n', e);
    }
  }
}