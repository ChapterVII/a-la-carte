const axios = require('../http');
const utils =require('../utils');

exports.queryConfig = (orderConfig) => {
  if (!orderConfig) {
    const config = utils.readConfigFile();
    if (!config || !config.order) {
      return;
    }
    orderConfig = config.order;
  }
  const { baseUrl, commonPath } = orderConfig;
  return axios({
    method: "get",
    url: `${baseUrl}${commonPath}config`,
  });
};

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

exports.queryTeamOrderList = async () => {
  const res = await queryOrderList();
  if (res && res.list && res.list.length) {
    const admin = utils.readAdminFile();
    if (admin && admin.members) {
      const { members, dept} = admin;
      const names = members.map(m => m.name);
      return res.list.filter(i => Number(i.dept) === dept && names.includes(i.name));
    }
  }
  console.error('Get Team OrderList Faild!');
  return [];
};