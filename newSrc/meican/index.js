const moment = require('moment');
const axios = require('../http');
const UTILS = require('../utils');
const MEICAN_API = require('./api');
export class Meican {
  constructor() {
    this.targetTime = '';
    this.status = '';
    this.tabUid = '';
    this.addressUid = '';
    this.restaurantUids = [];
    this.corpOrderUserUid = '';
    this.orderUid = '';
  }

  // 获取CalendarItem
  async getCalendarItem() {
    const res = await MEICAN_API.queryCalendaritemsList();
    if (res && res.dateList && res.dateList[0]) {
      const calendarItemList = res.dateList[0].calendarItemList;
      if (calendarItemList && calendarItemList[0]) {
        const {targetTime, userTab, status, corpOrderUser} = calendarItemList[0];
        this.targetTime = moment(targetTime).format('YYYY-MM-DD HH:mm');
        this.status = status;
        this.tabUid = userTab ? userTab.uniqueId : '';
        const addressList = userTab ? userTab.corp ? userTab.corp.addressList : [] : [];
        this.addressUid = addressList[0] || '';
        this.corpOrderUserUid = corpOrderUser ? corpOrderUser.uniqueId : '';
        return;
      }
    }
    console.error('Failed, CalendaritemsList Response>>>> \n', res);
    return;
  }

  // 获取餐厅uniqueId
  async getRestaurantsUniqueIds() {
    const res = await MEICAN_API.queryRestaurantsList({
      tabUniqueId: this.tabUid,
      targetTime: this.targetTime,
    });
    if (res && res.restaurantList && res.restaurantList.length) {
      this.restaurantUids = res.restaurantList.map(i => i.uniqueId);
      return;
    }
    console.error('Failed, RestaurantsList Response>>>> \n', res);
    return;
  }

  // 获取所有餐厅提供的菜品
  async getRestaurantsMenus() {
    const tabUniqueId = this.tabUid;
    const targetTime = this.targetTime;
    return new Promise(resolve => {
      axios.all(this.restaurantUids.map(restaurantUid => {
        return MEICAN_API.queryRestaurantDetail({
          tabUniqueId, 
          targetTime,
          restaurantUniqueId: restaurantUid,
        })
      })).then(axios.spread((...args) => {
        const menuMap = {};
        if (args && args.length) {
          args.forEach((arg) => {
            if (arg && arg.name && arg.dishList && arg.dishList.length) {
              const restaurantName = arg.name;
              const dishList = arg.dishList.filter(i =>i.isSection === false);
              if (dishList.length) {
                menuMap[restaurantName] = {
                  dishes: dishList.map(i => ({
                    id: i.id,
                    name: i.name,
                  })),
                  open: arg.open,
                };
              }
            }
          })
        }
        if (!Object.keys(menuMap).length) {
          console.error('getRestaurantsMenus Failed! Respose>>> \n', args);
          resolve();
        } else {
          resolve(menuMap);
        }
      })).catch(e => {
        console.error(e);
        resolve();
      })
    })
  }
  // 获取菜单
  async getTodayMenu() {
    await this.getCalendarItem();
    if (!this.tabUid) return;
  
    await this.getRestaurantsUniqueIds();
    if (!this.restaurantUids.length) return;
    
    const menuMap = await this.getRestaurantsMenus();
    if (!menuMap) return;
    
    UTILS.saveMenuFile({
      date: UTILS.today,
      ...menuMap,
    });

    return menuMap;
  }

  // 查看已下单菜品
  async getOrderedDishes() {
    if (this.status === 'AVAILABLE') return [];
    if (!this.corpOrderUserUid) {
      await this.getCalendarItem();
    }
    const res = await MEICAN_API.orderShow(this.corpOrderUserUid);
    if (res && res.uniqueId) {
      this.orderUid = res.uniqueId;
    }
    if (res && res.restaurantItemList && res.restaurantItemList.length) {
      const dishes = [];
      res.restaurantItemList.forEach(restaurant => {
        if (restaurant.dishItemList && restaurant.dishItemList.length) {
          restaurant.dishItemList.forEach(dishItem => {
            dishes.push({
              dishId: dishItem.dish ? dishItem.dish.id : undefined,
              count: dishItem.count,
            });
          })
        }
      })
      return dishes;
    }
    console.error('orderShow Failed! Respose>>> \n', res);
    return;
  }
  
  // 取消
  async deleteOrder() {
    if (!this.orderUid) {
      await this.getOrderedDishes();
    }
    const res = await MEICAN_API.deleteOrder(this.orderUid);
    if (res && res.status === 'SUCCESSFUL') {
      return;
    }
  }

  computeDishes(orderedDishes, addDishes, deleteDishes) {
    const dishes = orderedDishes && orderedDishes.length ? [...orderedDishes] : [];
    const dishMap = {};
    if (dishes.length) {
      dishes.forEach(d => {
        dishMap[d.dishId] = d.count;
      })
    }

    if (deleteDishes && deleteDishes.length) {
      deleteDishes.forEach(d => {
        const {dishId, count} = d;
        if (dishMap[dishId]) {
          dishMap[dishId] = dishMap[dishId] - count;
        }
      })
    }

    if (addDishes && addDishes.length) {
      addDishes.forEach(d => {
        const {dishId, count} = d;
        if (dishMap[dishId]) {
          dishMap[dishId] = dishMap[dishId] + count;
        } else {
          dishMap[dishId] = count;
        }
      })
    }
    
    return dishes;
  }

  // 下单
  async createOrder(dishesMap = {}) {
    let orderedDishes = await this.getOrderedDishes();
    if (!orderedDishes) return;
    const dishes = this.computeDishes(orderedDishes, dishesMap.add, dishesMap.delete);
    if (orderedDishes.length) {
      await this.deleteOrder();
    }
    const res = await MEICAN_API.addOrder(this.tabUid, this.addressUid, dishes);
    if (res && res.status === 'SUCCESSFUL') {
      return true;
    }
  }
}