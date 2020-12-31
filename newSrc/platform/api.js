const axios = require('../http');
const UTILS = require('../utils');

async function basePlatformRequest(params) {
  const config = UTILS.readConfigFile();
  if (!config || !config.order) {
    console.error('未获取到配置文件！');
    return;
  }
  const { baseUrl, commonPath } = config.order;
  const { url, ...rest } = params;
  const _url = `${baseUrl}${commonPath}${url}`;
  return axios({
    url: _url,
    ...rest,
  });
}

const PATH_MAP = {
  CONFIG: 'config',
  RestaurantsList: 'restaurants/list',
  RestaurantsDetail: 'restaurants/show',
  OrderShow: 'orders/show',
};

// 查询内部订餐平台配置信息
exports.queryConfig = () => {
  return basePlatformRequest({
    method: "get",
    url: PATH_MAP.CONFIG,
  });
};

// 在内部订餐平台下单
exports.addOrder = (data) => {
  const config = utils.readConfigFile();
  if (!config || !config.order) {
    return;
  }
  const { baseUrl, commonPath, area, dept, version } = config.order;
  return axios({
    method: "post",
    url: `${baseUrl}${commonPath}add`,
    params: {
      area,
      dept,
      gpclVersion: version,
      sourcePage: "add",
      ...data,
    },
  });
};

exports.delOrder = (id) => {
  const config = utils.readConfigFile();
  if (!config || !config.order) {
    return;
  }
  const { baseUrl, commonPath, version } = config.order;
  return axios({
    method: "get",
    url: `${baseUrl}${commonPath}delete`,
    params: {
      id,
      gpclVersion: version,
    },
  });
};

const queryOrderList = () => {
  const config = utils.readConfigFile();
  if (!config || !config.order) {
    return;
  }
  const { baseUrl, commonPath, version } = config.order;
  return axios({
    method: "get",
    url: `${baseUrl}${commonPath}list`,
    params: {
      pageNum: 1,
      pageSize: 1000,
      bookDate__sd: utils.today,
      bookDate__ed: utils.today,
      gpclVersion: version,
      sourcePage: 'list',
    },
  });
};

exports.queryOrderList = queryOrderList;

exports.queryTeamOrderList = async () => {
  const res = await queryOrderList();
  if (res && res.list && res.list.length) {
    return utils.filterTeamOrder(res.list);
  }
  console.error('Get Team OrderList Faild!');
  return [];
};