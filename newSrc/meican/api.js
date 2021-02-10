const axios = require('../http');
const UTILS = require('../utils');

const baseMeicanUrl = 'https://meican.com/preorder/api/v2.1';

async function baseMeicanRequest(options) {
  const config = UTILS.readConfigFile();
  if (!config || !config.menu) {
    console.error('未获取到配置文件！');
    return;
  }
  const { cookie, clientId, clientSecret } = config.menu;
  const { method, url, params, ...rest } = options;
  const _url = `${baseMeicanUrl}/${url}`;
  return axios({
    ...rest,
    method: method || 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie,
    },
    url: _url,
    params: {
      clientId,
      clientSecret,
      ...params,
    },
  });
}

const PATH_MAP = {
  CALENDARITEMS_LIST: 'calendaritems/list',
  RESTAURANTS_LIST: 'restaurants/list',
  RESTAURANTS_SHOW: 'restaurants/show',
  ORDERS_SHOW: 'orders/show',
  ORDERS_ADD: 'orders/add',
  ORDERS_DELETE: 'orders/delete'
};

exports.queryCalendaritemsList = () => {
  return baseMeicanRequest({
    url: PATH_MAP.CALENDARITEMS_LIST,
    params: {
      withOrderDetail: false,
      beginDate: utils.today,
      endDate: utils.today,
    },
  });
};

/**
 * @description 获取餐厅列表
 * @param {*} params.tabUniqueId 'calendaritems/list' res.dateList[0].calendarItemList[0].userTab.uniqueId
 * @param {*} params.targetTime 'calendaritems/list' res.dateList[0].calendarItemList[0].targetTime
 */
exports.queryRestaurantsList = (params) => {
  return baseMeicanRequest({
    url: PATH_MAP.RESTAURANTS_LIST,
    params,
  });
};

/**
 * @description 获取餐厅菜单
 * @param {*} params.tabUniqueId 'calendaritems/list' res.dateList[0].calendarItemList[0].userTab.uniqueId
 * @param {*} params.targetTime 'calendaritems/list' res.dateList[0].calendarItemList[0].targetTime
 * @param {*} params.restaurantUniqueId 'restaurants/list' res.restaurantList[i].uniqueId
 */
exports.queryRestaurantDetail = (params) => {
  return baseMeicanRequest({
    url: PATH_MAP.RESTAURANTS_SHOW,
    params,
  });
}

/**
 * @description 查看已下单菜品
 * @param {*} uniqueId 'calendaritems/list' res.dateList[0].calendarItemList[0].corpOrderUser.uniqueId
 */
exports.orderShow = (uniqueId) => {
  return baseMeicanRequest({
    url: PATH_MAP.ORDERS_SHOW,
    params: {
      uniqueId,
      type: 'CORP_ORDER',
      progressMarkdownSupport: true,
      x: new Date().getTime(),
    },
  });
};

/**
 * @description 下单
 * @param {*} tabUid 'calendaritems/list' res.dateList[0].calendarItemList[0].userTab.uniqueId
 * @param {*} addressUid 'calendaritems/list' res.dateList[0].calendarItemList[0].userTab.corp.addressList[0].uniqueId
 * @param {*} data {count: number, dishId: number}[]
 */
exports.addOrder = (tabUid, addressUid, dishes) => {
  return baseMeicanRequest({
    url: PATH_MAP.ORDERS_ADD,
    data: {
      tabUniqueId: tabUid,
      corpAddressRemark: '',
      corpAddressUniqueId: addressUid,
      userAddressUniqueId: addressUid,
      remarks: [],
      targetTime: moment(targetTime).format('YYYY-MM-DD HH:mm'),
      order: dishes,
    }
  });
};

/**
 * @description 取消并放回购物车
 * @param {*} uniqueId 'orders/show' res.uniqueId
 */
exports.deleteOrder = (uniqueId) => {
  return baseMeicanRequest({
    url: PATH_MAP.ORDERS_DELETE,
    data: {
      restoreCar: true,
      type: 'CORP_ORDER',
      uniqueId,
    },
  });
}

