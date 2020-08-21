const axios = require('../http');
const { queryCalendaritemsList, queryRestaurantsList, queryRestaurantDetail } = require('../api/menu');
const { saveMenuFile, today } = require('../utils');

const getTabUniqueId = async () => {
  const res = await queryCalendaritemsList();
  if (res && res.dateList && res.dateList[0]) {
    const targetCalendarItem = res.dateList[0].calendarItemList;
    if (targetCalendarItem && targetCalendarItem[0] && targetCalendarItem[0].userTab) {
      console.log('获取到的tabUniqueId >>>> ', targetCalendarItem[0].userTab.uniqueId);
      return targetCalendarItem[0].userTab.uniqueId;
    }
  }
  console.error('Failed, CalendaritemsList Response>>>> \n', res);
  return;
}

const getRestaurantsList = async (tabUniqueId) => {
  const res = await queryRestaurantsList(tabUniqueId);
  if (res && res.restaurantList && res.restaurantList.length) {
    console.log('获取到的restaurantUniqueIds >>>> ', res.restaurantList.map(i => i.uniqueId));
    return res.restaurantList.map(i => i.uniqueId);
  }
  console.error('Failed, RestaurantsList Response>>>> \n', res);
  return;
}

const getRestaurantsMenus = (data) => new Promise(resolve => {
  const menuMap = {};
  const { tabUniqueId, restaurantUniqueIds } = data;
  axios.all(restaurantUniqueIds.map(restaurantUniqueId => {
    return queryRestaurantDetail({tabUniqueId, restaurantUniqueId})
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
  
  saveMenuFile({
    date: today,
    ...menuMap,
  });
  return menuMap;
}