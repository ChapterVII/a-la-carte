const axios = require('../http');
const { menu } = require('../../config');
const { today, meicanEndTime } = require('../utils');

const BaseUrl = 'https://meican.com/preorder/api/v2.1/';

const CommonHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'cookie': menu.cookie,
};

const PATH_MAP = {
  CalendaritemsList: 'calendaritems/list',
  RestaurantsList: 'restaurants/list',
  RestaurantsDetail: 'restaurants/show',
};

exports.queryCalendaritemsList = () => {
  return axios({
    method: "get",
    headers: CommonHeaders,
    url: `${BaseUrl}${PATH_MAP.CalendaritemsList}`,
    params: {
      withOrderDetail: false,
      beginDate: today,
      endDate: today,
    },
  });
};

exports.queryRestaurantsList = (tabUniqueId) => {
  return axios({
    method: "get",
    headers: CommonHeaders,
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
    headers: CommonHeaders,
    url: `${BaseUrl}${PATH_MAP.RestaurantsDetail}`,
    params: {
      tabUniqueId,
      restaurantUniqueId,
      targetTime: meicanEndTime,
    },
  });
}