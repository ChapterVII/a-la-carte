const axios = require('../http');
const menuApi = require('../api/menu');
const utils = require('../utils');

const getCalendarItem = async () => {
  const res = await menuApi.queryCalendaritemsList();
  if (res && res.dateList && res.dateList[0]) {
    const targetCalendarItem = res.dateList[0].calendarItemList;
    if (targetCalendarItem && targetCalendarItem[0]) {
      // console.log('获取到的tabUniqueId >>>> ', targetCalendarItem[0].userTab.uniqueId);
      return targetCalendarItem[0];
    }
  }
  console.error('Failed, CalendaritemsList Response>>>> \n', res);
  return;
}

const getTabUniqueId = async () => {
  const item = await getCalendarItem();
  return item.userTab ? item.userTab.uniqueId : '';
}

const getUniqueId = async () => {
  const item = await getCalendarItem();
  if (item.status === 'AVAILABLE') {
    console.log('还未下单！');
    return;
  }
  return item.corpOrderUser ? item.corpOrderUser.uniqueId : '';
}

const getRestaurantsList = async (tabUniqueId) => {
  const res = await menuApi.queryRestaurantsList(tabUniqueId);
  if (res && res.restaurantList && res.restaurantList.length) {
    // console.log('获取到的restaurantUniqueIds >>>> ', res.restaurantList.map(i => i.uniqueId));
    return res.restaurantList.map(i => i.uniqueId);
  }
  console.error('Failed, RestaurantsList Response>>>> \n', res);
  return;
}

const getRestaurantsMenus = (data) => new Promise(resolve => {
  const menuMap = {};
  const { tabUniqueId, restaurantUniqueIds } = data;
  axios.all(restaurantUniqueIds.map(restaurantUniqueId => {
    return menuApi.queryRestaurantDetail({tabUniqueId, restaurantUniqueId})
  })).then(axios.spread((...args) => {
    if (args && args.length) {
      args.forEach((arg) => {
        if (arg && arg.name && arg.dishList && arg.dishList.length) {
          const restaurantName = arg.name;
          const dishList = arg.dishList.filter(i =>i.isSection === false);
          if (dishList.length) {
            menuMap[restaurantName] = dishList.map(i => ({
              id: i.id,
              name: i.name,
            }));
          }
        }
      })
    }
    if (!Object.keys(menuMap).length) {
      console.error('getRestaurantsMenus Failed! Response>>> \n', args);
      resolve();
    } else {
      resolve(menuMap);
    }
  })).catch(e => {
    console.error(e);
    resolve();
  })
})

exports.getMenus = async () => {
  const tabUniqueId = await getTabUniqueId();
  if (!tabUniqueId) return;

  const restaurantUniqueIds = await getRestaurantsList(tabUniqueId);
  if (!restaurantUniqueIds) return;
  
  const menuMap = await getRestaurantsMenus({
    tabUniqueId,
    restaurantUniqueIds,
  });
  if (!menuMap) return;
  
  utils.saveMenuFile({
    date: utils.today,
    ...menuMap,
  });
  return menuMap;
}

exports.getOrderNum = async () => {
  const uniqueId = await getUniqueId();
  if (!uniqueId) return;
  const res = await menuApi.orderShow(uniqueId);
  let orderNum = 0;
  if (Array.isArray(res.restaurantItemList) && res.restaurantItemList.length) {
    res.restaurantItemList.forEach(i => {
      const dish = i.dishItemList;
      Array.isArray(dish) && dish.forEach(d => {
        orderNum += d.count;
      })
    });
  }
  return orderNum;
}