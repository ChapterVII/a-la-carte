const axios = require('../http');
const { today, meicanEndTime, getCommonHeaders } = require('../utils');

const BaseUrl = 'https://meican.com/preorder/api/v2.1/';

const PATH_MAP = {
  CalendaritemsList: 'calendaritems/list',
  RestaurantsList: 'restaurants/list',
  RestaurantsDetail: 'restaurants/show',
};

exports.queryCalendaritemsList = (headers, data) => {
  return axios({
    method: "get",
    headers: headers || getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.CalendaritemsList}`,
    params: {
      withOrderDetail: false,
      beginDate: today,
      endDate: today,
      ...data,
    },
  });
};

exports.queryRestaurantsList = (tabUniqueId) => {
  return axios({
    method: "get",
    headers: getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.RestaurantsList}`,
    params: {
      tabUniqueId,
      targetTime: meicanEndTime,
    },
  });
};

exports.queryRestaurantDetail = (data) => {
  const { tabUniqueId, restaurantUniqueId } = data;
  return axios({
    method: "get",
    headers: getCommonHeaders(),
    url: `${BaseUrl}${PATH_MAP.RestaurantsDetail}`,
    params: {
      tabUniqueId,
      restaurantUniqueId,
      targetTime: meicanEndTime,
    },
  });
}