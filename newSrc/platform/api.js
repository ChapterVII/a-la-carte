const axios = require('../http');
const UTILS = require('../utils');

async function basePlatformRequest(options) {
  const config = options.config || UTILS.readConfigFile();
  if (!config || !config.order) {
    console.error('未获取到配置文件！');
    return;
  }
  const { baseUrl, commonPath, version } = config.order;
  const { method, url, params, config, ...rest } = options;
  const _url = `${baseUrl}${commonPath}${url}`;
  return axios({
    ...rest,
    method: method || 'get',
    url: _url,
    params: {
      gpclVersion: version,
      ...params,
    },
  });
}

const PATH_MAP = {
  CONFIG: 'config',
  ADD: 'add',
  DELETE: 'delete',
  LIST: 'list',
};

// 查询内部订餐平台配置信息
exports.queryConfig = (config) => {
  return basePlatformRequest({
    method: "get",
    url: PATH_MAP.CONFIG,
    config,
  });
};

// 在内部订餐平台下单
exports.addOrder = (food) => {
  const config = UTILS.readConfigFile();
  if (!config || !config.order) {
    console.error('未获取到配置文件！');
    return;
  }
  const { area, dept, name, company } = config.order;
  return basePlatformRequest({
    method: "post",
    url: PATH_MAP.ADD,
    params: {
      area,
      dept,
      name,
      company,
      sourcePage: "add",
      bookDate: UTILS.today,
      food,
    },
  });
};

exports.delOrder = (id) => {
  return basePlatformRequest({
    url: PATH_MAP.DELETE,
    params: {
      id,
    },
  });
};

const queryOrderList = () => {
  return basePlatformRequest({
    url: PATH_MAP.LIST,
    params: {
      pageNum: 1,
      pageSize: 1000,
      bookDate__sd: UTILS.today,
      bookDate__ed: UTILS.today,
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