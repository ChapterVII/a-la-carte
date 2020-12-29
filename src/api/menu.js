const axios = require('../http');
const utils = require('../utils');

const BaseUrl = 'https://meican.com/preorder/api/v2.1/';

const PATH_MAP = {
  CalendaritemsList: 'calendaritems/list',
  RestaurantsList: 'restaurants/list',
  RestaurantsDetail: 'restaurants/show',
  OrderShow: 'orders/show',
};

exports.queryCalendaritemsList = () => {
  return axios({
    method: "get",
    headers: utils.getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.CalendaritemsList}`,
    params: {
      withOrderDetail: false,
      beginDate: utils.today,
      endDate: utils.today,
    },
  });
};

exports.queryRestaurantsList = (tabUniqueId) => {
  return axios({
    method: "get",
    headers: utils.getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.RestaurantsList}`,
    params: {
      tabUniqueId,
      targetTime: utils.meicanEndTime,
    },
  });
};

exports.queryRestaurantDetail = (data) => {
  const { tabUniqueId, restaurantUniqueId } = data;
  return axios({
    method: "get",
    headers: utils.getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.RestaurantsDetail}`,
    params: {
      tabUniqueId,
      restaurantUniqueId,
      targetTime: utils.meicanEndTime,
    },
  });
}

exports.orderShow = (uniqueId) => {
  const admin = utils.readAdminFile();
  if (!admin) return;
  return axios({
    method: "get",
    headers: utils.getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.OrderShow}`,
    params: {
      uniqueId,
      type: 'CORP_ORDER',
      progressMarkdownSupport: true,
      x: new Date().getTime(),
      client_id: admin.clientId,
      client_secret: admin.clientSecret,
    },
  });
};